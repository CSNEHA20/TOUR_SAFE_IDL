import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';

export const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Traveler Profile</Text>
        
        {/* Mock QR Code display */}
        <View style={styles.qrContainer}>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrText}>[ QR CODE ]</Text>
            <Text style={styles.qrDescText}>did:toursafe:secp256k1</Text>
          </View>
          <Text style={styles.qrLabel}>SHOW THIS TO EMERGENCY RESPONDERS</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.infoTitle}>Blockchain Verification ID:</Text>
          <Text style={styles.infoValue}>did:toursafe:0x8f2d...4a10</Text>
          
          <Text style={styles.infoTitle}>Medical Vault Storage:</Text>
          <Text style={styles.infoValue}>IPFS Pinata: QmZt...a89p</Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Edit Medical Profile</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 30,
    alignSelf: 'flex-start',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  qrText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: '800',
  },
  qrDescText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 10,
  },
  qrLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 15,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    marginBottom: 30,
  },
  infoTitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1E293B',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  buttonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;
