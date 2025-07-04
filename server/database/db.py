from sqlalchemy import create_engine
from database.models import Base
from sqlalchemy.orm import sessionmaker

# this creates a database file locally called users.db
engine = create_engine('sqlite:///users.db')

# creating a factory to create new sessions on demand in our app.py
SessionLocal = sessionmaker(bind=engine)

# create all tables in the engine
Base.metadata.create_all(engine)