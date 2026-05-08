import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const apiUrl =
    (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.apiBaseUrl) || 'unknown';
  return (
    <View style={styles.container}>
      <Text style={styles.label}>API base URL</Text>
      <Text style={styles.value}>{apiUrl}</Text>
      <Text style={styles.label}>Version</Text>
      <Text style={styles.value}>0.1.0</Text>
      <View style={{ height: 24 }} />
      <Button title="Log out" variant="secondary" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { color: '#666', marginTop: 12 },
  value: { fontSize: 16, paddingVertical: 6 }
});
