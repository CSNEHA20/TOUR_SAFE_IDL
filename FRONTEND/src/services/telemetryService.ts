import store from '../store';
import { setConnected } from '../store/connectionSlice';
import { setSafetyStatus, addAlert } from '../store/safetySlice';
import { incrementPendingCount } from '../store/offlineQueueSlice';
import { TelemetryPacket } from './sensorService';
import sqliteQueue from '../offline/sqliteQueue';
import aesEncryption from '../offline/aesEncryption';

class TelemetryService {
  private ws: WebSocket | null = null;
  private travelerId: string = '';
  private serverUrl: string = 'ws://localhost:8000/ws/telemetry';

  public connect(travelerId: string) {
    this.travelerId = travelerId;
    const url = `${this.serverUrl}/${travelerId}`;
    
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log(`WebSocket connected to ${url}`);
        store.dispatch(setConnected(true));
      };

      this.ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log('[Telemetry Server Response]', response);
          
          // Update safety status based on backend evaluations
          if (response.status) {
            store.dispatch(setSafetyStatus(response.status));
            
            if (response.status === 'EMERGENCY' || response.status === 'ALERT') {
              store.dispatch(addAlert({
                id: `alert-${Date.now()}`,
                title: `${response.status}: Anomaly detected by LSTM Autoencoder.`,
                timestamp: Date.now()
              }));
            }
          }
        } catch (e) {
          console.error('Failed to parse server message:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        store.dispatch(setConnected(false));
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed.');
        store.dispatch(setConnected(false));
      };
      
    } catch (e) {
      console.error('WebSocket connection failed:', e);
      store.dispatch(setConnected(false));
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public async streamTelemetryWindow(windowData: TelemetryPacket[]) {
    const isConnected = store.getState().connection.isConnected;
    const isNetworkAvailable = store.getState().connection.isNetworkAvailable;
    
    if (isNetworkAvailable && isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        // Send JSON stringified window payload to FastAPI
        this.ws.send(JSON.stringify(windowData));
      } catch (e) {
        console.error('Failed to send telemetry window. Buffering locally.', e);
        await this.bufferLocally(windowData);
      }
    } else {
      console.log('Device is offline or socket disconnected. Buffering telemetry window locally.');
      await this.bufferLocally(windowData);
    }
  }

  private async bufferLocally(windowData: TelemetryPacket[]) {
    try {
      const payloadString = JSON.stringify(windowData);
      
      // Encrypt before storing to comply with Security guidelines (AES-256-CBC)
      const encryptedPayload = aesEncryption.encrypt(payloadString);
      
      // Store inside SQLite buffer table
      await sqliteQueue.enqueue(encryptedPayload, Date.now());
      
      // Update UI offline queue metrics via Redux
      store.dispatch(incrementPendingCount());
    } catch (e) {
      console.error('Failed to write to local offline queue:', e);
    }
  }
}

export const telemetryService = new TelemetryService();
export default telemetryService;
