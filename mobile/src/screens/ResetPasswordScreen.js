import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView
} from 'react-native';
import Button from '../components/Button';
import { Screen, Brand } from '../components/Screen';
import { api } from '../services/api';
import { colors, radii, spacing } from '../theme';

const PASSWORD_REGEX = /^(?=.*[!@#$%^&*]).{6,}$/;

export default function ResetPasswordScreen({ navigation, route }) {
  const [email, setEmail] = useState(route?.params?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email || !otp || !newPassword || !confirmPassword) {
      return Alert.alert('Missing fields', 'All fields are required.');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Mismatch', 'Passwords do not match.');
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      return Alert.alert('Weak password', 'Use at least 6 characters and include a special character (!@#$%^&*).');
    }
    setLoading(true);
    try {
      await api.post('/auth/password/reset', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword
      });
      Alert.alert('Password reset', 'You can now sign in with your new password.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (e) {
      Alert.alert('Reset failed', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!email) return Alert.alert('Missing email', 'Enter your email first.');
    setLoading(true);
    try {
      await api.post('/auth/password/forgot', { email: email.trim() });
      Alert.alert('Code sent', 'A new code has been sent if the account exists.');
    } catch (e) {
      Alert.alert('Could not resend', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Brand />
          <Text style={styles.title}>Reset{'\n'}Password</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code we emailed you. Codes expire after 5 minutes.</Text>

          <Text style={styles.label}>EMAIL*</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>6-DIGIT CODE*</Text>
          <TextInput
            style={[styles.input, { letterSpacing: 6, fontWeight: '700' }]}
            placeholder="123456"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(t) => setOtp(t.replace(/\D/g, ''))}
          />

          <Text style={styles.label}>NEW PASSWORD*</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="At least 6 chars + a special character"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPwd}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <Pressable onPress={() => setShowPwd((s) => !s)} style={styles.eye}>
              <Text style={{ color: colors.textSecondary }}>{showPwd ? '🙈' : '👁'}</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>CONFIRM PASSWORD*</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter new password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPwd}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <Button title="Reset password" onPress={submit} loading={loading} style={{ marginTop: spacing.lg }} />

          <Pressable onPress={resend} disabled={loading} style={{ alignSelf: 'center', marginTop: spacing.lg }}>
            <Text style={styles.link}>Didn't get a code? <Text style={styles.linkBold}>Resend</Text></Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Login')} style={{ alignSelf: 'center', marginTop: spacing.md }}>
            <Text style={styles.linkBold}>← Back to sign in</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.primary, fontSize: 36, fontWeight: '900', lineHeight: 40, marginTop: spacing.md },
  subtitle: { color: colors.textSecondary, marginVertical: spacing.lg, textAlign: 'center' },
  label: { color: colors.textSecondary, fontWeight: '700', fontSize: 12, marginTop: spacing.md, marginBottom: 6 },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  eye: { position: 'absolute', right: 12, padding: 8 },
  link: { color: colors.textSecondary, fontSize: 13 },
  linkBold: { color: colors.primary, fontWeight: '700' }
});
