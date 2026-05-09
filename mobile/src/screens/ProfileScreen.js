import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';
import BottomTabs from '../components/BottomTabs';
import { Brand } from '../components/Screen';
import { colors, radii, spacing } from '../theme';

const TABS = [
  { key: 'progress', label: 'Your Progress', icon: '📊' },
  { key: 'interviews', label: 'AI Interviews', icon: '🤖' },
  { key: 'premium', label: 'Premium', icon: '⭐' }
];

export default function ProfileScreen({ navigation }) {
  const { user, logout, setUser } = useAuth();
  const [tab, setTab] = useState('progress');
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);

  const load = useCallback(async () => {
    try {
      const [s, ss] = await Promise.all([api.get('/profile/stats'), api.get('/sessions')]);
      setStats(s.data.stats);
      setSessions(ss.data.sessions || []);
    } catch (e) {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function upgrade() {
    try {
      const { data } = await api.post('/profile/upgrade');
      setUser({ ...user, ...data.user });
      Alert.alert('Welcome to Premium!', 'All features unlocked.');
    } catch (e) {
      Alert.alert('Upgrade failed', e?.response?.data?.error || e.message);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
        <View style={styles.headerRow}>
          <Brand small />
          <View style={styles.iconRow}>
            <Pressable onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.icon}>⚙️</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Result')}>
              <Text style={styles.icon}>↻</Text>
            </Pressable>
            <Pressable onPress={logout}>
              <Text style={styles.icon}>↪</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.title}>My Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
        </View>

        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
              <Text style={[styles.tabIcon, tab === t.key && { color: colors.primary }]}>{t.icon}</Text>
              <Text style={[styles.tabLabel, tab === t.key && { color: colors.primary }]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'progress' && (
          <Card>
            <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
              <Text style={{ fontSize: 48 }}>📊</Text>
              <Text style={styles.cardTitle}>
                {stats?.totalSessions ? `${stats.totalSessions} interviews completed` : 'No Progress Data Available'}
              </Text>
              <Text style={styles.cardSub}>
                {stats?.totalSessions
                  ? `Average accuracy: ${stats.accuracy}%`
                  : 'Start practicing your interviews to see your detailed progress here!'}
              </Text>
            </View>
          </Card>
        )}

        {tab === 'interviews' && (
          <Card>
            {sessions.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
                <Text style={{ fontSize: 48 }}>🤖</Text>
                <Text style={styles.cardTitle}>No Mock Interviews Yet</Text>
                <Text style={styles.cardSub}>
                  Start your first AI-powered interview to practice and improve your technical & soft skills!
                </Text>
                <Button
                  title="▶ Start your first Interview"
                  onPress={() => navigation.navigate('InterviewDomain')}
                  style={{ marginTop: spacing.lg }}
                />
              </View>
            ) : (
              sessions.map((s) => (
                <Pressable
                  key={s._id}
                  style={styles.sessionItem}
                  onPress={() => navigation.navigate('Feedback', { sessionId: s._id })}
                >
                  <Text style={styles.sessionTitle}>
                    {(s.domain && s.domain.name) || s.domainSlug} · {s.difficulty}
                  </Text>
                  <Text style={styles.sessionMeta}>
                    Score {s.overallScore ?? '—'}% · {new Date(s.createdAt).toLocaleDateString()}
                  </Text>
                </Pressable>
              ))
            )}
          </Card>
        )}

        {tab === 'premium' && (
          <Card>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 48 }}>⭐</Text>
              <View style={styles.discount}>
                <Text style={{ color: '#fff', fontWeight: '900' }}>🔥 75% OFF</Text>
              </View>
              <Text style={styles.cardTitle}>Upgrade to Premium</Text>
              <Text style={[styles.cardTitle, { color: colors.primary, fontSize: 22 }]}>Rs.600</Text>
              <Text style={styles.cardSub}>Unlock all features and remove ads</Text>
              <BulletRow icon="📈" text="Unlimited AI Mock Interviews" />
              <BulletRow icon="📚" text="All Practice Questions Unlocked" />
              <BulletRow icon="🚫" text="Ad-free experience" />
              {user?.isPremium ? (
                <Text style={[styles.cardSub, { color: colors.green, marginTop: 12 }]}>You are Premium ⭐</Text>
              ) : (
                <Button
                  title="⭐ Upgrade Now"
                  onPress={upgrade}
                  style={{ marginTop: spacing.md, backgroundColor: colors.star }}
                  textStyle={{ color: '#1A1A1A' }}
                />
              )}
            </View>
          </Card>
        )}
      </ScrollView>
      <BottomTabs active="Home" />
    </SafeAreaView>
  );
}

function BulletRow({ icon, text }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={{ marginRight: 8 }}>{icon}</Text>
      <Text style={styles.cardSub}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconRow: { flexDirection: 'row', gap: 16 },
  icon: { color: '#fff', fontSize: 18 },
  title: { color: '#fff', fontSize: 26, fontWeight: '900', marginVertical: spacing.sm },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radii.lg
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  name: { color: '#fff', fontSize: 20, fontWeight: '900', marginLeft: spacing.md },
  tabs: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: spacing.lg },
  tab: { alignItems: 'center' },
  tabIcon: { fontSize: 18, color: colors.textSecondary },
  tabLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  cardTitle: { color: '#fff', fontWeight: '900', fontSize: 18, marginTop: spacing.md, textAlign: 'center' },
  cardSub: { color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  sessionItem: { paddingVertical: 10, borderBottomColor: colors.divider, borderBottomWidth: 1 },
  sessionTitle: { color: '#fff', fontWeight: '700' },
  sessionMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  discount: {
    backgroundColor: colors.orange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: spacing.sm
  },
  bulletRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 }
});
