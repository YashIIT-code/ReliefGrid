import json
import math
from typing import Optional

from sqlalchemy.orm import Session

from models.shelter import Shelter
from models.hospital import Hospital
from models.sos_request import SOSRequest
from models.disaster_zone import DisasterZone
from models.warehouse import Warehouse


# ---------------------------------------------------------------------------
# Haversine helper
# ---------------------------------------------------------------------------
def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance in kilometres between two points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ---------------------------------------------------------------------------
# Shelter / Hospital priority (unchanged)
# ---------------------------------------------------------------------------
def calculate_shelter_priority(shelter: Shelter) -> tuple[float, str]:
    people_factor = min(shelter.people_count / 500, 1.0) * 100

    food_ratio = shelter.food_stock / max(shelter.people_count, 1)
    food_shortage = max(0, 1 - food_ratio / 0.5) * 100  # Critical if < 0.5 ratio

    water_ratio = shelter.water_stock / max(shelter.people_count, 1)
    water_shortage = max(0, 1 - water_ratio / 0.3) * 100

    score = people_factor * 0.3 + max(food_shortage, water_shortage) * 0.4 + (100 if shelter.medicine_stock < 10 else 0) * 0.3
    score = min(max(score, 0), 100) # Clamp 0-100

    explanation_parts = []
    if people_factor > 60:
        explanation_parts.append(f"High capacity ({shelter.people_count} people).")
    if food_shortage > 50:
        explanation_parts.append("Food shortage predicted within 6 hours.")
    if water_shortage > 50:
        explanation_parts.append("Severe water shortage.")
    if shelter.medicine_stock < 10:
        explanation_parts.append("Critical medicine shortage.")

    explanation = " ".join(explanation_parts) if explanation_parts else "Resources stable."

    return float(score), explanation

def calculate_hospital_priority(hospital: Hospital) -> tuple[float, str]:
    oxygen_factor = max(0, 1 - hospital.oxygen_available / 50) * 100
    icu_factor = max(0, 1 - hospital.icu_beds / 20) * 100
    blood_factor = max(0, 1 - hospital.blood_units / 100) * 100

    score = oxygen_factor * 0.4 + icu_factor * 0.3 + blood_factor * 0.2 + (100 if hospital.ambulances < 2 else 0) * 0.1
    score = min(max(score, 0), 100)

    explanation_parts = []
    if oxygen_factor > 80:
        explanation_parts.append(f"Critical: Only {hospital.oxygen_available} oxygen units available.")
    if icu_factor > 80:
        explanation_parts.append("ICU beds nearly full.")
    if blood_factor > 80:
        explanation_parts.append("Low blood reserves.")
    if hospital.ambulances < 2:
        explanation_parts.append("Ambulance shortage.")

    explanation = " ".join(explanation_parts) if explanation_parts else "Normal operations."

    return float(score), explanation


# ---------------------------------------------------------------------------
# Impact-zone lookup
# ---------------------------------------------------------------------------
def _find_nearest_impact_zone(
    lat: float, lng: float, db: Optional[Session]
) -> tuple[Optional[float], Optional[str]]:
    """Return (distance_km, zone_name) for the nearest disaster zone.

    Prefers active zones; falls back to any zone if none are active.
    Returns (None, None) when no zones exist.
    """
    if db is None:
        return None, None

    zones = db.query(DisasterZone).all()
    if not zones:
        return None, None

    def _zone_centre(zone: DisasterZone) -> tuple[float, float]:
        try:
            pts = json.loads(zone.bounds_json)
            avg_lat = sum(p[0] for p in pts) / len(pts)
            avg_lng = sum(p[1] for p in pts) / len(pts)
            return avg_lat, avg_lng
        except Exception:
            return 0.0, 0.0

    active = [z for z in zones if z.active]
    pool = active if active else zones

    best_dist: Optional[float] = None
    best_name: Optional[str] = None
    for z in pool:
        clat, clng = _zone_centre(z)
        d = _haversine_km(lat, lng, clat, clng)
        if best_dist is None or d < best_dist:
            best_dist = d
            best_name = z.name

    return (round(best_dist, 1) if best_dist is not None else None, best_name)


# ---------------------------------------------------------------------------
# Warehouse lookup
# ---------------------------------------------------------------------------
def _find_nearest_warehouse(
    lat: float, lng: float, db: Optional[Session]
) -> tuple[Optional[int], Optional[str], Optional[float], Optional[int], Optional[str]]:
    """Return (id, name, distance_km, food_supply, food_stock_status).

    Prefers warehouses with vehicles > 0 AND food_supply > 0.
    Falls back to nearest known warehouse otherwise.
    Returns all-None when no warehouses exist.
    """
    if db is None:
        return None, None, None, None, None

    warehouses = db.query(Warehouse).all()
    if not warehouses:
        return None, None, None, None, None

    suitable = [w for w in warehouses if w.vehicles > 0 and w.food_supply > 0]
    pool = suitable if suitable else warehouses

    best: Optional[Warehouse] = None
    best_dist: Optional[float] = None
    for w in pool:
        d = _haversine_km(lat, lng, w.lat, w.lng)
        if best_dist is None or d < best_dist:
            best_dist = d
            best = w

    if best is None:
        return None, None, None, None, None

    # Food-stock status
    if best.food_supply == 0:
        food_status = "OUT_OF_STOCK"
    elif best.food_supply < 200:
        food_status = "LOW"
    else:
        food_status = "ADEQUATE"

    return (
        best.id,
        best.name,
        round(best_dist, 1) if best_dist is not None else None,
        best.food_supply,
        food_status,
    )


# ---------------------------------------------------------------------------
# ETA calculation
# ---------------------------------------------------------------------------
def _estimate_delivery_minutes(warehouse_distance_km: Optional[float]) -> Optional[int]:
    """Transparent MVP estimate: 10-min loading + ceil(dist/30*60) travel."""
    if warehouse_distance_km is None:
        return None
    loading = 10
    travel = math.ceil(warehouse_distance_km / 30 * 60)
    return loading + travel


# ---------------------------------------------------------------------------
# Shared SOS risk calculation (extended)
# ---------------------------------------------------------------------------
def calculate_sos_risk(
    category: str,
    severity: int,
    description: str,
    affected_people: int = 0,
    lat: float = 0.0,
    lng: float = 0.0,
    db: Optional[Session] = None,
) -> dict:
    """Shared risk calculation used by both assess and dispatch endpoints.

    Returns a dict with risk fields plus logistics data points.
    """
    # --- base score (preserved) ---
    severity_score = severity * 20  # 1-5 -> 20-100
    category_weight = {
        'rescue': 1.0,
        'ambulance': 0.95,
        'medical': 0.95,
        'fire': 0.9,
        'medicine': 0.85,
        'food': 0.7,
        'shelter': 0.6,
    }
    weight = category_weight.get(category, 0.5)
    base_score = severity_score * weight

    # --- impact-zone lookup ---
    distance_from_impact_km, nearest_impact_zone = _find_nearest_impact_zone(lat, lng, db)

    # --- warehouse lookup ---
    (
        nearest_warehouse_id,
        nearest_warehouse_name,
        warehouse_distance_km,
        food_stock_units,
        food_stock_status,
    ) = _find_nearest_warehouse(lat, lng, db)

    # --- ETA ---
    estimated_delivery_minutes = _estimate_delivery_minutes(warehouse_distance_km)

    # --- bonus contributions ---
    affected_people_bonus = min(affected_people / 500, 1.0) * 15

    if distance_from_impact_km is not None:
        distance_bonus = max(0, 1 - distance_from_impact_km / 20) * 10
    else:
        distance_bonus = 0.0

    score = min(max(base_score + affected_people_bonus + distance_bonus, 0), 100)

    # --- risk category (preserved thresholds) ---
    if score >= 80:
        risk_category = "CRITICAL"
    elif score >= 60:
        risk_category = "HIGH"
    elif score >= 30:
        risk_category = "MEDIUM"
    else:
        risk_category = "LOW"

    # --- factors ---
    factors: list[str] = []
    factors.append(f"Severity level is {severity}")
    category_labels = {
        'rescue': 'Search & Rescue',
        'medical': 'Medical / Ambulance',
        'ambulance': 'Ambulance',
        'fire': 'Fire Emergency',
        'food': 'Food & Water',
        'medicine': 'Medicine',
        'shelter': 'Shelter',
    }
    factors.append(f"{category_labels.get(category, category.capitalize())} emergency category")
    if severity >= 4:
        factors.append("Immediate response may be required")
    if affected_people > 0:
        factors.append(f"{affected_people} people affected")
    if distance_from_impact_km is not None and nearest_impact_zone:
        factors.append(
            f"{distance_from_impact_km} km from {nearest_impact_zone} impact area"
        )
    elif distance_from_impact_km is None:
        factors.append("Impact distance unavailable")
    if nearest_warehouse_name and warehouse_distance_km is not None:
        factors.append(f"Nearest warehouse is {warehouse_distance_km} km away")
    if estimated_delivery_minutes is not None:
        factors.append(f"Estimated delivery is {estimated_delivery_minutes} minutes")
    if food_stock_status and food_stock_units is not None:
        factors.append(
            f"Food stock is {food_stock_status} at {food_stock_units:,} units"
        )
    if description and len(description) > 100:
        factors.append("Detailed incident description provided")

    # --- explanation ---
    if risk_category == "CRITICAL":
        explanation = "Immediate response risk detected."
    elif risk_category == "HIGH":
        explanation = "High urgency — timely dispatch recommended."
    elif risk_category == "MEDIUM":
        explanation = "Moderate risk — standard dispatch procedures apply."
    else:
        explanation = "Low risk — routine handling appropriate."

    # --- recommended action ---
    action_map = {
        "CRITICAL": "Prioritize immediate dispatch review.",
        "HIGH": "Escalate for prompt dispatch.",
        "MEDIUM": "Schedule dispatch following standard protocol.",
        "LOW": "Queue for routine dispatch.",
    }
    recommended_action = action_map[risk_category]

    # Append food-stock operational warning if applicable
    if food_stock_status in ("OUT_OF_STOCK", "LOW"):
        recommended_action += (
            " Food supplies at the nearest warehouse may be insufficient;"
            " check another warehouse before dispatch."
        )

    return {
        "priority_score": float(score),
        "risk_category": risk_category,
        "factors": factors,
        "explanation": explanation,
        "recommended_action": recommended_action,
        # --- logistics data points ---
        "affected_people": affected_people,
        "distance_from_impact_km": distance_from_impact_km,
        "nearest_impact_zone": nearest_impact_zone,
        "nearest_warehouse_id": nearest_warehouse_id,
        "nearest_warehouse_name": nearest_warehouse_name,
        "warehouse_distance_km": warehouse_distance_km,
        "estimated_delivery_minutes": estimated_delivery_minutes,
        "food_stock_units": food_stock_units,
        "food_stock_status": food_stock_status if food_stock_status else "UNAVAILABLE",
    }


def calculate_sos_priority(sos_request: SOSRequest, db: Optional[Session] = None) -> tuple[float, str]:
    """Existing interface kept intact — delegates to shared function."""
    result = calculate_sos_risk(
        category=sos_request.category,
        severity=sos_request.severity,
        description=sos_request.description,
        affected_people=sos_request.affected_people or 0,
        lat=sos_request.lat or 0.0,
        lng=sos_request.lng or 0.0,
        db=db,
    )
    return result["priority_score"], result["explanation"]
