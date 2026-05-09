import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Brand } from '../components/Screen';
import BottomTabs from '../components/BottomTabs';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, radii, spacing } from '../theme';

const DIFFICULTIES = [
  { key: 'all', label: 'All', color: colors.textSecondary },
  { key: 'easy', label: 'Easy', color: colors.green },
  { key: 'medium', label: 'Medium', color: colors.primary },
  { key: 'hard', label: 'Hard', color: colors.red }
];

export default function PracticeScreen({ navigation }) {
  const [tab, setTab] = useState('all');
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [search, setSearch] = useState('');
  const [questions, setQuestions] = useState([]);
  const [bookmarked, setBookmarked] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/domains').then((r) => setDomains(r.data.domains || [])).catch(() => {});
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDomain) params.domain = selectedDomain;
      if (difficulty !== 'all') params.difficulty = difficulty;
      if (search) params.search = search;
      const { data } = await api.get('/questions', { params });
      setQuestions(data.questions || []);
    } catch (e) {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDomain, difficulty, search]);

  const loadBookmarks = useCallback(async () => {
    try {
      const { data } = await api.get('/questions/bookmarked');
      setBookmarked(data.questions || []);
      setBookmarkedIds(new Set((data.questions || []).map((q) => q._id)));
    } catch (e) {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadQuestions();
      loadBookmarks();
    }, [loadQuestions, loadBookmarks])
  );

  async function toggleBookmark(id) {
    try {
      const { data } = await api.post(`/questions/${id}/bookmark`);
      setBookmarkedIds((s) => {
        const n = new Set(s);
        if (data.bookmarked) n.add(id);
        else n.delete(id);
        return n;
      });
      loadBookmarks();
    } catch (e) {}
  }

  const list = tab === 'all' ? questions : bookmarked;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
        <Brand small />
        <Text style={styles.title}>Practice Questions</Text>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={loadQuestions}
          />
          <Pressable onPress={loadQuestions}>
            <Text style={{ color: '#fff' }}>🔍</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          <Pressable onPress={() => setTab('all')} style={styles.tab}>
            <Text style={[styles.tabIcon, tab === 'all' && { color: colors.star }]}>❓</Text>
            <Text style={[styles.tabLabel, tab === 'all' && { color: colors.star, fontWeight: '900' }]}>
              All Questions
            </Text>
          </Pressable>
          <Pressable onPress={() => setTab('bookmarked')} style={styles.tab}>
            <Text style={[styles.tabIcon, tab === 'bookmarked' && { color: colors.star }]}>🔖</Text>
            <Text
              style={[
                styles.tabLabel,
                tab === 'bookmarked' && { color: colors.star, fontWeight: '900' }
              ]}
            >
              Bookmarked
            </Text>
          </Pressable>
        </View>

        {tab === 'all' && (
          <Card>
            <Text style={styles.filterTitle}>Filters</Text>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              <Pressable
                onPress={() => setSelectedDomain('')}
                style={[styles.chip, !selectedDomain && styles.chipActive]}
              >
                <Text style={styles.chipTxt}>All</Text>
              </Pressable>
              {domains.map((d) => (
                <Pressable
                  key={d._id}
                  onPress={() => setSelectedDomain(d.slug)}
                  style={[styles.chip, selectedDomain === d.slug && styles.chipActive]}
                >
                  <Text style={styles.chipTxt}>{d.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.filterLabel, { marginTop: 12 }]}>Difficulty</Text>
            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              {DIFFICULTIES.map((d) => (
                <Pressable
                  key={d.key}
                  onPress={() => setDifficulty(d.key)}
                  style={[styles.dot, { borderColor: d.color }, difficulty === d.key && { backgroundColor: d.color }]}
                >
                  <Text style={styles.dotTxt}>{d.label}</Text>
                </Pressable>
              ))}
            </View>
            <Button
              title="Apply"
              onPress={loadQuestions}
              style={{ marginTop: spacing.md }}
              variant="outline"
            />
          </Card>
        )}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            <Text style={styles.count}>
              {tab === 'all' ? `${list.length} Questions found` : list.length === 0 ? '' : `${list.length} bookmarked`}
            </Text>
            {list.length === 0 && tab === 'bookmarked' && (
              <Card>
                <View style={{ alignItems: 'center', padding: spacing.lg }}>
                  <Text style={{ fontSize: 32 }}>🔖</Text>
                  <Text style={styles.empty}>No bookmarked questions</Text>
                  <Text style={styles.emptySub}>Bookmark questions you want to review later</Text>
                  <Button title="↻ Refresh" onPress={loadBookmarks} style={{ marginTop: 12 }} />
                </View>
              </Card>
            )}
            {list.map((q) => (
              <Pressable
                key={q._id}
                style={styles.qItem}
                onPress={() => setExpanded(expanded === q._id ? null : q._id)}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.qText}>{q.questionText}</Text>
                  <Pressable onPress={() => toggleBookmark(q._id)} style={{ paddingHorizontal: 8 }}>
                    <Text style={{ color: bookmarkedIds.has(q._id) ? colors.star : colors.textMuted }}>
                      {bookmarkedIds.has(q._id) ? '🔖' : '🔖'}
                    </Text>
                  </Pressable>
                  <Text style={{ color: colors.textMuted }}>{expanded === q._id ? '▲' : '▼'}</Text>
                </View>
                {expanded === q._id ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.answerHead}>Answer</Text>
                    <Text style={styles.answer}>{q.answerText || 'No answer provided.'}</Text>
                    {q.explanation ? (
                      <>
                        <Text style={styles.answerHead}>Explanation</Text>
                        <Text style={styles.answer}>{q.explanation}</Text>
                      </>
                    ) : null}
                  </View>
                ) : null}
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
      <BottomTabs active="Practice" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: spacing.sm },
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
  tabs: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.md },
  tab: { alignItems: 'center' },
  tabIcon: { fontSize: 20, color: colors.textSecondary },
  tabLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  filterTitle: { color: '#fff', fontWeight: '900' },
  filterLabel: { color: colors.textSecondary, marginTop: 4, fontSize: 12 },
  chip: {
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.cardAlt,
    marginRight: 8
  },
  chipActive: { backgroundColor: colors.primary },
  chipTxt: { color: '#fff', fontSize: 12 },
  dot: {
    width: 56,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 2,
    marginRight: 8,
    alignItems: 'center'
  },
  dotTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  count: { color: '#fff', marginTop: spacing.sm, marginBottom: 4 },
  qItem: { backgroundColor: colors.card, borderRadius: radii.md, padding: spacing.md, marginVertical: 4 },
  qText: { flex: 1, color: '#fff' },
  answerHead: { color: colors.primary, fontWeight: '700', marginTop: 6 },
  answer: { color: colors.textSecondary },
  empty: { color: '#fff', fontWeight: '700', marginTop: 8 },
  emptySub: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4 }
});
