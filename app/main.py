from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text as sql_text
from contextlib import asynccontextmanager
from app.database import get_db, engine, Base
from app.models import sentiment
from app.services.ai_engine import analyze_text, load_model

# 1. LIFESPAN: This is the modern way to run startup tasks in FastAPI
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load the AI Model
    load_model()
    yield
    # Shutdown: (Cleanup if needed, we have none)

# 2. Initialize App with Lifespan
Base.metadata.create_all(bind=engine)
app = FastAPI(title="Sentinel API", version="1.0.0", lifespan=lifespan)

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

# 3. NEW ENDPOINT: The AI Analyzer
@app.post("/api/v1/analyze")
def analyze_sentiment(text: str, db: Session = Depends(get_db)):
    # A. Run AI Analysis
    ai_result = analyze_text(text)
    
    # B. Save result to Database (so we have a history)
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