import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export const MedicalProfileScreen = ({ navigation, route }: any) => {
  const previousData = route.params || {};
  const [bloodType, setBloodType] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [conditions, setConditions] = useState('');
  const [insurance, setInsurance] = useState('');

  const handleNext = () => {
    navigation.navigate('EmergencyContact', {
      ...previousData,
      medicalData: {
        bloodType,
        allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
        medications,
        chronicConditions: conditions.split(',').map(s => s.trim()).filter(Boolean),
        insurancePolicyNumber: insurance,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Medical Profile</Text>
        <Text style={styles.subtitle}>Step 2 of 4: Emergency medical vault information</Text>
        <Text style={styles.infoNote}>
          This data will be encrypted on-device. It will only be decrypted in confirmed emergency rescue operations.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Blood Type</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. A+, O-, B+"
            placeholderTextColor="#64748B"
            value={bloodType}
            onChangeText={setBloodType}
          />

          <Text style={styles.label}>Allergies (comma separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Penicillin, Latex, Peanuts"
            placeholderTextColor="#64748B"
            value={allergies}
            onChangeText={setAllergies}
          />

          <Text style={styles.label}>Active Medications</Text>
          <TextInput
            style={styles.input}
            placeholder="List active medications or type None"
            placeholderTextColor="#64748B"
            value={medications}
            onChangeText={setMedications}
          />

          <Text style={styles.label}>Chronic Conditions (comma separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Asthma, Diabetes, Heart Disease"
            placeholderTextColor="#64748B"
            value={conditions}
            onChangeText={setConditions}
          />

          <Text style={styles.label}>Travel Insurance Policy Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter policy ID for rapid hospital billing verification"
            placeholderTextColor="#64748B"
            value={insurance}
            onChangeText={setInsurance}
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
    marginBottom: 15,
  },
  infoNote: {
    fontSize: 12,
    color: '#3B82F6',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    lineHeight: 18,
    marginBottom: 20,
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

export default MedicalProfileScreen;
