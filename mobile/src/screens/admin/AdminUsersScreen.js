import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Brand } from '../../components/Screen';
import AdminBottomTabs from '../../components/AdminBottomTabs';
import Card from '../../components/Card';
import { api } from '../../services/api';
import { colors, radii, spacing } from '../../theme';

function timeAgo(d) {
  if (!d) return '';
  const ms = Date.now() - new Date(d).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h} hours ago`;
  const days = Math.floor(h / 24);
  return `${days} days ago`;
}

const STATUS_COLOR = {
  active: colors.green,
  needs_help: colors.yellow,
  inactive: colors.red
};

export default function AdminUsersScreen() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ active: 0, needs_help: 0, inactive: 0 });

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/users', { params: { search } });
      setUsers(data.users);
      setCounts(data.counts);
    } catch (e) {}
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function changeStatus(u) {
    const next = u.status === 'active' ? 'needs_help' : u.status === 'needs_help' ? 'inactive' : 'active';
    Alert.alert(
      'Change status',
      `Set ${u.name} to ${next}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            await api.patch(`/admin/users/${u.id}`, { status: next }).catch(() => {});
            load();
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
        <Brand small />
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.sub}>Monitor student performance</Text>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={load}
          />
          <Pressable onPress={load}>
            <Text style={{ color: '#fff' }}>🔍</Text>
          </Pressable>
        </View>

        <View style={styles.counts}>
          <CountBox value={counts.active} label="Active" color={colors.green} />
          <CountBox value={counts.needs_help} label={'Needs\nHelp'} color={colors.yellow} />
          <CountBox value={counts.inactive} label="Inactive" color={colors.red} />
        </View>

        {users.map((u) => (
          <Pressable key={u.id} onPress={() => changeStatus(u)}>
            <Card variant="alt">
              <View style={styles.userRow}>
                <View style={styles.avatar}>
                  <Text style={{ color: '#fff', fontWeight: '900' }}>
                    {(u.name || '?').slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.userName}>{u.name}</Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                  <Text style={styles.userMeta}>{timeAgo(u.lastActiveAt)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.status, { color: STATUS_COLOR[u.status] || colors.textSecondary }]}>
                    {u.status === 'needs_help' ? 'Needs Help' : u.status[0].toUpperCase() + u.status.slice(1)}
                  </Text>
                  <Text style={[styles.score, { color: u.averageScore >= 75 ? colors.green : colors.yellow }]}>
                    📈 {u.averageScore}%
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
      <AdminBottomTabs active="AdminUsers" />
    </SafeAreaView>
  );
}

function CountBox({ value, label, color }) {
  return (
    <View style={styles.countBox}>
      <Text style={[styles.countValue, { color }]}>{value}</Text>
      <Text style={styles.countLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: spacing.sm },
  sub: { color: colors.textSecondary, marginBottom: spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: spacing.md
  },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 10 },
  counts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  countBox: {
    flex: 1,
    backgroundColor: colors.card,
    marginHorizontal: 4,
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: 'center'
  },
  countValue: { fontSize: 24, fontWeight: '900' },
  countLabel: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 2 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  userName: { color: '#fff', fontWeight: '900' },
  userEmail: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  userMeta: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  status: { fontWeight: '900', fontSize: 12 },
  score: { fontWeight: '700', fontSize: 12, marginTop: 4 }
});
