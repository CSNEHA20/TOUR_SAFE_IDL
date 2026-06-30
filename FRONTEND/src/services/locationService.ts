export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

class LocationService {
  private currentLocation: LocationCoords | null = {
    latitude: 32.3752,  // Default mock coordinates (Himalayan / Rohtang Pass region)
    longitude: 77.2289,
  };
  private intervalId: any = null;

  public startTracking() {
    console.log('Started 1Hz background location tracking.');
    this.intervalId = setInterval(() => {
      this.updateCoordinates();
    }, 1000);
  }

  public stopTracking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Stopped location tracking.');
  }

  public getCurrentLocation(): LocationCoords | null {
    return this.currentLocation;
  }

  private updateCoordinates() {
    if (this.currentLocation) {
      // Simulate slight movement for testing
      const latOffset = (Math.random() - 0.5) * 0.0001;
      const lngOffset = (Math.random() - 0.5) * 0.0001;
      this.currentLocation = {
        latitude: this.currentLocation.latitude + latOffset,
        longitude: this.currentLocation.longitude + lngOffset,
      };
    }
  }
}

export const locationService = new LocationService();
export default locationService;
