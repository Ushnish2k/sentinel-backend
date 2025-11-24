from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, engine, Base
# IMPORTANT: We must import the model so SQLAlchemy knows it exists!
from app.models import sentiment

# This line creates the tables in the cloud database automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sentinel API", version="1.0.0")

@app.get("/")
def read_root():
    return {"status": "active", "system": "Sentinel v1"}

@app.get("/api/v1/db-test")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Database connected successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# New Endpoint: Check if table exists
@app.post("/api/v1/create-test-data")
def create_test_entry(db: Session = Depends(get_db)):
    # Create a fake entry
    test_entry = sentiment.SentimentResult(
        text="I love this new product! It's amazing.",
        sentiment="Positive",
        score=0.99,
        source="Twitter Test"
    )
    db.add(test_entry)
    db.commit()
    db.refresh(test_entry)
    return {"status": "success", "data": test_entry}