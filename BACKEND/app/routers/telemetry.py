from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import time
import logging
import numpy as np

from app.models.telemetry import TelemetryPacket
from app.ml.onnx_inference import evaluator
from app.ml.preprocessing import preprocess_window
from app.notifications.socketio_emitter import emit_anomaly_alert

logger = logging.getLogger(__name__)
router = APIRouter()

# Keep track of consecutive anomaly windows per traveler in memory
consecutive_anomalies_count: Dict[str, int] = {}

# In-memory store for active telemetry windows (if client streams packet-by-packet)
traveler_buffers: Dict[str, List[TelemetryPacket]] = {}

# In-memory mock DB client for when MongoDB/Redis are not active
mock_db_store = []
mock_gps_cache = {}

@router.websocket("/ws/telemetry/{traveler_id}")
async def websocket_telemetry(websocket: WebSocket, traveler_id: str):
    await websocket.accept()
    logger.info(f"WebSocket connection established for traveler: {traveler_id}")
    
    # Initialize state
    consecutive_anomalies_count[traveler_id] = 0
    traveler_buffers[traveler_id] = []
    
    try:
        while True:
            # Receive text or JSON data
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            # Identify if it is a single packet or a full window
            if isinstance(payload, list):
                # Client sent a full window of packets
                packets = [TelemetryPacket(**p) for p in payload]
            else:
                # Client sent a single packet
                packets = [TelemetryPacket(**payload)]
                
            # Process packets
            for packet in packets:
                # Cache latest GPS coordinate
                mock_gps_cache[traveler_id] = {
                    "lat": packet.gps_lat,
                    "lng": packet.gps_lng,
                    "timestamp": packet.timestamp
                }
                
                # Append to traveler's sliding window buffer
                traveler_buffers[traveler_id].append(packet)
                
            # When buffer contains at least 150 points (3 seconds at 50Hz), process it
            # In a sliding window of 150 points with 50% overlap, we process every 75 new points
            buffer = traveler_buffers[traveler_id]
            if len(buffer) >= 150:
                # Extract the 150 points window for evaluation
                window = buffer[:150]
                
                # Keep the remaining points for slide (50% overlap means we keep the last 75 points)
                traveler_buffers[traveler_id] = buffer[75:]
                
                # Preprocess window for ONNX input shape (1, 150, 1)
                input_arr = preprocess_window(window)
                
                # Run LSTM Inference
                reconstruction_error, is_anomaly = evaluator.evaluate_window(input_arr)
                
                # Two-Stage Confirmation Protocol
                if is_anomaly:
                    consecutive_anomalies_count[traveler_id] += 1
                else:
                    consecutive_anomalies_count[traveler_id] = 0
                    
                # Send confirmation status back to mobile app
                latest_packet = window[-1]
                status_response = {
                    "status": "EMERGENCY" if consecutive_anomalies_count[traveler_id] >= 2 else "ALERT" if is_anomaly else "SAFE",
                    "consecutive_anomalies": consecutive_anomalies_count[traveler_id],
                    "reconstruction_error": reconstruction_error,
                    "timestamp": time.time()
                }
                await websocket.send_text(json.dumps(status_response))
                
                # If confirmed anomaly (2 consecutive windows above threshold)
                if consecutive_anomalies_count[traveler_id] >= 2:
                    logger.critical(f"[CONFIRMED ANOMALY] Traveler {traveler_id} in emergency! Reconstruction error: {reconstruction_error}")
                    
                    # Determine event type
                    raw_amags = np.array([p.amag for p in window])
                    event_type = "CRASH" if np.max(raw_amags) > 25.0 else "IMMOBILITY"
                    
                    # Trigger the alert via Socket.io
                    await emit_anomaly_alert(
                        traveler_id=traveler_id,
                        event_type=event_type,
                        reconstruction_error=reconstruction_error,
                        lat=latest_packet.gps_lat,
                        lng=latest_packet.gps_lng,
                        timestamp=latest_packet.timestamp
                    )
                    
                    # Log incident in memory db
                    mock_db_store.append({
                        "traveler_id": traveler_id,
                        "event_type": event_type,
                        "reconstruction_error": reconstruction_error,
                        "gps": {"lat": latest_packet.gps_lat, "lng": latest_packet.gps_lng},
                        "timestamp": latest_packet.timestamp
                    })
                    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for traveler: {traveler_id}")
    except Exception as e:
        logger.error(f"Error in WebSocket handler for traveler {traveler_id}: {e}")
    finally:
        # Clean up
        if traveler_id in consecutive_anomalies_count:
            del consecutive_anomalies_count[traveler_id]
        if traveler_id in traveler_buffers:
            del traveler_buffers[traveler_id]
