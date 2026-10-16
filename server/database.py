from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

import os

import socket

# --- CONFIGURATION ---
# Supports PostgreSQL or SQLite fallback
DATABASE_URL = os.getenv("DATABASE_URL")

def is_postgres_available(host="localhost", port=5432, timeout=0.3):
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

def create_db_engine():
    global DATABASE_URL
    # 1. If explicit DATABASE_URL is set in environment, use it
    if DATABASE_URL:
        connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
        return create_engine(DATABASE_URL, connect_args=connect_args)

    # 2. Check if PostgreSQL is available on localhost:5432
    default_pg = "postgresql://postgres:saketh123@localhost:5432/idsdashboard"
    if is_postgres_available("localhost", 5432):
        try:
            pg_engine = create_engine(default_pg, pool_pre_ping=True)
            with pg_engine.connect():
                DATABASE_URL = default_pg
                print(f"[DB] Connected to PostgreSQL at {default_pg}")
                return pg_engine
        except Exception:
            pass

    # 3. Fallback to SQLite database file
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sqlite_path = os.path.join(base_dir, "idsdashboard.db")
    DATABASE_URL = f"sqlite:///{sqlite_path}"
    print(f"[DB] PostgreSQL not available on localhost:5432. Using SQLite: {sqlite_path}")
    return create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELS ---

class TrafficLog(Base):
    """Stores all processed traffic logs (Monitor Mode)"""
    __tablename__ = "traffic_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    src_ip = Column(String, index=True)
    country = Column(String)
    lat = Column(Float)
    lon = Column(Float)
    type = Column(String) # "DDoS", "SQL Injection", "Normal"
    confidence = Column(Float)
    destination_port = Column(Integer)
    action = Column(String) # "MONITOR"
    station = Column(String, nullable=True, default="ISTRAC-BLR")
    
    # Context Data Enhancements
    target_username = Column(String, nullable=True)
    burst_score = Column(Float, nullable=True)
    failed_attempts = Column(Integer, nullable=True)
    traffic_volume = Column(String, nullable=True)
    login_behavior = Column(String, nullable=True)

class AutoBlocked(Base):
    """Stores incidents automatically blocked by the system"""
    __tablename__ = "auto_blocked"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    src_ip = Column(String, index=True)
    country = Column(String)
    limit_reached = Column(String) # Reason, e.g., "Confidence > 95%"
    confidence = Column(Float)
    type = Column(String)
    action = Column(String, default="AUTO_BLOCKED")
    station = Column(String, nullable=True, default="ISTRAC-BLR")

class ManualReview(Base):
    """Stores incidents sent to Admin Portal for manual review"""
    __tablename__ = "manual_review"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    src_ip = Column(String, index=True)
    country = Column(String)
    type = Column(String)
    confidence = Column(Float)
    destination_port = Column(Integer)
    status = Column(String, default="PENDING") # PENDING, RESOLVED
    station = Column(String, nullable=True, default="ISTRAC-BLR")

    
    # Outcome
    action_taken = Column(String, nullable=True) # "MANUAL_BLOCK", "FALSE_POSITIVE"
    analyst_id = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    # Context Data Enhancements
    target_username = Column(String, nullable=True)
    burst_score = Column(Float, nullable=True)
    failed_attempts = Column(Integer, nullable=True)
    traffic_volume = Column(String, nullable=True)
    login_behavior = Column(String, nullable=True)

class ChatSession(Base):
    """Stores a conversation session between user and AI"""
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    title = Column(String, default="New Conversation")

class ChatMessage(Base):
    """Stores individual messages within a session"""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True) # Foreign Key relationship can be added if needed
    role = Column(String) # "user" or "ai"
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

# --- INITIALIZATION ---
def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
