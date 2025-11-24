from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# 1. Load the secret password from the .env file
load_dotenv()

# 2. Get the URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 3. Connect to the Cloud Database
# pool_pre_ping=True helps prevent connection drops
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)

# 4. Create a Session Factory (Each request gets a new session)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. Base class for database models (we will use this later)
Base = declarative_base()

# 6. Helper function to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()