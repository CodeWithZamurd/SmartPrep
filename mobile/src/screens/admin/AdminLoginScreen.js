import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen, Brand } from '../../components/Screen';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { colors, radii, spacing } from '../../theme';
import { api } from '../../services/api';

export default function AdminLoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email || !password) return Alert.alert('Missing', 'Email and password are required');
    setLoading(true);
    try {
      await login(email.trim(), password);
      const { data } = await api.get('/auth/me');
      if (data.user.role !== 'admin') {
        Alert.alert('Access denied', 'This account is not an admin.');
      }
    } catch (e) {
      Alert.alert('Login failed', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Brand />
        <Text style={styles.title}>Sign in as{'\n'}Admin</Text>
        <Pressable onPress={() => navigation.replace('Login')}>
          <Text style={styles.linkCenter}>Login here</Text>
        </Pressable>

        <Text style={styles.label}>EMAIL*</Text>
        <TextInput
          style={styles.input}
          placeholder="abc@example.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>PASSWORD*</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPwd}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPwd((s) => !s)} style={styles.eye}>
            <Text style={{ color: colors.textSecondary }}>{showPwd ? '🙈' : '👁'}</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => Alert.alert('Forgot password', 'Contact support.')} style={{ alignSelf: 'flex-end' }}>
          <Text style={styles.link}>
            Forgot Password? <Text style={styles.linkBold}>Click here</Text>
          </Text>
        </Pressable>

        <Button title="Login" onPress={submit} loading={loading} style={{ marginTop: spacing.lg }} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.primary, fontSize: 40, fontWeight: '900', lineHeight: 44, marginTop: spacing.md },
  linkCenter: { color: colors.textSecondary, textAlign: 'center', marginVertical: spacing.lg },
  label: { color: colors.textSecondary, fontWeight: '700', fontSize: 12, marginTop: spacing.md, marginBottom: 6 },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    marginBottom: 4
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  eye: { position: 'absolute', right: 12, padding: 8 },
  link: { color: colors.textSecondary, marginTop: 6, fontSize: 12 },
  linkBold: { color: colors.primary, fontWeight: '700' }
});
