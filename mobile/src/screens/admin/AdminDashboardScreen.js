import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Brand } from '../../components/Screen';
import AdminBottomTabs from '../../components/AdminBottomTabs';
import Card from '../../components/Card';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, radii, spacing } from '../../theme';

function MetricCard({ icon, value, label, sub, subColor = colors.green }) {
  return (
    <Card variant="alt" style={styles.metric}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {sub ? <Text style={[styles.sub, { color: subColor }]}>{sub}</Text> : null}
    </Card>
  );
}

function MiniBars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={styles.chart}>
      <View style={styles.bars}>
        {data.map((d, i) => (
          <View key={d.label + i} style={styles.barCol}>
            <View
              style={[
                styles.bar,
                {
                  height: `${(d.value / max) * 100}%`,
                  backgroundColor: ['#FFC940', '#3FA9FF', '#4ADE80', '#FF7A45', '#A78BFA', '#22D3EE', '#FF5C5C'][i % 7]
                }
              ]}
            />
            <Text style={styles.barLabel}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AdminDashboardScreen({ navigation }) {
  const { logout } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/insights');
      setInsights(data.insights);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const i = insights || {
    activeUsers: 0,
    avgScore: 0,
    completed: 0,
    completionRate: 0,
    newThisMonthPct: 0,
    weekly: []
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Brand small />
          <Pressable onPress={logout}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Logout ↪</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>Global Insights</Text>

        <View style={styles.row}>
          <MetricCard
            icon="👥"
            value={i.activeUsers}
            label="Active Users"
            sub={`+${i.newThisMonthPct || 0}% this month`}
          />
          <MetricCard
            icon="📊"
            value={`${i.avgScore}%`}
            label="Avg Score"
            sub="vs last week"
          />
        </View>
        <View style={styles.row}>
          <MetricCard icon="🏆" value={i.completed} label={'Completed\nTotal Interviews'} sub="" />
          <MetricCard
            icon="📈"
            value={`${i.completionRate}%`}
            label="Completion Rate"
            sub="improvement"
          />
        </View>

        <Pressable onPress={() => navigation.navigate('AdminInsights')}>
          <Text style={styles.title2}>Growth Trends ›</Text>
        </Pressable>
        <Card variant="alt">
          {i.weekly.length === 0 ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: 20 }}>
              No data yet
            </Text>
          ) : (
            <MiniBars data={i.weekly} />
          )}
        </Card>
      </ScrollView>
      <AdminBottomTabs active="AdminDashboard" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: spacing.sm },
  title2: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.sm },
  metric: { flex: 1, alignItems: 'center', minHeight: 120 },
  icon: { fontSize: 24 },
  value: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 4 },
  label: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 2 },
  sub: { fontSize: 11, marginTop: 4, fontWeight: '700' },
  chart: { height: 180 },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
  barCol: { flex: 1, alignItems: 'center', height: '100%', paddingHorizontal: 2 },
  bar: { width: '60%', borderRadius: radii.sm, minHeight: 4 },
  barLabel: { color: colors.textSecondary, fontSize: 10, marginTop: 4 }
});
