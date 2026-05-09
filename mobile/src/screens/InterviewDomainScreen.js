import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../components/Screen';
import BottomTabs from '../components/BottomTabs';
import Card from '../components/Card';
import Button from '../components/Button';
import { api } from '../services/api';
import { colors, radii, spacing } from '../theme';

const ICONS = {
  frontend: '</>',
  'data-science': '📊',
  devops: '⚙️',
  'cyber-security': '🛡',
  ai: '🧠',
  qa: '✅',
  web: '🌐'
};

export default function InterviewDomainScreen({ navigation }) {
  const [domains, setDomains] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.get('/domains').then((r) => setDomains(r.data.domains || [])).catch(() => {});
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
        <Brand small />
        <Text style={styles.title}>AI Interview</Text>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>🎤 AI Interview Simulator</Text>
          <Text style={styles.heroSub}>
            Practice with real interview questions and get instant AI-powered feedback
          </Text>
        </View>

        <Text style={styles.label}>Select Tech Domain</Text>
        <Pressable onPress={() => setOpen((o) => !o)} style={styles.dropdown}>
          <Text style={{ color: selected ? '#fff' : colors.textMuted }}>
            {selected ? selected.name : 'Choose a domain...'}
          </Text>
          <Text style={{ color: '#fff' }}>{open ? '▲' : '▼'}</Text>
        </Pressable>

        {open && (
          <Card>
            {domains.map((d) => (
              <Pressable
                key={d._id}
                onPress={() => {
                  setSelected(d);
                  setOpen(false);
                }}
                style={styles.option}
              >
                <Text style={styles.optionIcon}>{ICONS[d.slug] || '🧩'}</Text>
                <Text style={styles.optionLabel}>{d.name}</Text>
              </Pressable>
            ))}
          </Card>
        )}

        <Button
          title="Setup Preferences"
          onPress={() => {
            if (!selected) return;
            navigation.navigate('InterviewSetup', { domain: selected });
          }}
          disabled={!selected}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
      <BottomTabs active="InterviewDomain" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: spacing.sm },
  hero: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.lg
  },
  heroTitle: { color: '#fff', fontWeight: '900', fontSize: 18 },
  heroSub: { color: '#fff', marginTop: 4 },
  label: { color: '#fff', fontWeight: '700', marginTop: spacing.md },
  dropdown: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: 14,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  optionIcon: { fontSize: 18, marginRight: 12 },
  optionLabel: { color: '#fff' }
});
