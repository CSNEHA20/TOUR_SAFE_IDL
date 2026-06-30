import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

export const LiveMapScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        {/* Mock Map Canvas */}
        <Text style={styles.mapTitle}>Live Map View</Text>
        <Text style={styles.mapText}>GPS location tracking active at 1Hz.</Text>
        <Text style={styles.mapText}>Geofence checks computed client-side via Turf.js.</Text>
        
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Map Legend:</Text>
          <Text style={styles.legendItem}>🟢 Safe Zones (Geo-cached)</Text>
          <Text style={styles.legendItem}>🔴 Hazard Zones (Geo-fenced)</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mapContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3B82F6',
    marginBottom: 8,
  },
  mapText: {
    color: '#94A3B8',
    fontSize: 14,
    marginVertical: 4,
  },
  legendCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 40,
    width: '100%',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  legendItem: {
    color: '#E2E8F0',
    marginVertical: 4,
    fontSize: 14,
  },
});

export default LiveMapScreen;
