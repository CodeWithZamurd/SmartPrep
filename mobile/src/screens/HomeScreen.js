import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Brand } from '../components/Screen';
import BottomTabs from '../components/BottomTabs';
import Card from '../components/Card';
import { colors, radii, spacing } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalQuestions: 0, totalSessions: 0, accuracy: 0 });
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, chRes] = await Promise.all([
        api.get('/profile/stats'),
        api.get('/challenge').catch(() => ({ data: null }))
      ]);
      setStats(statsRes.data.stats);
      if (chRes && chRes.data) setChallenge(chRes.data);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const firstName = (user?.name || 'there').split(' ')[0];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        <View style={styles.headerRow}>
          <Brand small />
          <Pressable onPress={() => navigation.navigate('Profile')} style={styles.avatarBtn}>
            <Text style={{ color: '#fff' }}>👤</Text>
          </Pressable>
        </View>

        <View style={styles.brainBlock}>
          <Text style={{ fontSize: 56 }}>🧠</Text>
        </View>

        <Card variant="alt" style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome back, {firstName}! 👋</Text>
          <Text style={styles.welcomeSub}>Are you ready to ace your AI interview?</Text>
        </Card>

        <Card variant="alt">
          <Text style={styles.cardHead}>Daily AI Challenge</Text>
          <Text style={styles.cardBody} numberOfLines={3}>
            {challenge?.question || 'Loading today\'s challenge…'}
          </Text>
          <Pressable
            onPress={() => navigation.navigate('DailyChallenge', { challenge })}
            style={styles.viewBtn}
          >
            <Text style={styles.viewBtnTxt}>View Challenge</Text>
          </Pressable>
        </Card>

        <Text style={styles.section}>Progress History</Text>
        <View style={styles.statsRow}>
          <Stat icon="❓" value={stats.totalQuestions} label="Questions" />
          <Stat icon="🎓" value={stats.totalSessions} label="Sessions" />
          <Stat icon="📈" value={`${stats.accuracy}%`} label="Accuracy" highlight />
        </View>
      </ScrollView>
      <BottomTabs active="Home" />
    </SafeAreaView>
  );
}

function Stat({ icon, value, label, highlight }) {
  return (
    <View style={[styles.stat, highlight && { backgroundColor: colors.primary }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, highlight && { color: '#fff' }]}>{value}</Text>
      <Text style={[styles.statLabel, highlight && { color: '#fff' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brainBlock: { alignItems: 'center', marginVertical: spacing.sm },
  welcomeCard: { backgroundColor: '#284FB1' },
  welcomeTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  welcomeSub: { color: '#E0E8FF', marginTop: 4 },
  cardHead: { color: '#fff', fontWeight: '900', fontSize: 16, marginBottom: 6 },
  cardBody: { color: colors.textSecondary },
  viewBtn: { marginTop: spacing.md, backgroundColor: colors.primary, padding: 10, borderRadius: radii.md, alignItems: 'center' },
  viewBtnTxt: { color: '#fff', fontWeight: '700' },
  section: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: spacing.lg, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center'
  },
  statIcon: { fontSize: 22 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 },
  statLabel: { color: colors.textSecondary, fontSize: 12 }
});
