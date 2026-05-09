import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radii, spacing, shadow } from '../theme';

export default function Card({ children, style, variant = 'card' }) {
  return <View style={[styles.base, styles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    ...shadow.card
  },
  card: { backgroundColor: colors.card },
  alt: { backgroundColor: colors.cardAlt },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.divider
  }
});
