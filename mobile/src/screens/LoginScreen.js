import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Screen, Brand } from '../components/Screen';
import { colors, radii, spacing } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

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
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Brand />
        <Text style={styles.title}>Welcome{'\n'}Back!</Text>
        <Text style={styles.subtitle}>Login to continue your journey!</Text>

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

        <Pressable onPress={() => Alert.alert('Forgot password', 'Coming soon')} style={{ alignSelf: 'flex-end' }}>
          <Text style={styles.link}>Forgot Password? <Text style={styles.linkBold}>Click here</Text></Text>
        </Pressable>

        <Button title="Login" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.lg }} />

        <Pressable onPress={() => navigation.navigate('Signup')} style={{ alignSelf: 'center', marginTop: spacing.xl }}>
          <Text style={styles.bottomTxt}>
            Don't have an account? <Text style={styles.linkBold}>SignUp</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.primary, fontSize: 44, fontWeight: '900', lineHeight: 48, marginTop: spacing.md },
  subtitle: { color: colors.textSecondary, marginVertical: spacing.lg, textAlign: 'center' },
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
  linkBold: { color: colors.primary, fontWeight: '700' },
  bottomTxt: { color: colors.textSecondary }
});
