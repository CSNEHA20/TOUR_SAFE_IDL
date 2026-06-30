from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/api/geofence/boundaries")
async def get_geofence_boundaries():
    """
    Returns a GeoJSON FeatureCollection of all pre-configured safety / hazard boundaries.
    """
    logger.info("Serving geofence boundaries GeoJSON")
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "id": "hazard-zone-1",
                    "name": "Rohtang Pass Avalanche Risk Area",
                    "danger_level": "HIGH",
                    "description": "Restricted zone with active landslide and avalanche warnings."
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [77.2000, 32.3500],
                            [77.2500, 32.3500],
                            [77.2500, 32.4000],
                            [77.2000, 32.4000],
                            [77.2000, 32.3500]
                        ]
                    ]
                }
            }
        ]
    }
