import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { api } from '../services/api';
import { colors, spacing } from '../theme';

function Section({ title, body, suggestion }) {
  return (
    <Card variant="alt">
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {suggestion ? (
        <>
          <Text style={styles.suggestionHead}>Suggestion:</Text>
          <Text style={styles.suggestion}>{suggestion}</Text>
        </>
      ) : null}
    </Card>
  );
}

export default function SuggestionsScreen({ navigation, route }) {
  const { sessionId } = route.params;
  const [session, setSession] = useState(null);

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

  const s = session.suggestions || {};
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Brand small />
        <Text style={styles.title}>AI Personalized Suggestions</Text>

        <Section
          title="Technical Focus"
          body={`Your accuracy was ${session.overallTechnical || 0}%. Focus on the topics where you struggled.`}
          suggestion={s.technical || 'Review fundamentals and edge cases on the categories you missed.'}
        />
        <Section
          title="Voice Analysis"
          body={`Voice score: ${session.overallVoice || 0}%. Watch out for filler words and pacing.`}
          suggestion={s.voice || 'Practice short pauses instead of filler words.'}
        />
        <Section
          title="Body Language Analysis"
          body={`Body language score: ${session.overallBodyLanguage || 0}%.`}
          suggestion={s.bodyLanguage || 'Maintain steady eye contact and relaxed posture.'}
        />

        <Button title="Back to Feedback" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginVertical: spacing.sm },
  sectionTitle: { color: '#fff', fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  body: { color: colors.textSecondary, textAlign: 'center' },
  suggestionHead: { color: colors.primary, fontWeight: '900', marginTop: spacing.sm, textAlign: 'center' },
  suggestion: { color: colors.primary, textAlign: 'center', fontStyle: 'italic', marginTop: 4 }
});
