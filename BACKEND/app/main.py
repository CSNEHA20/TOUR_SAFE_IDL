from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import logging

from app.routers import telemetry, incidents, registration, geofence
from app.notifications.socketio_emitter import sio

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI App
fastapi_app = FastAPI(
    title="TourSafe Backend API",
    description="High-concurrency async telemetry ingestion and ML emergency dispatch server",
    version="1.0.0"
)

# CORS configuration for dashboard/external client access
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
fastapi_app.include_router(telemetry.router)
fastapi_app.include_router(incidents.router)
fastapi_app.include_router(registration.router)
fastapi_app.include_router(geofence.router)

# Wrap FastAPI with Socket.io ASGI application
app = socketio.ASGIApp(sio, fastapi_app)

@fastapi_app.get("/")
def read_root():
    return {
        "status": "RUNNING",
        "service": "TourSafe API Core Backbone",
        "version": "1.0.0"
    }

@fastapi_app.on_event("startup")
async def startup_event():
    logger.info("TourSafe Backend Service successfully initialized.")

@fastapi_app.on_event("shutdown")
async def shutdown_event():
    logger.info("TourSafe Backend Service shutting down.")
