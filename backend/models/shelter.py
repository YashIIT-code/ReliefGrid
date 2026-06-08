from sqlalchemy import Column, Integer, String, Float
from database import Base

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    people_count = Column(Integer, default=0)
    food_stock = Column(Integer, default=0)
    water_stock = Column(Integer, default=0)
    blankets = Column(Integer, default=0)
    medicine_stock = Column(Integer, default=0)
    contact_name = Column(String, nullable=True)
    priority_score = Column(Float, default=0.0)
