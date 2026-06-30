import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import didService, { MedicalVaultData } from '../../services/didService';
import sensorService from '../../services/sensorService';
import locationService from '../../services/locationService';
import telemetryService from '../../services/telemetryService';
import autoCommitJob from '../../offline/autoCommitJob';

export const DIDGenerationScreen = ({ navigation, route }: any) => {
  const previousData = route.params || {};
  const [loading, setLoading] = useState(true);
  const [progressSteps, setProgressSteps] = useState<string[]>([]);
  const [didResult, setDidResult] = useState<any>(null);

  useEffect(() => {
    runIdentityGeneration();
  }, []);

  const runIdentityGeneration = async () => {
    try {
      // Step 1
      setProgressSteps(prev => [...prev, 'Generating cryptographic key pair (secp256k1)']);
      await new Promise(r => setTimeout(r, 1000));

      // Step 2
      setProgressSteps(prev => [...prev, 'Encrypting medical vault payload with public key']);
      await new Promise(r => setTimeout(r, 1000));

      // Step 3
      setProgressSteps(prev => [...prev, 'Uploading encrypted payload to IPFS decentralized nodes']);
      
      const medicalData: MedicalVaultData = previousData.medicalData || {
        bloodType: 'O+',
        allergies: [],
        medications: 'None',
        chronicConditions: [],
        insurancePolicyNumber: 'MOCK-INS-1234',
        emergencyContact: previousData.emergencyContact || { name: 'Contact', phone: '000', relationship: 'Family' }
      };

      const result = await didService.generateTravelerDID(medicalData);
      
      // Step 4
      setProgressSteps(prev => [...prev, 'Anchoring Identity Resolution mapping on Polygon blockchain']);
      await new Promise(r => setTimeout(r, 1000));
      
      setDidResult(result);
      setProgressSteps(prev => [...prev, 'Decentralized Identity (DID) successfully created!']);
      setLoading(false);

      // Start core safety background pipelines for prototype demonstration
      const travelerId = result.did.substring(0, 16);
      locationService.startTracking();
      telemetryService.connect(travelerId);
      sensorService.startMonitoring(travelerId);
      autoCommitJob.startJob();

    } catch (err) {
      console.error(err);
      setProgressSteps(prev => [...prev, 'Error generating DID. Please check connection and try again.']);
      setLoading(false);
    }
  };

  const handleFinish = () => {
    // Navigate straight to Home Dashboard
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Securing Identity</Text>
        <Text style={styles.subtitle}>Step 4 of 4: Blockchain Self-Sovereign Identity initialization</Text>

        <View style={styles.progressContainer}>
          {progressSteps.map((step, index) => (
            <Text key={index} style={styles.stepText}>
              ✓ {step}
            </Text>
          ))}
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.loadingText}>Initializing DID registry transaction...</Text>
            </View>
          )}
        </View>

        {!loading && didResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Your DID Identifier:</Text>
            <Text style={styles.didString}>{didResult.did}</Text>
            <Text style={styles.ipfsTitle}>Encrypted Medical Vault IPFS CID:</Text>
            <Text style={styles.ipfsString}>{didResult.ipfsCID}</Text>
          </View>
        )}

        {!loading && (
          <TouchableOpacity style={styles.button} onPress={handleFinish}>
            <Text style={styles.buttonText}>Proceed to Home Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 30,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 40,
  },
  progressContainer: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 30,
  },
  stepText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: {
    color: '#94A3B8',
    marginLeft: 10,
    fontSize: 14,
  },
  resultCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 40,
  },
  resultTitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  didString: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 16,
  },
  ipfsTitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  ipfsString: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default DIDGenerationScreen;
