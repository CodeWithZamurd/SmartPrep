import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Brand } from '../../components/Screen';
import AdminBottomTabs from '../../components/AdminBottomTabs';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Slider from '../../components/Slider';
import { api } from '../../services/api';
import { colors, radii, spacing } from '../../theme';

function timeAgo(d) {
  if (!d) return 'never';
  const ms = Date.now() - new Date(d).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h} hours ago`;
  return `${Math.floor(h / 24)} days ago`;
}

export default function AdminSettingsScreen() {
  const [tab, setTab] = useState('ai');
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/system');
      setData(data);
    } catch (e) {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function update(patch) {
    try {
      await api.patch('/admin/system', patch);
      load();
    } catch (e) {
      Alert.alert('Save failed', e?.response?.data?.error || e.message);
    }
  }

  async function backup() {
    try {
      await api.post('/admin/backup');
      Alert.alert('Backup complete');
      load();
    } catch (e) {}
  }

  const ai = data?.ai || { feedbackStrictness: 70, technicalQuestionsLimit: 15, sessionTimeoutMinutes: 30 };
  const perf = data?.performance || { uptimePct: 0, latencyMs: 0, dbSizeGB: 0, apiCallsToday: 0 };
  const sec = data?.security || { lastBackupAt: null, twoFactorEnabled: false };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
        <Brand small />
        <Text style={styles.title}>System Settings</Text>
        <Text style={styles.sub}>Configure Platform behavior</Text>

        <View style={styles.tabs}>
          <Pressable onPress={() => setTab('ai')} style={[styles.tabBtn, tab === 'ai' && styles.tabActive]}>
            <Text style={[styles.tabTxt, tab === 'ai' && styles.tabTxtActive]}>🤖 AI Settings</Text>
          </Pressable>
          <Pressable onPress={() => setTab('system')} style={[styles.tabBtn, tab === 'system' && styles.tabActive]}>
            <Text style={[styles.tabTxt, tab === 'system' && styles.tabTxtActive]}>⚙️ System</Text>
          </Pressable>
        </View>

        {tab === 'ai' && (
          <>
            <Card variant="alt">
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>AI Feedback Strictness</Text>
                <Text style={styles.cardValue}>{ai.feedbackStrictness}%</Text>
              </View>
              <Text style={styles.desc}>How critical should AI be?</Text>
              <Slider
                value={ai.feedbackStrictness}
                min={0}
                max={100}
                onChange={(v) => update({ feedbackStrictness: v })}
                suffix="%"
              />
              <View style={styles.rowBetween}>
                <Text style={styles.tickLabel}>Lineant</Text>
                <Text style={[styles.tickLabel, { color: colors.orange }]}>Strict</Text>
              </View>
            </Card>

            <Card variant="alt">
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>Technical Questions Limit</Text>
                <Text style={styles.cardValue}>{ai.technicalQuestionsLimit}</Text>
              </View>
              <Text style={styles.desc}>Max Questions per interview</Text>
              <Slider
                value={ai.technicalQuestionsLimit}
                min={0}
                max={30}
                onChange={(v) => update({ technicalQuestionsLimit: v })}
              />
            </Card>

            <Card variant="alt">
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>Session Timeout</Text>
                <Text style={styles.cardValue}>{ai.sessionTimeoutMinutes}</Text>
              </View>
              <Text style={styles.desc}>Minutes before auto-logout</Text>
              <Slider
                value={ai.sessionTimeoutMinutes}
                min={5}
                max={60}
                onChange={(v) => update({ sessionTimeoutMinutes: v })}
              />
              <View style={styles.rowBetween}>
                <Text style={styles.tickLabel}>0 min</Text>
                <Text style={styles.tickLabel}>60 min</Text>
              </View>
            </Card>
          </>
        )}

        {tab === 'system' && (
          <>
            <Text style={styles.sectionHead}>📊 Performance Metrics</Text>
            <View style={styles.row}>
              <MetricBox value={`${perf.uptimePct}%`} label="Uptime" color={colors.green} />
              <MetricBox value={`${perf.latencyMs} ms`} label="Latency" color={colors.primary} />
            </View>
            <View style={styles.row}>
              <MetricBox value={`${perf.dbSizeGB} GB`} label="DB Size" color={colors.green} />
              <MetricBox
                value={
                  perf.apiCallsToday >= 1000
                    ? `${Math.round(perf.apiCallsToday / 1000)}K`
                    : `${perf.apiCallsToday}`
                }
                label="API Calls/Days"
                color={colors.danger}
              />
            </View>

            <Text style={styles.sectionHead}>✅ Security & Backup</Text>
            <Card variant="alt">
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>Last Backup</Text>
                <Text style={styles.desc}>{timeAgo(sec.lastBackupAt)}</Text>
              </View>
              <Button title="Run Manual Backup" onPress={backup} style={{ marginTop: 8 }} variant="outline" />
            </Card>

            <Card variant="alt" style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Two Factor Authentication</Text>
              </View>
              <Switch
                value={sec.twoFactorEnabled}
                onValueChange={(v) => update({ twoFactorEnabled: v })}
                trackColor={{ true: colors.danger }}
              />
            </Card>
          </>
        )}
      </ScrollView>
      <AdminBottomTabs active="AdminSettings" />
    </SafeAreaView>
  );
}

function MetricBox({ value, label, color }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: spacing.sm },
  sub: { color: colors.textMuted, marginBottom: spacing.md },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.pill, backgroundColor: colors.card },
  tabActive: { backgroundColor: colors.primary },
  tabTxt: { color: colors.textSecondary, fontWeight: '700' },
  tabTxtActive: { color: '#fff' },
  cardTitle: { color: '#fff', fontWeight: '900' },
  cardValue: { color: colors.primary, fontWeight: '900' },
  desc: { color: colors.textSecondary, fontSize: 12, marginTop: 2, marginBottom: 6 },
  tickLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: spacing.sm },
  sectionHead: { color: '#fff', fontWeight: '900', marginTop: spacing.md, marginBottom: 4 },
  metric: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center'
  },
  metricValue: { fontSize: 22, fontWeight: '900' },
  metricLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 }
});
