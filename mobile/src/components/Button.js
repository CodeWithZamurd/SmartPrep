import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function Button({ title, onPress, loading, disabled, variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btn, isPrimary ? styles.primary : styles.secondary, (disabled || loading) && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : '#1f6feb'} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginVertical: 6 },
  primary: { backgroundColor: '#1f6feb' },
  secondary: { backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#1f6feb' },
  disabled: { opacity: 0.6 },
  text: { fontSize: 16, fontWeight: '600' },
  textPrimary: { color: '#fff' },
  textSecondary: { color: '#1f6feb' }
});
