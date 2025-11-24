from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text as sql_text, func
from contextlib import asynccontextmanager
from app.database import get_db, engine, Base
from app.models import sentiment
from app.services.ai_engine import analyze_text, load_model
from app.services.generator import generate_data

# 1. LIFESPAN: Handles startup tasks (Loading the AI)
@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield

# 2. APP INIT: Create tables & Start App
Base.metadata.create_all(bind=engine)
app = FastAPI(title="Sentinel API", version="1.0.0", lifespan=lifespan)

# --- CORS (Essential for Frontend) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "active", "system": "Sentinel v1"}

@app.get("/api/v1/db-test")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        db.execute(sql_text("SELECT 1"))
        return {"status": "success", "message": "Database connected successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/v1/analyze")
def analyze_sentiment(text: str, db: Session = Depends(get_db)):
    """
    Manually input text to be analyzed by the AI.
    """
    ai_result = analyze_text(text)
    
    db_entry = sentiment.SentimentResult(
        text=text,
        sentiment=ai_result['label'],
        score=ai_result['score'],
        source="Manual Input"
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    return {"status": "success", "ai_analysis": ai_result, "saved_id": db_entry.id}

@app.post("/api/v1/generate-data")
def populate_db(count: int = 5, db: Session = Depends(get_db)):
    """
    Generates fake social media posts and runs them through the AI.
    """
    num_created = generate_data(db, count)
    return {"status": "success", "message": f"Generated {num_created} AI-analyzed posts."}

@app.get("/api/v1/history")
def get_history(db: Session = Depends(get_db)):
    """
    Fetch the last 50 analyzed posts (Increased from 10 for better demo)
    """
    # UPDATED: Limit increased to 50 so Filtering works better
    history = db.query(sentiment.SentimentResult).order_by(sentiment.SentimentResult.id.desc()).limit(50).all()
    return history

@app.get("/api/v1/stats")
def get_stats(db: Session = Depends(get_db)):
    """
    Groups data by sentiment and counts them.
    """
    results = db.query(
        sentiment.SentimentResult.sentiment, 
        func.count(sentiment.SentimentResult.id)
    ).group_by(sentiment.SentimentResult.sentiment).all()
    
    stats = [{"name": row[0], "value": row[1]} for row in results]
    return stats

@app.delete("/api/v1/clear")
def clear_history(db: Session = Depends(get_db)):
    """
    Wipes all data from the database. Use with caution!
    """
    count = db.query(sentiment.SentimentResult).delete()
    db.commit()
    return {"status": "success", "message": f"Deleted {count} records."}