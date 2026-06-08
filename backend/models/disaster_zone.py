from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class DisasterZone(Base):
    __tablename__ = "disaster_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    zone_type = Column(String) # flood/earthquake/cyclone
    bounds_json = Column(String) # JSON string of polygon coordinates
    severity = Column(Integer) # 1-5
    active = Column(Boolean, default=False)
