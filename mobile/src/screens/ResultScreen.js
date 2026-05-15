import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Brand } from '../components/Screen';
import BottomTabs from '../components/BottomTabs';
import Card from '../components/Card';
import ProgressRing from '../components/ProgressRing';
import { api } from '../services/api';
import { downloadSessionReport } from '../services/downloadReport';
import { colors, radii, spacing } from '../theme';

export default function ResultScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [overall, setOverall] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);

  async function handleDownload(sessionId) {
    setDownloadingId(sessionId);
    try {
      await downloadSessionReport(sessionId);
    } catch (e) {
      Alert.alert('Download failed', e?.message || 'Could not download the report.');
    } finally {
      setDownloadingId(null);
    }
  }

  const load = useCallback(async () => {
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        api.get('/sessions'),
        api.get('/profile/stats')
      ]);
      setSessions(sessionsRes.data.sessions || []);
      setOverall(statsRes.data.stats.accuracy || 0);
    } catch (e) {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
        <Brand small />
        <Text style={styles.title}>Result</Text>

        <Text style={styles.section}>Performance Overview</Text>
        <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
          <ProgressRing value={overall} label="Overall Performance" />
        </View>

        <Text style={styles.section}>Interview History</Text>
        {sessions.length === 0 && (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
            No interviews yet — start one!
          </Text>
        )}
        {sessions
          .filter((s) => s.status === 'completed')
          .map((s) => (
            <Card key={s._id} variant="alt">
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>
                    {(s.domain && s.domain.name) || s.domainSlug} -{' '}
                    {new Date(s.createdAt).toLocaleDateString()}
                  </Text>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreTxt}>{s.overallScore || s.overallTechnical || 0}%</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Pressable onPress={() => navigation.navigate('Feedback', { sessionId: s._id })}>
                    <Text style={styles.link}>View Details</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDownload(s._id)}
                    disabled={downloadingId === s._id}
                    style={styles.pdfBtn}
                  >
                    {downloadingId === s._id ? (
                      <ActivityIndicator color={colors.primary} size="small" />
                    ) : (
                      <Text style={styles.pdfBtnTxt}>📄 PDF</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}
      </ScrollView>
      <BottomTabs active="Result" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', marginVertical: spacing.sm },
  section: { color: '#fff', fontWeight: '900', marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemTitle: { color: '#fff', fontWeight: '700' },
  scoreBadge: {
    backgroundColor: colors.successDark,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
    marginTop: 4
  },
  scoreTxt: { color: '#fff', fontWeight: '900' },
  link: { color: colors.primary, fontWeight: '700' },
  pdfBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 64,
    alignItems: 'center'
  },
  pdfBtnTxt: { color: colors.primary, fontWeight: '700', fontSize: 12 }
});
