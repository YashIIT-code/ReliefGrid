from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models.disaster_zone import DisasterZone
from models.shelter import Shelter
from models.hospital import Hospital
from models.blocked_road import BlockedRoad
from models.sos_request import SOSRequest
from services.priority_engine import calculate_shelter_priority, calculate_hospital_priority, calculate_sos_priority
from services.allocation_engine import optimize_allocation

router = APIRouter(prefix="/api/simulation", tags=["simulation"])

simulation_state = {
    "running": False,
    "current_step": 0,
    "steps": [],
    "completed": False
}

def log_step(step_number: int, title: str, description: str, data: dict):
    simulation_state["steps"].append({
        "step_number": step_number,
        "title": title,
        "description": description,
        "timestamp": datetime.utcnow().isoformat(),
        "data": data
    })

@router.post("/start")
def start_simulation(db: Session = Depends(get_db)):
    global simulation_state
    
    # Simple reset
    simulation_state = {
        "running": True,
        "current_step": 0,
        "steps": [],
        "completed": False
    }
    
    try:
        # Step 1: Activate Disaster Zone
        zone = db.query(DisasterZone).filter(DisasterZone.name == 'Zone A').first()
        if zone:
            zone.active = True
            zone.zone_type = 'flood'
            zone.severity = 4
            db.commit()
            log_step(1, "Disaster Zone Activated", "Flood reported in Zone A", {"zone_id": zone.id})
            
        # Step 2: Update Shelter
        shelter = db.query(Shelter).filter(Shelter.name == 'Shelter Alpha').first()
        if shelter:
            shelter.people_count = 300
            shelter.food_stock = 50
            shelter.water_stock = 20
            db.commit()
            log_step(2, "Shelter Capacity Surge", "Shelter Alpha received influx of evacuees", {"shelter_id": shelter.id})
            
        # Step 3: Hospital Shortage
        hospital = db.query(Hospital).filter(Hospital.name == 'Hospital Beta').first()
        if hospital:
            hospital.oxygen_available = 2
            db.commit()
            log_step(3, "Critical Hospital Shortage", "Hospital Beta oxygen levels critical", {"hospital_id": hospital.id})
            
        # Step 4: Blocked Road
        road = db.query(BlockedRoad).filter(BlockedRoad.name == 'Road X').first()
        if road:
            road.active = True
            db.commit()
            log_step(4, "Infrastructure Damage", "Road X blocked due to flooding", {"road_id": road.id})
            
        # Step 5: SOS Requests
        sos1 = SOSRequest(name='Ramesh Kumar', lat=19.08, lng=72.87, category='food', severity=4, description='Trapped in building')
        sos2 = SOSRequest(name='Priya Singh', lat=19.07, lng=72.86, category='rescue', severity=5, description='Water entering house')
        sos3 = SOSRequest(name='Ahmed Khan', lat=19.06, lng=72.85, category='medicine', severity=3, description='Need insulin')
        db.add_all([sos1, sos2, sos3])
        db.commit()
        log_step(5, "Incoming SOS Alerts", "Citizens requesting emergency assistance", {"count": 3})
        
        # Step 6: Recalculate Priorities
        for s in db.query(Shelter).all():
            s.priority_score, _ = calculate_shelter_priority(s)
        for h in db.query(Hospital).all():
            h.priority_score, _ = calculate_hospital_priority(h)
        for req in db.query(SOSRequest).all():
            req.priority_score, req.priority_explanation = calculate_sos_priority(req)
        db.commit()
        log_step(6, "AI Priority Calculation", "Re-evaluated all entity priority scores", {})
        
        # Step 7: Run Allocation
        allocations = optimize_allocation(db)
        log_step(7, "Resource Allocation Optimized", "Generated dispatch routes for warehouses", {"allocations_count": len(allocations)})
        
        simulation_state["completed"] = True
        simulation_state["running"] = False
        
        return {"status": "Simulation completed", "state": simulation_state}
        
    except Exception as e:
        simulation_state["running"] = False
        simulation_state["completed"] = False
        return {"error": str(e)}

@router.post("/reset")
def reset_simulation():
    global simulation_state
    simulation_state = {
        "running": False,
        "current_step": 0,
        "steps": [],
        "completed": False
    }
    # Reseeding will require a script to be called. For simplicity, we just clear the state here.
    return {"status": "State reset"}

@router.get("/status")
def get_simulation_status():
    return simulation_state
