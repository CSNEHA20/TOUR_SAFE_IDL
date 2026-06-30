import store from '../store';
import { setSafetyStatus } from '../store/safetySlice';

class EmergencyService {
  private serverUrl: string = 'http://localhost:8000/api/sos/manual';

  public async triggerManualSOS(travelerId: string, lat: number, lng: number) {
    console.log(`[SOS] Triggering manual emergency override for traveler: ${travelerId}`);
    
    // Optimistically update the safety status locally via Redux
    store.dispatch(setSafetyStatus('EMERGENCY'));

    const payload = {
      traveler_id: travelerId,
      event_type: 'MANUAL_SOS',
      reconstruction_error: 99.9,
      gps_lat: lat,
      gps_lng: lng,
      timestamp: Date.now() / 1000,
    };

    try {
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[SOS Server Ack]', result);
      return result;
    } catch (e) {
      console.error('Failed to dispatch manual SOS API alert:', e);
      // Even if network API fails, safetyStatus remains EMERGENCY so the local device screen
      // visually alerts the user and the local offline logs capture it.
      return { success: false, error: e };
    }
  }
}

export const emergencyService = new EmergencyService();
export default emergencyService;
