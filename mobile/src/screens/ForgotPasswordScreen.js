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
import Button from '../components/Button';
import { Screen, Brand } from '../components/Screen';
import { api } from '../services/api';
import { colors, radii, spacing } from '../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email) return Alert.alert('Missing email', 'Enter the email you signed up with.');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/password/forgot', { email: email.trim() });
      Alert.alert(
        'Code sent',
        data?.message || 'If an account exists for that email, a code has been sent.',
        [{ text: 'OK', onPress: () => navigation.navigate('ResetPassword', { email: email.trim() }) }]
      );
    } catch (e) {
      Alert.alert('Could not send code', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Brand />
        <Text style={styles.title}>Forgot{'\n'}Password?</Text>
        <Text style={styles.subtitle}>We'll email you a one-time code to reset it.</Text>

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

        <Button title="Send reset code" onPress={submit} loading={loading} style={{ marginTop: spacing.lg }} />

        <Pressable onPress={() => navigation.navigate('ResetPassword', { email: email.trim() })} style={{ alignSelf: 'center', marginTop: spacing.lg }}>
          <Text style={styles.link}>Already have a code? <Text style={styles.linkBold}>Enter it here</Text></Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={{ alignSelf: 'center', marginTop: spacing.md }}>
          <Text style={styles.linkBold}>← Back to sign in</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.primary, fontSize: 40, fontWeight: '900', lineHeight: 44, marginTop: spacing.md },
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
  link: { color: colors.textSecondary, fontSize: 13 },
  linkBold: { color: colors.primary, fontWeight: '700' }
});
