from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.warehouse import Warehouse
from schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseResponse

router = APIRouter(prefix="/api/warehouses", tags=["warehouses"])

@router.get("/", response_model=list[WarehouseResponse])
def get_warehouses(db: Session = Depends(get_db)):
    return db.query(Warehouse).all()

@router.get("/{id}", response_model=WarehouseResponse)
def get_warehouse(id: int, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse

@router.post("/", response_model=WarehouseResponse)
def create_warehouse(warehouse: WarehouseCreate, db: Session = Depends(get_db)):
    db_warehouse = Warehouse(**warehouse.model_dump())
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse

@router.put("/{id}", response_model=WarehouseResponse)
def update_warehouse(id: int, warehouse_update: WarehouseUpdate, db: Session = Depends(get_db)):
    db_warehouse = db.query(Warehouse).filter(Warehouse.id == id).first()
    if not db_warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    update_data = warehouse_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_warehouse, key, value)
        
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse

@router.delete("/{id}")
def delete_warehouse(id: int, db: Session = Depends(get_db)):
    db_warehouse = db.query(Warehouse).filter(Warehouse.id == id).first()
    if not db_warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    db.delete(db_warehouse)
    db.commit()
    return {"message": "Deleted"}
