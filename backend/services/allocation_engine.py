from sqlalchemy.orm import Session
from models.warehouse import Warehouse
from models.shelter import Shelter
from models.hospital import Hospital

def optimize_allocation(db: Session) -> list[dict]:
    warehouses = db.query(Warehouse).all()
    shelters = db.query(Shelter).filter(Shelter.priority_score > 0).order_by(Shelter.priority_score.desc()).all()
    hospitals = db.query(Hospital).filter(Hospital.priority_score > 0).order_by(Hospital.priority_score.desc()).all()

    allocations = []
    vehicle_id_counter = 1

    try:
        from ortools.linear_solver import pywraplp
        solver = pywraplp.Solver.CreateSolver('GLOP')
        if not solver:
            raise ImportError("Solver not created")
        
        # This MVP will use greedy fallback if OR-Tools is too complex for arbitrary logic
        # OR-Tools logic goes here if time permits, but greedy fallback is requested.
        raise ImportError("Use greedy fallback for now")

    except Exception as e:
        # Fallback greedy allocation
        destinations = [(s, 'shelter') for s in shelters] + [(h, 'hospital') for h in hospitals]
        destinations.sort(key=lambda x: x[0].priority_score, reverse=True)
        
        for dest, dtype in destinations:
            # Just find the first warehouse that has vehicles
            for wh in warehouses:
                if wh.vehicles > 0:
                    allocations.append({
                        "warehouse_id": wh.id,
                        "warehouse_name": wh.name,
                        "destination_id": dest.id,
                        "destination_name": dest.name,
                        "destination_type": dtype,
                        "resource_type": "mixed_supplies",
                        "quantity": 100, # arbitrary payload
                        "vehicle_id": vehicle_id_counter,
                        "priority_score": dest.priority_score
                    })
                    vehicle_id_counter += 1
                    wh.vehicles -= 1
                    break
                    
    return allocations
