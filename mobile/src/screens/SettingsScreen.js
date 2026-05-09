import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Share } from 'react-native';
import { Screen, ScreenHeader } from '../components/Screen';
import Button from '../components/Button';
import BottomTabs from '../components/BottomTabs';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors, radii, spacing } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

function Row({ icon, title, desc, value, onValueChange }) {
  return (
    <View style={styles.row}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {desc ? <Text style={styles.desc}>{desc}</Text> : null}
      </View>
      {onValueChange ? (
        <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.primary }} />
      ) : null}
    </View>
  );
}

export default function SettingsScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const initial = user?.settings || {};
  const [darkMode, setDark] = useState(initial.darkMode ?? true);
  const [learning, setLearning] = useState(initial.learningMode ?? false);
  const [notif, setNotif] = useState(initial.notificationsEnabled ?? true);

  async function update(patch, applyLocal) {
    try {
      const { data } = await api.patch('/profile/settings', patch);
      setUser({ ...user, settings: data.settings });
      applyLocal && applyLocal();
    } catch (e) {}
  }

  async function shareApp() {
    try {
      await Share.share({ message: 'Try SmartPrep — AI Interview Coach for tech roles!' });
    } catch (e) {}
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={{ padding: spacing.lg, flex: 1 }}>
        <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />

        <Row icon="🎓" title="Learning Mode" desc="Customize your learning experience"
             value={learning} onValueChange={(v) => { setLearning(v); update({ learningMode: v }); }} />
        <Row icon="🌙" title="Dark Mode" desc="Switch between light and dark themes"
             value={darkMode} onValueChange={(v) => { setDark(v); update({ darkMode: v }); }} />

        <Text style={styles.section}>🔔 Notification Settings</Text>
        <Text style={styles.sectionDesc}>Manage your notification settings</Text>
        <Row icon="" title="Enable Notifications" desc="Receive study reminders and daily challenges"
             value={notif} onValueChange={(v) => { setNotif(v); update({ notificationsEnabled: v }); }} />

        <Text style={styles.section}>🔗 Share App</Text>
        <Text style={styles.sectionDesc}>Share this app with your friends</Text>
        <Text style={[styles.title, { marginTop: 8 }]}>Share SmartPrep</Text>
        <Text style={styles.desc}>Help others prepare for tech interviews by sharing this app</Text>

        <Button title="🔗 Share App" onPress={shareApp} style={{ marginTop: spacing.lg }} />
      </View>
      <BottomTabs active="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomColor: colors.divider,
    borderBottomWidth: 1
  },
  icon: { fontSize: 20, marginRight: spacing.md },
  title: { color: '#fff', fontWeight: '700' },
  desc: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  section: { color: '#fff', fontWeight: '900', fontSize: 16, marginTop: spacing.lg },
  sectionDesc: { color: colors.textSecondary, fontSize: 12 }
});
