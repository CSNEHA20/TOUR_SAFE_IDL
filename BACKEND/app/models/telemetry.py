from pydantic import BaseModel
from typing import List, Optional

class TelemetryPacket(BaseModel):
    traveler_id: str
    timestamp: float
    gps_lat: float
    gps_lng: float
    accel_x: float
    accel_y: float
    accel_z: float
    amag: float

class TelemetryWindow(BaseModel):
    traveler_id: str
    packets: List[TelemetryPacket]
