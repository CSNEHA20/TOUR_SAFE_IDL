import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setSafetyStatus } from '../store/safetySlice';
import emergencyService from '../services/emergencyService';

export const HomeScreen = () => {
  const dispatch = useDispatch();
  
  // Fetch application states from Redux slices
  const safetyStatus = useSelector((state: RootState) => state.safety.safetyStatus);
  const activeAlerts = useSelector((state: RootState) => state.safety.activeAlerts);
  const isConnected = useSelector((state: RootState) => state.connection.isConnected);
  const pendingOfflineCount = useSelector((state: RootState) => state.offlineQueue.pendingCount);

  const [isPressing, setIsPressing] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // 2-second Press-and-Hold Confirmation Logic
  const handlePressIn = () => {
    setIsPressing(true);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        triggerEmergency();
      }
    });
  };

  const handlePressOut = () => {
    setIsPressing(false);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const triggerEmergency = () => {
    console.log('[UI] SOS Triggered via press-and-hold.');
    // Trigger REST API manual SOS call (mock location coordinates for prototype)
    emergencyService.triggerManualSOS('traveler-test', 32.3752, 77.2289);
  };

  const resetStatus = () => {
    dispatch(setSafetyStatus('SAFE'));
  };

  // Determine status color system
  const getStatusDetails = () => {
    switch (safetyStatus) {
      case 'EMERGENCY':
        return {
          bannerColor: '#EF4444',
          statusText: 'EMERGENCY ACTIVE',
          description: 'Help is being dispatched to your coordinates.',
        };
      case 'ALERT':
        return {
          bannerColor: '#F59E0B',
          statusText: 'GEO-FENCE ALERT',
          description: 'You are inside or approaching a hazardous zone.',
        };
      case 'SAFE':
      default:
        return {
          bannerColor: '#22C55E',
          statusText: 'YOU ARE SAFE',
          description: 'Continuous AI safety guardian active.',
        };
    }
  };

  const statusInfo = getStatusDetails();

  // Animated circle loading progress styling
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Top Banner Safety Status Indicator */}
      <View style={[styles.statusBanner, { backgroundColor: statusInfo.bannerColor }]}>
        <Text style={styles.statusText}>{statusInfo.statusText}</Text>
        <Text style={styles.statusSubText}>{statusInfo.description}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Info card row */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Connection</Text>
            <Text style={[styles.statValue, { color: isConnected ? '#22C55E' : '#F59E0B' }]}>
              {isConnected ? '● LIVE' : '● OFFLINE'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Offline Buffer</Text>
            <Text style={styles.statValue}>{pendingOfflineCount} cached</Text>
          </View>
        </View>

        {/* SOS Emergency Activation Button Section */}
        <View style={styles.sosContainer}>
          <Text style={styles.instructionText}>
            {isPressing ? 'Keep holding for 2 seconds...' : 'Press and hold to trigger manual SOS'}
          </Text>

          <View style={styles.outerRing}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={[
                styles.sosButton,
                { backgroundColor: safetyStatus === 'EMERGENCY' ? '#EF4444' : '#B91C1C' },
              ]}
            >
              <Text style={styles.sosButtonText}>SOS</Text>
            </TouchableOpacity>

            {/* Hold progress bar visual indicator */}
            <View style={styles.progressBarBackground}>
              <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
            </View>
          </View>
          
          {safetyStatus === 'EMERGENCY' && (
            <TouchableOpacity style={styles.resetButton} onPress={resetStatus}>
              <Text style={styles.resetButtonText}>Mark Incident as Resolved</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Active Alert log view */}
        <View style={styles.alertSection}>
          <Text style={styles.sectionTitle}>Safety Logs & Alerts</Text>
          {activeAlerts.length === 0 ? (
            <View style={styles.emptyAlertCard}>
              <Text style={styles.emptyAlertText}>No active alerts or warning events detected.</Text>
            </View>
          ) : (
            activeAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertTime}>
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Premium dark mode background
  },
  statusBanner: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    elevation: 5,
  },
  statusText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1.5,
  },
  statusSubText: {
    fontSize: 14,
    color: '#E2E8F0',
    marginTop: 4,
    textAlign: 'center',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#1E293B',
    flex: 0.48,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statTitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  sosContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  instructionText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  outerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    position: 'relative',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#F8FAFC',
  },
  sosButtonText: {
    fontSize: 48,
    color: '#F8FAFC',
    fontWeight: '900',
  },
  progressBarBackground: {
    width: '80%',
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    position: 'absolute',
    bottom: -25,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EF4444',
  },
  resetButton: {
    marginTop: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  resetButtonText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '700',
  },
  alertSection: {
    width: '100%',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 15,
  },
  emptyAlertCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyAlertText: {
    color: '#64748B',
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    flex: 0.8,
  },
  alertTime: {
    color: '#64748B',
    fontSize: 12,
  },
});

export default HomeScreen;
