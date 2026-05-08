import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Button from '../components/Button';

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [domain, setDomain] = useState(user?.domainPreference || 'software');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.patch('/profile', { name, domainPreference: domain });
      setUser({ ...user, name, domainPreference: domain });
      Alert.alert('Saved');
    } catch (e) {
      Alert.alert('Save failed', e?.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user?.email}</Text>
      <Text style={styles.label}>Preferred domain</Text>
      <View style={styles.row}>
        <Button
          title="Software Dev"
          variant={domain === 'software' ? 'primary' : 'secondary'}
          onPress={() => setDomain('software')}
        />
        <View style={{ width: 8 }} />
        <Button
          title="AI / Data Sci"
          variant={domain === 'ai_ds' ? 'primary' : 'secondary'}
          onPress={() => setDomain('ai_ds')}
        />
      </View>
      <Button title="Save" onPress={save} loading={saving} />
      <Button title="Log out" variant="secondary" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { color: '#555', marginTop: 12 },
  value: { fontSize: 16, paddingVertical: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16 },
  row: { flexDirection: 'row' }
});
