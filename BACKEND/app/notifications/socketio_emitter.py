import socketio
import logging

logger = logging.getLogger(__name__)

# Initialize Socket.io AsyncServer
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

async def emit_anomaly_alert(traveler_id: str, event_type: str, reconstruction_error: float, lat: float, lng: float, timestamp: float):
    """
    Broadcasts a real-time anomaly alert event to the authority dashboard client.
    """
    alert_payload = {
        "traveler_id": traveler_id,
        "event_type": event_type,
        "reconstruction_error": reconstruction_error,
        "gps_lat": lat,
        "gps_lng": lng,
        "timestamp": timestamp,
        "status": "RED" if event_type in ["CRASH", "IMMOBILITY", "MANUAL_SOS"] else "AMBER"
    }
    
    logger.info(f"[Socket.io] Broadcasting alert for traveler {traveler_id}: {event_type}")
    await sio.emit("anomaly_alert", alert_payload)

async def emit_geofence_breach(traveler_id: str, zone_name: str, lat: float, lng: float, timestamp: float):
    """
    Broadcasts a real-time geo-fence breach event to the authority dashboard client.
    """
    breach_payload = {
        "traveler_id": traveler_id,
        "event_type": "GEOFENCE_BREACH",
        "zone_name": zone_name,
        "gps_lat": lat,
        "gps_lng": lng,
        "timestamp": timestamp,
        "status": "AMBER"
    }
    
    logger.info(f"[Socket.io] Broadcasting geo-fence breach for traveler {traveler_id} in {zone_name}")
    await sio.emit("geofence_breach", breach_payload)
