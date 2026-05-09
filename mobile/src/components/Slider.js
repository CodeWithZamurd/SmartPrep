import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

// Lightweight slider stand-in (no extra dep): five tap-stops between min and max.
export default function Slider({ value, min = 0, max = 100, step = 5, onChange, suffix = '' }) {
  const stops = [];
  for (let v = min; v <= max; v += (max - min) / 4) stops.push(Math.round(v));
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <View style={styles.row}>
        {stops.map((v) => (
          <Pressable key={v} onPress={() => onChange(v)} style={styles.stop}>
            <Text style={[styles.stopTxt, value === v && styles.activeTxt]}>
              {v}
              {suffix}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, backgroundColor: colors.cardAlt, borderRadius: radii.pill, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.primary },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  stop: { padding: 4 },
  stopTxt: { color: colors.textMuted, fontSize: 11 },
  activeTxt: { color: colors.primary, fontWeight: '900' }
});
