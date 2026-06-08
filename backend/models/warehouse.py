from sqlalchemy import Column, Integer, String, Float
from database import Base

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    food_supply = Column(Integer, default=0)
    water_supply = Column(Integer, default=0)
    blankets = Column(Integer, default=0)
    medicine = Column(Integer, default=0)
    vehicles = Column(Integer, default=0)
