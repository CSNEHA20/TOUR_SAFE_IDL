from fastapi import APIRouter, HTTPException, status
from app.models.anomaly import AnomalyEvent
from app.notifications.socketio_emitter import emit_anomaly_alert
import time
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/api/sos/manual", status_code=status.HTTP_201_CREATED)
async def trigger_manual_sos(event: AnomalyEvent):
    """
    Manual SOS trigger endpoint. Instantly bypasses AI logic to fire the emergency response pipeline.
    """
    logger.warning(f"[MANUAL SOS] Received manual trigger from traveler {event.traveler_id}")
    
    try:
        # Emit alert immediately via Socket.io
        await emit_anomaly_alert(
            traveler_id=event.traveler_id,
            event_type="MANUAL_SOS",
            reconstruction_error=99.9, # Max error representing absolute override
            lat=event.gps_lat,
            lng=event.gps_lng,
            timestamp=event.timestamp or time.time()
        )
        
        return {
            "success": True,
            "message": "Manual emergency trigger received. Response chain dispatched.",
            "traveler_id": event.traveler_id,
            "timestamp": event.timestamp
        }
    except Exception as e:
        logger.error(f"Error handling manual SOS trigger: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to dispatch emergency alert: {str(e)}"
        )
