import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

export default function Button({ title, onPress, variant = 'primary', loading, disabled, style, textStyle }) {
  const base = [styles.btn, styles[variant], disabled && styles.disabled, style];
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={base}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, variant === 'ghost' && { color: colors.primary }, textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.card },
  success: { backgroundColor: colors.successDark },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: 'transparent' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
  disabled: { opacity: 0.5 },
  text: { color: '#fff', fontWeight: '700', fontSize: 16 }
});
