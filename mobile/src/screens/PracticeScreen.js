import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { api } from '../services/api';
import Button from '../components/Button';

export default function PracticeScreen() {
  const [domain, setDomain] = useState('software');
  const [question, setQuestion] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const recRef = useRef(null);

  async function fetchQuestion() {
    setBusy(true);
    setEvaluation(null);
    setTranscript(null);
    try {
      const { data } = await api.get('/practice/question', { params: { domain, difficulty: 'medium' } });
      setQuestion(data.question);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setBusy(false);
    }
  }

  async function startRec() {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) return Alert.alert('Microphone permission required');
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const r = new Audio.Recording();
    await r.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await r.startAsync();
    recRef.current = r;
    setRecording(true);
  }

  async function stopRec() {
    if (!recRef.current) return;
    setRecording(false);
    setBusy(true);
    try {
      await recRef.current.stopAndUnloadAsync();
      const uri = recRef.current.getURI();
      recRef.current = null;
      const form = new FormData();
      form.append('audio', { uri, name: 'answer.m4a', type: 'audio/m4a' });
      form.append('question', question);
      form.append('domain', domain);
      const { data } = await api.post('/practice/evaluate', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTranscript(data.transcript);
      setEvaluation(data.evaluation);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Domain</Text>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button
            title="Software Dev"
            variant={domain === 'software' ? 'primary' : 'secondary'}
            onPress={() => setDomain('software')}
          />
        </View>
        <View style={{ width: 8 }} />
        <View style={styles.flex}>
          <Button
            title="AI / Data Sci"
            variant={domain === 'ai_ds' ? 'primary' : 'secondary'}
            onPress={() => setDomain('ai_ds')}
          />
        </View>
      </View>

      <Button title="Get a question" onPress={fetchQuestion} loading={busy && !question} />

      {question ? (
        <View style={styles.card}>
          <Text style={styles.q}>{question}</Text>
        </View>
      ) : null}

      {question ? (
        recording ? (
          <Button title="Stop & Evaluate" onPress={stopRec} loading={busy} />
        ) : (
          <Button title="Record answer" onPress={startRec} disabled={busy} />
        )
      ) : null}

      {busy && !recording ? <ActivityIndicator color="#1f6feb" style={{ margin: 12 }} /> : null}

      {transcript ? (
        <View style={styles.card}>
          <Text style={styles.section}>Your transcript</Text>
          <Text style={styles.body}>{transcript}</Text>
        </View>
      ) : null}

      {evaluation ? (
        <View style={styles.card}>
          <Text style={styles.section}>Evaluation</Text>
          <Text style={styles.body}>
            Tech {evaluation.technicalScore} · Clarity {evaluation.clarityScore} · Conf{' '}
            {evaluation.confidenceScore}
          </Text>
          <Text style={[styles.body, { marginTop: 6 }]}>💡 {evaluation.suggestion}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: { color: '#555', marginTop: 8, marginBottom: 4 },
  row: { flexDirection: 'row' },
  flex: { flex: 1 },
  card: { backgroundColor: '#f5f7fb', padding: 14, borderRadius: 12, marginVertical: 10 },
  q: { fontSize: 17, lineHeight: 24 },
  section: { fontWeight: '600', marginBottom: 4 },
  body: { color: '#333', lineHeight: 20 }
});
