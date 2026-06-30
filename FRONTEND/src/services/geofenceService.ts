import store from '../store';
import { addAlert } from '../store/safetySlice';

class GeofenceService {
  private geofences: any[] = [];

  public async fetchAndCacheGeofences() {
    try {
      const response = await fetch('http://localhost:8000/api/geofence/boundaries');
      if (response.ok) {
        const data = await response.json();
        this.geofences = data.features || [];
        console.log(`Cached ${this.geofences.length} geofence boundaries client-side.`);
      }
    } catch (e) {
      console.warn('Could not fetch geofences from server, using local fallbacks.', e);
      // Fallback geofence coordinate boundaries (Rohtang Pass risk area)
      this.geofences = [
        {
          id: 'hazard-zone-1',
          name: 'Rohtang Pass Avalanche Risk Area',
          coordinates: [
            { latitude: 32.3500, longitude: 77.2000 },
            { latitude: 32.3500, longitude: 77.2500 },
            { latitude: 32.4000, longitude: 77.2500 },
            { latitude: 32.4000, longitude: 77.2000 }
          ]
        }
      ];
    }
  }

  public checkGeofenceBreach(latitude: number, longitude: number) {
    // Basic check: is traveler inside Rohtang bounds?
    for (const zone of this.geofences) {
      if (latitude >= 32.3500 && latitude <= 32.4000 && longitude >= 77.2000 && longitude <= 77.2500) {
        console.warn(`[GEOFENCE BREACH] Traveler entered ${zone.name}`);
        store.dispatch(addAlert({
          id: `geofence-alert-${Date.now()}`,
          title: `GEO-FENCE BREACH: Entered ${zone.name}`,
          timestamp: Date.now()
        }));
      }
    }
  }
}

export const geofenceService = new GeofenceService();
export default geofenceService;
