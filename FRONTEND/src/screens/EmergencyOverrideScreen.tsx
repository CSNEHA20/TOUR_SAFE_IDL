import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Switch } from 'react-native';

export const EmergencyOverrideScreen = () => {
  const [shakeEnabled, setShakeEnabled] = React.useState(true);
  const [voiceEnabled, setVoiceEnabled] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Emergency Override</Text>
        <Text style={styles.subtitle}>Configure manual safety trigger overrides</Text>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Shake-to-Alert</Text>
              <Text style={styles.settingDesc}>Trigger SOS by shaking phone sharply 3 times.</Text>
            </View>
            <Switch
              value={shakeEnabled}
              onValueChange={setShakeEnabled}
              trackColor={{ false: '#334155', true: '#3B82F6' }}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Voice Code Word Alert</Text>
              <Text style={styles.settingDesc}>Type or speak code words for discreet alerts.</Text>
            </View>
            <Switch
              value={voiceEnabled}
              onValueChange={setVoiceEnabled}
              trackColor={{ false: '#334155', true: '#3B82F6' }}
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Manual overrides immediately initiate the emergency response chain, generate the e-FIR, and send alerts to the authority command center.
          </Text>
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
  card: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 12,
    color: '#94A3B8',
    maxWidth: '80%',
  },
  infoCard: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    marginTop: 20,
  },
  infoText: {
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default EmergencyOverrideScreen;
