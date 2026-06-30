import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export const RegistrationScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('');
  const [kycType, setKycType] = useState<'AADHAAR' | 'PASSPORT'>('AADHAAR');
  const [kycId, setKycId] = useState('');

  const handleNext = () => {
    // Navigate with profile registration details
    navigation.navigate('MedicalProfile', { name, nationality, kycType, kycId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Register Account</Text>
        <Text style={styles.subtitle}>Step 1 of 4: Identity verification setup</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Nationality</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your country of origin"
            placeholderTextColor="#64748B"
            value={nationality}
            onChangeText={setNationality}
          />

          <Text style={styles.label}>KYC Verification Document Type</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, kycType === 'AADHAAR' && styles.toggleActive]}
              onPress={() => setKycType('AADHAAR')}
            >
              <Text style={[styles.toggleText, kycType === 'AADHAAR' && styles.toggleActiveText]}>Aadhaar Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, kycType === 'PASSPORT' && styles.toggleActive]}
              onPress={() => setKycType('PASSPORT')}
            >
              <Text style={[styles.toggleText, kycType === 'PASSPORT' && styles.toggleActiveText]}>Passport ID</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{kycType === 'AADHAAR' ? 'Aadhaar Number' : 'Passport Number'}</Text>
          <TextInput
            style={styles.input}
            placeholder={kycType === 'AADHAAR' ? '12 digit number' : 'Enter passport ID'}
            placeholderTextColor="#64748B"
            value={kycId}
            onChangeText={setKycId}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 30,
  },
  form: {
    marginBottom: 40,
  },
  label: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#F8FAFC',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleBtn: {
    flex: 0.48,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  toggleActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  toggleText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  toggleActiveText: {
    color: '#F8FAFC',
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

export default RegistrationScreen;
