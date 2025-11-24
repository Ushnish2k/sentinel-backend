from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base

class SentimentResult(Base):
    # This tells SQLAlchemy the name of the table in the database
    __tablename__ = "sentiment_results"

    # These are the columns
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, index=True)  # The social media post content
    sentiment = Column(String)         # "Positive", "Negative", "Neutral"
    score = Column(Float)              # AI Confidence Score (e.g., 0.95)
    source = Column(String)            # "Twitter", "Reddit", "News"
    created_at = Column(DateTime(timezone=True), server_default=func.now())