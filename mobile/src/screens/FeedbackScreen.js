import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../services/api';
import Button from '../components/Button';

function ScoreBar({ label, value }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${v}%` }]} />
      </View>
      <Text style={styles.barValue}>{v}</Text>
    </View>
  );
}

export default function FeedbackScreen({ navigation, route }) {
  const { sessionId } = route.params;
  const [session, setSession] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/sessions/${sessionId}`);
        setSession(data.session);
      } catch (_) {}
    })();
  }, [sessionId]);

  if (!session) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Your Scorecard</Text>
      <Text style={styles.meta}>
        {session.domain === 'software' ? 'Software Dev' : 'AI / Data Sci'} · {session.difficulty} ·{' '}
        {session.turns?.length || 0} questions
      </Text>

      <View style={styles.card}>
        <ScoreBar label="Technical" value={session.overallTechnical} />
        <ScoreBar label="Clarity" value={session.overallClarity} />
        <ScoreBar label="Confidence" value={session.overallConfidence} />
      </View>

      {session.summary ? (
        <View style={styles.card}>
          <Text style={styles.section}>Summary</Text>
          <Text style={styles.body}>{session.summary}</Text>
        </View>
      ) : null}

      {session.tips?.length ? (
        <View style={styles.card}>
          <Text style={styles.section}>Tips</Text>
          {session.tips.map((t, i) => (
            <Text key={i} style={styles.tip}>
              • {t}
            </Text>
          ))}
        </View>
      ) : null}

      <Text style={styles.section}>Question by question</Text>
      {session.turns?.map((t, i) => (
        <View key={i} style={styles.turn}>
          <Text style={styles.turnQ}>
            Q{i + 1}. {t.question}
          </Text>
          <Text style={styles.turnT}>“{t.transcript || '—'}”</Text>
          <Text style={styles.turnScores}>
            tech {t.technicalScore ?? 0} · clarity {t.clarityScore ?? 0} · conf {t.confidenceScore ?? 0}
          </Text>
          {t.suggestion ? <Text style={styles.turnSuggest}>💡 {t.suggestion}</Text> : null}
        </View>
      ))}

      <Button title="Back to Home" onPress={() => navigation.replace('Home')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700' },
  meta: { color: '#666', marginBottom: 12 },
  card: { backgroundColor: '#f5f7fb', padding: 14, borderRadius: 12, marginVertical: 8 },
  section: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  body: { color: '#333', lineHeight: 20 },
  tip: { marginVertical: 2, color: '#333' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  barLabel: { width: 88, color: '#444' },
  barTrack: { flex: 1, height: 10, backgroundColor: '#e0e7ff', borderRadius: 6, overflow: 'hidden', marginHorizontal: 8 },
  barFill: { height: 10, backgroundColor: '#1f6feb' },
  barValue: { width: 30, textAlign: 'right', color: '#444' },
  turn: { backgroundColor: '#fafbff', padding: 12, borderRadius: 10, marginVertical: 6 },
  turnQ: { fontWeight: '600', marginBottom: 4 },
  turnT: { color: '#555', fontStyle: 'italic', marginBottom: 4 },
  turnScores: { color: '#444', fontSize: 12 },
  turnSuggest: { marginTop: 4, color: '#1f6feb' }
});
