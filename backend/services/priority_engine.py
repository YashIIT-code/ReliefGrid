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

def calculate_sos_priority(sos_request: SOSRequest) -> tuple[float, str]:
    severity_score = sos_request.severity * 20  # 1-5 -> 20-100
    category_weight = {'rescue': 1.0, 'ambulance': 0.95, 'medicine': 0.85, 'food': 0.7, 'shelter': 0.6}
    
    score = severity_score * category_weight.get(sos_request.category, 0.5)
    score = min(max(score, 0), 100)
    
    explanation = f"Severity {sos_request.severity} for {sos_request.category}."
    return float(score), explanation
