from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# 1. Load env vars from .env file (only for local dev)
load_dotenv()

# 2. Get the URL from Environment Variables
# PRIORITY: Render Dashboard > .env file > Default (sqlite local)
# This fallback ensures your app NEVER crashes due to a missing URL.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sentinel.db")

# 3. Create the Engine
# "check_same_thread": False is REQUIRED for SQLite, but ignored by Postgres.
# We add it just in case you fall back to SQLite.
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=connect_args,
    pool_pre_ping=True
)

# 4. Session Factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. Base Class
Base = declarative_base()

# 6. Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()