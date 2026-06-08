from sqlalchemy import Column, Integer, String, Float, Boolean
from database import Base

class BlockedRoad(Base):
    __tablename__ = "blocked_roads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    start_lat = Column(Float)
    start_lng = Column(Float)
    end_lat = Column(Float)
    end_lng = Column(Float)
    reason = Column(String)
    active = Column(Boolean, default=True)
