from sqlalchemy import Column, Integer, String, Float, Boolean
from database import Base

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    available = Column(Boolean, default=True)
    skills = Column(String, nullable=True)
    phone = Column(String, nullable=True)
