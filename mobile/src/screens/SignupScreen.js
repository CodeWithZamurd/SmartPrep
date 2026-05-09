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

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!name || !email || !password) return Alert.alert('Missing', 'All fields are required');
    if (password.length < 6) return Alert.alert('Weak password', 'Min 6 characters');
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
    } catch (e) {
      Alert.alert('Signup failed', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Brand />
        <Text style={styles.title}>Join SmartPrep</Text>
        <Text style={styles.subtitle}>Create your account to begin</Text>

        <Text style={styles.label}>NAME*</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />

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
        <Text style={styles.hint}>Must have atleast 6 characters{'\n'}Must include special characters (!@#, etc)</Text>

        <Button title="SIGN UP HERE" onPress={submit} loading={loading} style={{ marginTop: spacing.lg }} />
        <Text style={styles.or}>OR</Text>
        <Pressable onPress={() => navigation.navigate('Login')} style={{ alignSelf: 'center' }}>
          <Text style={styles.bottomTxt}>
            Already have an account? <Text style={styles.linkBold}>Login</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#fff', fontSize: 32, fontWeight: '900', textAlign: 'center', marginTop: spacing.md },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.lg, textAlign: 'center' },
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
  hint: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
  or: { color: colors.textSecondary, textAlign: 'center', marginVertical: spacing.md },
  bottomTxt: { color: colors.textSecondary },
  linkBold: { color: colors.primary, fontWeight: '700' }
});
