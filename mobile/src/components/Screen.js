import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

export function Screen({ children, scroll = true, padded = true, style, contentStyle }) {
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView edges={['top']} style={[styles.safe, style]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <Body
        contentContainerStyle={[scroll ? styles.scroll : styles.flex, padded && styles.padded, contentStyle]}
        style={scroll ? null : styles.flex}
      >
        {children}
      </Body>
    </SafeAreaView>
  );
}

export function Brand({ small }) {
  return (
    <View style={[styles.brand, small && { marginBottom: spacing.sm }]}>
      <Text style={styles.brandIcon}>🧠</Text>
      <Text style={styles.brandText}>SmartPrep</Text>
    </View>
  );
}

export function ScreenHeader({ title, right, onBack }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
      ) : null}
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, backgroundColor: colors.bg, paddingBottom: 100 },
  padded: { paddingHorizontal: spacing.lg },
  brand: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md, gap: 8 },
  brandIcon: { fontSize: 22 },
  brandText: { color: colors.primary, fontSize: 22, fontWeight: '900' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 32, lineHeight: 32 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', flex: 1 },
  headerRight: { flexDirection: 'row', gap: 12 }
});
