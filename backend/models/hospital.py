from sqlalchemy import Column, Integer, String, Float
from database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    oxygen_available = Column(Integer, default=0)
    blood_units = Column(Integer, default=0)
    icu_beds = Column(Integer, default=0)
    ambulances = Column(Integer, default=0)
    contact_name = Column(String, nullable=True)
    priority_score = Column(Float, default=0.0)
