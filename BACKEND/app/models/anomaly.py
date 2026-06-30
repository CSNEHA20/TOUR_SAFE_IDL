from pydantic import BaseModel
from typing import Optional

class AnomalyEvent(BaseModel):
    traveler_id: str
    event_type: str  # CRASH, IMMOBILITY, or MANUAL_SOS
    reconstruction_error: float
    gps_lat: float
    gps_lng: float
    timestamp: float
    description: Optional[str] = None
