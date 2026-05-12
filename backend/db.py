"""
backend/db.py
─────────────────────────────────────────────────────────
SQLAlchemy engine + session factory.
Reads DATABASE_URL from environment — never hard-coded.

Usage in FastAPI routers:
    from backend.db import get_db
    ...
    def my_endpoint(db: Session = Depends(get_db)):
        ...
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

DATABASE_URL: str = os.environ["DATABASE_URL"]
# Example: postgresql://aim_user:aim_pass@localhost:5432/aim_db

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # reconnect on dropped connections
    echo=False,           # set True locally to see SQL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency — yields a DB session and closes it after the request."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
