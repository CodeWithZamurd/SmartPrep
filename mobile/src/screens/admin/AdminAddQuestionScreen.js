import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../../components/Screen';
import Button from '../../components/Button';
import { api } from '../../services/api';
import { colors, radii, spacing } from '../../theme';

const DIFFS = ['easy', 'medium', 'hard'];

export default function AdminAddQuestionScreen({ navigation, route }) {
  const editing = route?.params?.question;
  const [questionText, setQuestionText] = useState(editing?.questionText || '');
  const [answerText, setAnswerText] = useState(editing?.answerText || '');
  const [explanation, setExplanation] = useState(editing?.explanation || '');
  const [domains, setDomains] = useState([]);
  const [domainId, setDomainId] = useState(editing?.domain?._id || editing?.domain || '');
  const [diff, setDiff] = useState(editing?.difficultyLevel || 'easy');
  const [openDomains, setOpenDomains] = useState(false);
  const [openDiff, setOpenDiff] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/domains').then((r) => {
      setDomains(r.data.domains || []);
      if (!domainId && r.data.domains?.[0]) setDomainId(r.data.domains[0]._id);
    });
  }, []);

  async function submit() {
    if (!questionText || !domainId) {
      return Alert.alert('Missing', 'Question text and domain are required.');
    }
    setLoading(true);
    try {
      const payload = { questionText, answerText, explanation, domain: domainId, difficultyLevel: diff };
      if (editing) {
        await api.patch(`/questions/${editing._id}`, payload);
      } else {
        await api.post('/questions', payload);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Save failed', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedDomain = domains.find((d) => d._id === domainId);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Brand small />
        <Text style={styles.title}>{editing ? 'Edit Question' : 'Add New Question'}</Text>
        <Text style={styles.sub}>Fill in the question details</Text>

        <Text style={styles.label}>Question Text</Text>
        <TextInput
          style={styles.area}
          placeholder="Enter your question here..."
          placeholderTextColor={colors.textMuted}
          multiline
          value={questionText}
          onChangeText={setQuestionText}
        />

        <Text style={styles.label}>Answer (optional)</Text>
        <TextInput
          style={styles.area}
          placeholder="Model answer"
          placeholderTextColor={colors.textMuted}
          multiline
          value={answerText}
          onChangeText={setAnswerText}
        />

        <Text style={styles.label}>Explanation (optional)</Text>
        <TextInput
          style={styles.area}
          placeholder="Detailed explanation"
          placeholderTextColor={colors.textMuted}
          multiline
          value={explanation}
          onChangeText={setExplanation}
        />

        <Text style={[styles.label, { textAlign: 'center', marginTop: spacing.lg }]}>Domain</Text>
        <Pressable onPress={() => setOpenDomains((o) => !o)} style={styles.pill}>
          <Text style={styles.pillTxt}>{selectedDomain ? selectedDomain.name : 'Select domain'} ▾</Text>
        </Pressable>
        {openDomains && (
          <View style={styles.dropdown}>
            {domains.map((d) => (
              <Pressable
                key={d._id}
                onPress={() => {
                  setDomainId(d._id);
                  setOpenDomains(false);
                }}
                style={styles.opt}
              >
                <Text style={{ color: '#fff' }}>{d.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={[styles.label, { textAlign: 'center', marginTop: spacing.md }]}>Type</Text>
        <Pressable onPress={() => setOpenDiff((o) => !o)} style={[styles.pill, { backgroundColor: '#fff' }]}>
          <Text style={[styles.pillTxt, { color: colors.bg }]}>{diff} ▾</Text>
        </Pressable>
        {openDiff && (
          <View style={styles.dropdown}>
            {DIFFS.map((d) => (
              <Pressable
                key={d}
                onPress={() => {
                  setDiff(d);
                  setOpenDiff(false);
                }}
                style={styles.opt}
              >
                <Text style={{ color: '#fff' }}>{d}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.xl }}>
          <View style={{ flex: 1 }}>
            <Button title="Cancel" variant="primary" onPress={() => navigation.goBack()} />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={editing ? 'Save' : 'Add Question'}
              onPress={submit}
              loading={loading}
              variant="secondary"
              textStyle={{ color: '#fff' }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: spacing.sm },
  sub: { color: colors.textMuted, marginBottom: spacing.md },
  label: { color: '#fff', fontWeight: '900', marginTop: spacing.md, marginBottom: 6 },
  area: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    color: '#fff',
    minHeight: 90,
    borderWidth: 1,
    borderColor: colors.primary,
    textAlignVertical: 'top'
  },
  pill: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    marginTop: 6
  },
  pillTxt: { color: colors.primary, fontWeight: '700' },
  dropdown: { backgroundColor: colors.card, borderRadius: radii.md, marginTop: 6 },
  opt: { padding: 12, borderBottomColor: colors.divider, borderBottomWidth: 1 }
});
