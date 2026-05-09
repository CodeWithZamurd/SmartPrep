import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { colors } from '../theme';

const TABS = [
  { key: 'AdminDashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'AdminUsers', label: 'Users', icon: '👤' },
  { key: 'AdminQuestions', label: 'Questions', icon: '📝' },
  { key: 'AdminSettings', label: 'Settings', icon: '⚙️' }
];

export default function AdminBottomTabs({ active }) {
  const nav = useNavigation();
  const state = useNavigationState((s) => s);
  const current = active || (state && state.routes[state.index] && state.routes[state.index].name);
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const isActive = current === t.key;
        return (
          <Pressable key={t.key} style={styles.tab} onPress={() => nav.navigate(t.key)}>
            <Text style={[styles.icon, isActive && styles.activeIcon]}>{t.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bgAlt,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingBottom: 16
  },
  tab: { flex: 1, alignItems: 'center' },
  icon: { fontSize: 20, color: colors.textSecondary },
  activeIcon: { color: colors.primary },
  label: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  activeLabel: { color: colors.primary, fontWeight: '700' }
});
