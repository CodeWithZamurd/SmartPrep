import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { downloadSessionReport } from '../services/downloadReport';
import { Brand } from '../components/Screen';
import BottomTabs from '../components/BottomTabs';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressRing from '../components/ProgressRing';
import { colors, radii, spacing } from '../theme';

function ScoreCard({ icon, title, score, color = colors.green, children }) {
  return (
    <Card variant="alt">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.cardTitle}>
          {icon} {title}
        </Text>
        <Text style={[styles.cardScore, { color }]}>{score}%</Text>
      </View>
      <Text style={styles.scoreLabel}>Score:</Text>
      {children}
    </Card>
  );
}

function MetricRow({ items }) {
  return (
    <View style={styles.metricRow}>
      {items.map((m) => (
        <View key={m.label} style={styles.metric}>
          <Text style={[styles.metricLabel, { color: m.color }]}>{m.label}</Text>
          <Text style={styles.metricVal}>{m.value}/100</Text>
        </View>
      ))}
    </View>
  );
}

export default function FeedbackScreen({ navigation, route }) {
  const { sessionId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/feedback/session/${sessionId}`);
        setData(data);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <Text style={styles.empty}>No feedback available.</Text>
      </SafeAreaView>
    );
  }

  const { feedback, session } = data;
  const overall = session.overallScore || 0;
  const correct = (session.turns || []).filter((t) => t.correct).length;
  const total = session.turns?.length || session.targetQuestions;
  const verdict = overall >= 75 ? 'Strong Candidate' : overall >= 60 ? 'Promising' : 'Needs Practice';

  async function downloadReport() {
    setDownloading(true);
    try {
      await downloadSessionReport(sessionId);
    } catch (e) {
      Alert.alert('Download failed', e?.message || 'Could not download the report.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
        <Brand small />
        <Text style={styles.title}>AI Interview Feedback</Text>

        {tab === 'overview' && (
          <>
            <Text style={styles.sub}>Here's a complete feedback of your interview</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.cardTitle}>Category: </Text>
              <Text style={[styles.cardTitle, { color: colors.star }]}>
                {session.domain?.name || session.domainSlug}
              </Text>
            </View>

            <Text style={styles.sectionLabel}>Overall Performance</Text>
            <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
              <ProgressRing value={overall} label={verdict} />
            </View>
            <Text style={styles.detailHead}>Detailed Feedback</Text>

            <ScoreCard icon="📈" title="Technical Accuracy" score={feedback.technicalScore || 0}>
              <View style={styles.scoreBox}>
                <Text style={{ color: '#fff' }}>
                  Question Correct:{' '}
                  <Text style={{ color: colors.green, fontWeight: '900' }}>{correct}/{total}</Text>
                </Text>
              </View>
            </ScoreCard>

            <ScoreCard icon="🎤" title="Voice Analysis" score={feedback.voiceScore || 0}>
              <View style={styles.scoreBox}>
                <MetricRow
                  items={[
                    { label: 'Filler Words', value: session.voiceMetrics?.fillerWords ?? 0, color: colors.yellow },
                    { label: 'Pacing', value: session.voiceMetrics?.pacing ?? 0, color: colors.green }
                  ]}
                />
                <MetricRow
                  items={[
                    { label: 'Clarity', value: session.voiceMetrics?.clarity ?? 0, color: colors.red },
                    { label: 'Tone and Confidence', value: session.voiceMetrics?.toneConfidence ?? 0, color: colors.green }
                  ]}
                />
              </View>
            </ScoreCard>
            <Pressable onPress={() => setTab('detailed')} style={{ alignSelf: 'flex-end' }}>
              <Text style={styles.link}>See Detailed →</Text>
            </Pressable>
            <Button
              title={downloading ? 'Preparing PDF…' : '📄 Download Report (PDF)'}
              onPress={downloadReport}
              variant="outline"
              loading={downloading}
              style={{ marginTop: spacing.md }}
            />
          </>
        )}

        {tab === 'detailed' && (
          <>
            <Text style={styles.detailHead}>Detailed Feedback</Text>
            <ScoreCard icon="📈" title="Technical Accuracy" score={feedback.technicalScore || 0}>
              <View style={styles.scoreBox}>
                <Text style={{ color: '#fff' }}>
                  Question Correct:{' '}
                  <Text style={{ color: colors.green, fontWeight: '900' }}>{correct}/{total}</Text>
                </Text>
              </View>
            </ScoreCard>
            <ScoreCard icon="🎤" title="Voice Analysis" score={feedback.voiceScore || 0}>
              <View style={styles.scoreBox}>
                <MetricRow
                  items={[
                    { label: 'Filler Words', value: session.voiceMetrics?.fillerWords ?? 0, color: colors.yellow },
                    { label: 'Pacing', value: session.voiceMetrics?.pacing ?? 0, color: colors.green }
                  ]}
                />
                <MetricRow
                  items={[
                    { label: 'Clarity', value: session.voiceMetrics?.clarity ?? 0, color: colors.red },
                    { label: 'Tone and Confidence', value: session.voiceMetrics?.toneConfidence ?? 0, color: colors.green }
                  ]}
                />
              </View>
            </ScoreCard>
            <ScoreCard icon="🧍" title="Body Language Analysis" score={feedback.bodyLanguageScore || 0}>
              <View style={styles.scoreBox}>
                <MetricRow
                  items={[
                    { label: 'Eye Contact', value: session.bodyMetrics?.eyeContact ?? 0, color: colors.green },
                    { label: 'Facial Sentiment', value: session.bodyMetrics?.facialSentiment ?? 0, color: colors.yellow }
                  ]}
                />
                <MetricRow
                  items={[
                    { label: 'Fidgeting Detection', value: session.bodyMetrics?.fidgeting ?? 0, color: colors.red },
                    { label: 'Posture', value: session.bodyMetrics?.posture ?? 0, color: colors.green }
                  ]}
                />
              </View>
            </ScoreCard>
            <Pressable
              onPress={() => navigation.navigate('QuestionDetails', { sessionId })}
              style={{ alignSelf: 'flex-end' }}
            >
              <Text style={styles.link}>See Question Details →</Text>
            </Pressable>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.lg }}>
              <View style={{ flex: 1 }}>
                <Button title="See Suggestions" onPress={() => navigation.navigate('Suggestions', { sessionId })} />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={downloading ? 'Preparing PDF…' : 'Download Report'}
                  onPress={downloadReport}
                  variant="outline"
                  loading={downloading}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <BottomTabs active="Result" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', marginVertical: spacing.xs },
  sub: { color: colors.textSecondary, marginBottom: 6 },
  sectionLabel: { color: '#fff', fontWeight: '900', marginTop: spacing.md },
  detailHead: { color: '#fff', fontWeight: '900', marginVertical: spacing.sm },
  cardTitle: { color: '#fff', fontWeight: '900' },
  cardScore: { fontWeight: '900' },
  scoreLabel: { color: colors.textSecondary, marginTop: 4 },
  scoreBox: { backgroundColor: colors.card, borderRadius: radii.md, padding: 10, marginTop: 6 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  metric: { flexBasis: '48%' },
  metricLabel: { fontSize: 12, fontWeight: '700' },
  metricVal: { color: '#fff', fontWeight: '700', marginTop: 2 },
  link: { color: colors.primary, fontWeight: '700', marginTop: 4 },
  empty: { color: '#fff', textAlign: 'center', marginTop: 40 }
});
