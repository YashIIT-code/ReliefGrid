from models.shelter import Shelter
from models.hospital import Hospital
from models.sos_request import SOSRequest

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

def calculate_sos_risk(category: str, severity: int, description: str) -> dict:
    """Shared risk calculation used by both assess and dispatch endpoints.

    Returns a dict with priority_score, risk_category, factors,
    explanation, and recommended_action.
    """
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
    score = severity_score * weight
    score = min(max(score, 0), 100)

    # --- risk category ---
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

    return {
        "priority_score": float(score),
        "risk_category": risk_category,
        "factors": factors,
        "explanation": explanation,
        "recommended_action": recommended_action,
    }


def calculate_sos_priority(sos_request: SOSRequest) -> tuple[float, str]:
    """Existing interface kept intact — delegates to shared function."""
    result = calculate_sos_risk(
        category=sos_request.category,
        severity=sos_request.severity,
        description=sos_request.description,
    )
    return result["priority_score"], result["explanation"]
