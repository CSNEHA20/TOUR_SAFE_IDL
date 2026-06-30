import { accelerometer, SensorTypes, setUpdateIntervalForType } from 'react-native-sensors';
import { subscription } from 'rxjs';
import telemetryService from './telemetryService';
import locationService from './locationService';

// Target frequency: 50Hz (50 samples per second)
// 1000ms / 50 samples = 20ms update interval
const SENSOR_POLL_INTERVAL_MS = 20;

export interface TelemetryPacket {
  traveler_id: string;
  timestamp: number;
  gps_lat: number;
  gps_lng: number;
  accel_x: number;
  accel_y: number;
  accel_z: number;
  amag: number;
}

class SensorService {
  private sensorSubscription: any = null;
  private ringBuffer: TelemetryPacket[] = [];
  private newSamplesCount: number = 0;
  private travelerId: string = 'traveler-test';

  public startMonitoring(travelerId: string) {
    this.travelerId = travelerId;
    this.ringBuffer = [];
    this.newSamplesCount = 0;

    // Set polling interval for the accelerometer sensor
    setUpdateIntervalForType(SensorTypes.accelerometer, SENSOR_POLL_INTERVAL_MS);

    // Subscribe to sensor stream
    this.sensorSubscription = accelerometer.subscribe(
      ({ x, y, z, timestamp }) => {
        this.handleSensorData(x, y, z, timestamp);
      },
      (error) => {
        console.error('Error subscribing to accelerometer sensor:', error);
      }
    );
    console.log('Started 50Hz accelerometer sensor polling pipeline.');
  }

  public stopMonitoring() {
    if (this.sensorSubscription) {
      this.sensorSubscription.unsubscribe();
      this.sensorSubscription = null;
    }
    console.log('Stopped accelerometer sensor polling pipeline.');
  }

  private handleSensorData(x: number, y: number, z: number, timestamp: number) {
    // 1. Calculate orientation-invariant magnitude (A_mag)
    const amag = Math.sqrt(x * x + y * y + z * z);

    // 2. Fetch current GPS position from LocationService (which polls at 1Hz in the background)
    const location = locationService.getCurrentLocation();

    const packet: TelemetryPacket = {
      traveler_id: this.travelerId,
      timestamp: typeof timestamp === 'number' ? timestamp : Date.now(),
      gps_lat: location ? location.latitude : 32.3752,  // Default mock lat (Rohtang area) if unavailable
      gps_lng: location ? location.longitude : 77.2289, // Default mock lng if unavailable
      accel_x: x,
      accel_y: y,
      accel_z: z,
      amag: amag,
    };

    this.ringBuffer.push(packet);
    this.newSamplesCount++;

    // Maintain max length to prevent unbounded memory growth
    if (this.ringBuffer.length > 300) {
      this.ringBuffer.shift();
    }

    // 3. Sliding window check:
    // We need 150 points (3 seconds) for a full window.
    // Slides with 50% overlap (75 samples / 1.5 seconds) means we emit a new window every 75 new samples
    // after the initial 150 samples are collected.
    if (this.ringBuffer.length >= 150 && this.newSamplesCount >= 75) {
      // Extract the latest 150 samples
      const windowData = this.ringBuffer.slice(-150);
      
      // Reset count of new samples since last emission
      this.newSamplesCount = 0;

      // Stream the window to the server / offline buffer
      telemetryService.streamTelemetryWindow(windowData);
    }
  }
}

export const sensorService = new SensorService();
export default sensorService;
