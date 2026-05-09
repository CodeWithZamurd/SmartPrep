import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, ScreenHeader } from '../../components/Screen';
import AdminBottomTabs from '../../components/AdminBottomTabs';
import Card from '../../components/Card';
import { api } from '../../services/api';
import { colors, radii, spacing } from '../../theme';

function ProgressBar({ pct }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}

function LineChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100 / Math.max(1, data.length - 1);
  return (
    <View style={styles.line}>
      <View style={{ flex: 1, position: 'relative' }}>
        {data.map((d, idx) => (
          <View
            key={idx}
            style={{
              position: 'absolute',
              left: `${idx * w}%`,
              bottom: `${(d.value / max) * 100}%`,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.primary,
              transform: [{ translateX: -3 }, { translateY: 3 }]
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        {data.map((d, i) => (
          <Text key={i} style={styles.lineLabel}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function AdminInsightsScreen({ navigation }) {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    api
      .get('/admin/insights')
      .then((r) => setInsights(r.data.insights))
      .catch(() => {});
  }, []);

  const skills = insights?.skillAverages || { technical: 0, soft: 0, bodyLanguage: 0 };
  const weekly = insights?.weekly || [];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Brand small />
        </View>
        <Text style={styles.title}>Global Skill Averages</Text>
        <Text style={styles.sub}>Performance By Category</Text>

        <Card variant="alt">
          <View style={styles.skillRow}>
            <Text style={styles.skillLabel}>Technical Skills</Text>
            <Text style={styles.skillValue}>{skills.technical}%</Text>
          </View>
          <ProgressBar pct={skills.technical} />

          <View style={[styles.skillRow, { marginTop: spacing.md }]}>
            <Text style={styles.skillLabel}>Soft Skills</Text>
            <Text style={styles.skillValue}>{skills.soft}%</Text>
          </View>
          <ProgressBar pct={skills.soft} />

          <View style={[styles.skillRow, { marginTop: spacing.md }]}>
            <Text style={styles.skillLabel}>Body Language</Text>
            <Text style={styles.skillValue}>{skills.bodyLanguage}%</Text>
          </View>
          <ProgressBar pct={skills.bodyLanguage} />
        </Card>

        <Text style={styles.title2}>Weekly Performance</Text>
        <Card variant="alt" style={{ height: 180 }}>
          {weekly.length === 0 ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: 20 }}>No data yet</Text>
          ) : (
            <LineChart data={weekly} />
          )}
        </Card>
      </ScrollView>
      <AdminBottomTabs active="AdminDashboard" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: spacing.sm },
  sub: { color: colors.textSecondary, marginBottom: spacing.md },
  title2: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: spacing.lg, marginBottom: 6 },
  skillRow: { flexDirection: 'row', justifyContent: 'space-between' },
  skillLabel: { color: '#fff', fontWeight: '700' },
  skillValue: { color: colors.green, fontWeight: '900' },
  track: { height: 14, backgroundColor: colors.divider, borderRadius: radii.pill, marginTop: 6, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary },
  line: { flex: 1 },
  lineLabel: { color: colors.textSecondary, fontSize: 10 }
});
