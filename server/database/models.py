from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.ext.declarative import declarative_base
import enum
import os
from dotenv import load_dotenv

# this is the base class for all the tables
Base = declarative_base()
load_dotenv()

class UserType(enum.Enum):
    FREE = "FREE"
    PAID = "PAID"

class User(Base):
    __tablename__ = 'User'
    email = Column(String, primary_key=True, nullable=False, unique=True)
    password = Column(String, nullable=False)
    dj_name = Column(String)
    curr_session_id = Column(Integer)
    user_type = Column(Enum(UserType))
