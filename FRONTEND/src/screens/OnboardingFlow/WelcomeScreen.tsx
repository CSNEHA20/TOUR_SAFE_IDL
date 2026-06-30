import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';

export const WelcomeScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>TourSafe</Text>
        <Text style={styles.tagline}>Your Silent Guardian Angel</Text>
        
        <View style={styles.descCard}>
          <Text style={styles.descText}>
            TourSafe operates autonomously in the background, utilizing advanced AI anomaly models to detect crash impacts and unconsciousness.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Registration')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: '#3B82F6',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#94A3B8',
    marginBottom: 40,
  },
  descCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 50,
  },
  descText: {
    color: '#F8FAFC',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    width: '100%',
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

export default WelcomeScreen;
