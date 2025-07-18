from sqlalchemy import create_engine
from database.models import Base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# get the db URL for prod, default to SQLite3 for dev
DATABASE_URL = os.getenv('DATABASE_URL_PROD', 'sqlite:///users.db')

# fix for PostgreSQL URL format
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# this creates a database file locally called users.db
engine = create_engine(DATABASE_URL)

# creating a factory to create new sessions on demand in our app.py
SessionLocal = sessionmaker(bind=engine)

# create all tables in the engine
Base.metadata.create_all(engine)