import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export const EmergencyContactScreen = ({ navigation, route }: any) => {
  const previousData = route.params || {};
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [homeCountryEmergency, setHomeCountryEmergency] = useState('');

  const handleNext = () => {
    navigation.navigate('DIDGeneration', {
      ...previousData,
      emergencyContact: {
        name: contactName,
        phone: contactPhone,
        relationship: relationship,
      },
      homeCountryEmergencyNumber: homeCountryEmergency,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>Step 3 of 4: Primary emergency alerts contacts</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Emergency Contact Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#64748B"
            value={contactName}
            onChangeText={setContactName}
          />

          <Text style={styles.label}>Emergency Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. +91 98765 43210"
            placeholderTextColor="#64748B"
            value={contactPhone}
            onChangeText={setContactPhone}
          />

          <Text style={styles.label}>Relationship</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Spouse, Parent, Brother, Friend"
            placeholderTextColor="#64748B"
            value={relationship}
            onChangeText={setRelationship}
          />

          <Text style={styles.label}>Home Country Emergency Hotline</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 112 (EU), 911 (US), 100 (IN)"
            placeholderTextColor="#64748B"
            value={homeCountryEmergency}
            onChangeText={setHomeCountryEmergency}
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

export default EmergencyContactScreen;
