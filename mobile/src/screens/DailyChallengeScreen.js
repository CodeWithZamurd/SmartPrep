import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../components/Screen';
import BottomTabs from '../components/BottomTabs';
import Card from '../components/Card';
import { api } from '../services/api';
import { colors, spacing } from '../theme';

export default function DailyChallengeScreen({ route }) {
  const initial = route?.params?.challenge || null;
  const [data, setData] = useState(initial);

  useEffect(() => {
    if (!data) {
      api.get('/challenge').then((r) => setData(r.data)).catch(() => {});
    }
  }, [data]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
        <Brand small />
        <Text style={styles.heading}>Daily AI Challenge</Text>

        <Card variant="alt">
          <Text style={styles.section}>Question</Text>
          <Text style={styles.body}>{data?.question || 'Loading…'}</Text>
        </Card>

        <Card variant="alt">
          <Text style={styles.section}>Answer</Text>
          <Text style={styles.body}>{data?.answer || ''}</Text>
        </Card>

        <Card variant="alt">
          <Text style={styles.section}>Detailed Explanation</Text>
          <Text style={styles.body}>{data?.explanation || data?.detailed || ''}</Text>
        </Card>
      </ScrollView>
      <BottomTabs active="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  heading: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginVertical: spacing.sm },
  section: { color: colors.primary, fontSize: 16, fontWeight: '900', marginBottom: 6 },
  body: { color: colors.textSecondary, lineHeight: 20 }
});
