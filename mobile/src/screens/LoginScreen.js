import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return Alert.alert('Missing', 'Email and password are required');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('Login failed', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Text style={styles.brand}>SmartPrep</Text>
      <Text style={styles.subtitle}>AI mock interviews for tech roles</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Log in" onPress={handleLogin} loading={loading} />
      <Button title="Create account" variant="secondary" onPress={() => navigation.navigate('Signup')} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  brand: { fontSize: 32, fontWeight: '700', textAlign: 'center', color: '#1f6feb' },
  subtitle: { textAlign: 'center', color: '#555', marginBottom: 28 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginVertical: 6, fontSize: 16
  }
});
