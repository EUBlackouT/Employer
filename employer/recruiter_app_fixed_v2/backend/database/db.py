"""
Database configuration module for the Recruiter Application
Supports both SQLite (development) and PostgreSQL (production)
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Determine database URL based on environment
DB_TYPE = os.getenv('DB_TYPE', 'sqlite')

if DB_TYPE == 'postgresql':
    # PostgreSQL configuration
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'recruiter_app')
    
    SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    # SQLite configuration (default for development)
    DB_PATH = os.getenv('DB_PATH', os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'recruiter.db'))
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create engine with appropriate configuration
if DB_TYPE == 'sqlite':
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_recycle=3600,
        pool_pre_ping=True
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create scoped session for thread safety
db_session = scoped_session(SessionLocal)

# Base class for all models
Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    """Initialize the database by creating all tables"""
    # Import all models to ensure they are registered with Base
    from ..models.models import Applicant, Skill, Certification, JobPosition, JobRequirement, User
    
    # Create tables
    Base.metadata.create_all(bind=engine)

def get_db_session():
    """Get a new database session"""
    return SessionLocal()

def close_db_session(session):
    """Close a database session"""
    session.close()
