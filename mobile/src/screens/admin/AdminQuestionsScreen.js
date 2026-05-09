import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Brand } from '../../components/Screen';
import AdminBottomTabs from '../../components/AdminBottomTabs';
import Card from '../../components/Card';
import { api } from '../../services/api';
import { colors, radii, spacing } from '../../theme';

const DIFF_COLOR = { easy: colors.green, medium: colors.yellow, hard: colors.red };

export default function AdminQuestionsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    api.get('/domains').then((r) => setDomains(r.data.domains || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (selectedDomain) params.domain = selectedDomain;
      if (search) params.search = search;
      const [qRes, sRes] = await Promise.all([
        api.get('/questions', { params }),
        api.get('/admin/questions/stats')
      ]);
      setQuestions(qRes.data.questions || []);
      setStats(sRes.data);
    } catch (e) {}
  }, [search, selectedDomain]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function del(q) {
    Alert.alert('Delete?', q.questionText.slice(0, 80), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`/questions/${q._id}`).catch(() => {});
          load();
        }
      }
    ]);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
        <Brand small />
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Question Bank</Text>
            <Text style={styles.sub}>Manage interview questions</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('AdminAddQuestion')}
            style={styles.addBtn}
          >
            <Text style={styles.addTxt}>+</Text>
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={load}
          />
          <Pressable onPress={load}>
            <Text style={{ color: '#fff' }}>🔍</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          <Pressable
            onPress={() => setSelectedDomain('')}
            style={[styles.tab, !selectedDomain && styles.tabActive]}
          >
            <Text style={styles.tabTxt}>All domains</Text>
          </Pressable>
          {domains.map((d) => (
            <Pressable
              key={d._id}
              onPress={() => setSelectedDomain(d.slug)}
              style={[styles.tab, selectedDomain === d.slug && styles.tabActive]}
            >
              <Text style={styles.tabTxt}>{d.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.statsRow}>
          <StatBox value={`${stats.total}+`} label="Total" />
          <StatBox value={stats.easy} label="Easy" />
          <StatBox value={`${stats.total >= 200 ? '200+' : stats.total}`} label="Technical" />
        </View>

        {questions.map((q) => (
          <Card key={q._id} variant="alt">
            <Text style={styles.qText}>{q.questionText}</Text>
            <View style={styles.qMeta}>
              <Text style={styles.qCat}>{q.category || (q.domain && q.domain.name) || ''}</Text>
              <Text style={[styles.qDiff, { color: DIFF_COLOR[q.difficultyLevel] || colors.primary }]}>
                {q.difficultyLevel}
              </Text>
            </View>
            <View style={styles.actions}>
              <Pressable
                onPress={() => navigation.navigate('AdminAddQuestion', { question: q })}
                style={styles.actionBtn}
              >
                <Text style={[styles.actionTxt, { color: colors.primary }]}>📝 Edit</Text>
              </Pressable>
              <Pressable onPress={() => del(q)} style={styles.actionBtn}>
                <Text style={[styles.actionTxt, { color: colors.danger }]}>🗑 Delete</Text>
              </Pressable>
            </View>
          </Card>
        ))}
      </ScrollView>
      <AdminBottomTabs active="AdminQuestions" />
    </SafeAreaView>
  );
}

function StatBox({ value, label }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.sm },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  sub: { color: colors.textSecondary },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addTxt: { color: '#fff', fontSize: 22, fontWeight: '900' },
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
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.card
  },
  tabActive: { backgroundColor: colors.primary },
  tabTxt: { color: '#fff', fontSize: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center'
  },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '900' },
  statLabel: { color: colors.textSecondary, fontSize: 12 },
  qText: { color: '#fff' },
  qMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  qCat: { color: colors.primary, fontSize: 12 },
  qDiff: { fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', marginTop: 8, gap: 16 },
  actionBtn: { flexDirection: 'row' },
  actionTxt: { fontWeight: '700' }
});
