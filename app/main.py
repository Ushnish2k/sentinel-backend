from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # <--- Essential for Frontend
from sqlalchemy.orm import Session
from sqlalchemy import text as sql_text
from contextlib import asynccontextmanager
from app.database import get_db, engine, Base
from app.models import sentiment
from app.services.ai_engine import analyze_text, load_model
from app.services.generator import generate_data

# 1. LIFESPAN: Handles startup tasks (Loading the AI)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load the AI Model into memory
    load_model()
    yield
    # Shutdown: Clean up resources (if any)

# 2. APP INIT: Create tables & Start App
Base.metadata.create_all(bind=engine)
app = FastAPI(title="Sentinel API", version="1.0.0", lifespan=lifespan)

# --- NEW: ALLOW FRONTEND CONNECTION ---
# This is known as CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all connections (Safe for dev, restrict for production)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],
)
# --------------------------------------

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
    # A. Run AI Analysis
    ai_result = analyze_text(text)
    
    # B. Save result to Database
    db_entry = sentiment.SentimentResult(
        text=text,
        sentiment=ai_result['label'],
        score=ai_result['score'],
        source="Manual API Input"
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

# 5. NEW ENDPOINT: Get Recent History (The Frontend needs this!)
@app.get("/api/v1/history")
def get_history(db: Session = Depends(get_db)):
    """
    Fetch the last 10 analyzed posts from the database.
    """
    # Query the table, order by newest first, limit to 10
    history = db.query(sentiment.SentimentResult).order_by(sentiment.SentimentResult.id.desc()).limit(10).all()
    return history