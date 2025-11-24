from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

app = FastAPI(title="Sentinel API", version="1.0.0")

@app.get("/")
def read_root():
    return {"status": "active", "system": "Sentinel v1"}

# This is the test button!
@app.get("/api/v1/db-test")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        # Run a simple SQL command "SELECT 1" to check connection
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Database connected successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}