import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../components/Screen';
import Button from '../components/Button';
import Card from '../components/Card';
import { api } from '../services/api';
import { colors, radii, spacing } from '../theme';

export default function QuestionDetailsScreen({ navigation, route }) {
  const { sessionId } = route.params;
  const [session, setSession] = useState(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    api
      .get(`/sessions/${sessionId}`)
      .then((r) => setSession(r.data.session))
      .catch(() => {});
  }, [sessionId]);

  if (!session) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const turn = session.turns[idx] || {};
  const total = session.turns.length;
  const correct = turn.correct;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
        <Brand small />
        <Text style={styles.title}>Question Details</Text>

        <Card variant="alt">
          <Text style={styles.head}>
            Question no <Text style={{ color: colors.primary }}>{idx + 1}</Text> of {total}
          </Text>
          <View style={[styles.badge, { backgroundColor: correct ? colors.successDark : colors.danger }]}>
            <Text style={styles.badgeTxt}>{correct ? 'Correct' : 'Incorrect'}</Text>
          </View>
          <Text style={styles.q}>{turn.question}</Text>

          <View style={styles.answerBox}>
            <Text style={styles.answer}>{turn.transcript || 'No answer recorded.'}</Text>
          </View>

          <Text style={styles.feedHead}>AI Feedback</Text>
          <Text style={styles.feed}>
            {turn.suggestion ||
              (correct
                ? "Your answer is correct. You've correctly identified the distinction."
                : 'Review the relevant fundamentals and try to be more precise.')}
          </Text>
        </Card>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Button
              title="◀ Prev"
              variant="secondary"
              onPress={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Next ▶"
              variant="secondary"
              onPress={() => setIdx((i) => Math.min(total - 1, i + 1))}
              disabled={idx >= total - 1}
            />
          </View>
        </View>

        <Button
          title="Back to Feedback"
          onPress={() => navigation.goBack()}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginVertical: spacing.sm },
  head: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: radii.pill,
    marginVertical: spacing.sm
  },
  badgeTxt: { color: '#fff', fontWeight: '900' },
  q: { color: '#fff', textAlign: 'center', marginVertical: spacing.sm },
  answerBox: { backgroundColor: '#fff', borderRadius: radii.md, padding: spacing.md, minHeight: 80 },
  answer: { color: '#222' },
  feedHead: { color: colors.primary, fontWeight: '900', textAlign: 'center', marginTop: spacing.md },
  feed: { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }
});
