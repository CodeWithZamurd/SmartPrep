import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function ProgressRing({ value = 0, size = 140, label, color = colors.green }) {
  const v = Math.max(0, Math.min(100, value));
  const stroke = 12;
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
            borderColor: colors.divider
          }
        ]}
      />
      <View
        style={[
          styles.ring,
          styles.fg,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
            borderColor: color,
            opacity: v / 100
          }
        ]}
      />
      <View style={styles.center}>
        <Text style={styles.value}>{v}%</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
  fg: { transform: [{ rotate: '-90deg' }] },
  center: { alignItems: 'center', justifyContent: 'center' },
  value: { color: '#fff', fontSize: 28, fontWeight: '900' },
  label: { color: colors.green, fontSize: 12, fontWeight: '700', marginTop: 2 }
});
