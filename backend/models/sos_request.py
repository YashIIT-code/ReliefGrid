from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from database import Base

class SOSRequest(Base):
    __tablename__ = "sos_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    category = Column(String) # food/rescue/medicine/shelter/ambulance
    description = Column(String)
    severity = Column(Integer) # 1-5
    status = Column(String, default="pending")
    priority_score = Column(Float, default=0.0)
    priority_explanation = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- New fields for logistics data points ---
    affected_people = Column(Integer, default=0)
    distance_from_impact_km = Column(Float, nullable=True)
    nearest_impact_zone = Column(String, nullable=True)
    nearest_warehouse_id = Column(Integer, nullable=True)
    nearest_warehouse_name = Column(String, nullable=True)
    warehouse_distance_km = Column(Float, nullable=True)
    estimated_delivery_minutes = Column(Integer, nullable=True)
    food_stock_units = Column(Integer, nullable=True)
    food_stock_status = Column(String, nullable=True)
