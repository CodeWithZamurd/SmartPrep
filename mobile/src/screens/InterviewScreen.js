import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { api } from '../services/api';
import Button from '../components/Button';

export default function InterviewScreen({ navigation, route }) {
  const { sessionId, question: initialQ, index: initialIdx, total } = route.params;
  const [question, setQuestion] = useState(initialQ);
  const [index, setIndex] = useState(initialIdx);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('idle'); // idle | recording | uploading
  const recRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recRef.current) {
        recRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Microphone permission required');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      recRef.current = rec;
      setRecording(rec);
      setIsRecording(true);
      setStage('recording');
    } catch (e) {
      Alert.alert('Recording error', e.message);
    }
  }

  async function stopAndSubmit() {
    if (!recRef.current) return;
    setStage('uploading');
    setBusy(true);
    try {
      await recRef.current.stopAndUnloadAsync();
      const uri = recRef.current.getURI();
      recRef.current = null;
      setIsRecording(false);

      const form = new FormData();
      form.append('audio', { uri, name: 'answer.m4a', type: 'audio/m4a' });
      const { data } = await api.post(`/sessions/${sessionId}/answer`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.done) {
        navigation.replace('Feedback', { sessionId });
      } else {
        setQuestion(data.question);
        setIndex(data.index);
        setStage('idle');
      }
    } catch (e) {
      Alert.alert('Submission failed', e?.response?.data?.error || e.message);
      setStage('idle');
    } finally {
      setBusy(false);
    }
  }

  async function abort() {
    Alert.alert('End session?', 'Your progress will be saved as abandoned.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End',
        style: 'destructive',
        onPress: async () => {
          try {
            if (recRef.current) await recRef.current.stopAndUnloadAsync().catch(() => {});
            await api.post(`/sessions/${sessionId}/abandon`);
          } catch (_) {}
          navigation.replace('Home');
        }
      }
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Question {index + 1} of {total}
      </Text>
      <View style={styles.card}>
        <Text style={styles.q}>{question}</Text>
      </View>

      {stage === 'uploading' ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1f6feb" />
          <Text style={styles.status}>Analyzing your answer…</Text>
        </View>
      ) : isRecording ? (
        <>
          <Text style={styles.status}>● Recording</Text>
          <Button title="Stop & Submit" onPress={stopAndSubmit} loading={busy} />
        </>
      ) : (
        <>
          <Text style={styles.hint}>Tap below and speak your answer aloud.</Text>
          <Button title="Start Recording" onPress={startRecording} />
        </>
      )}

      <View style={{ flex: 1 }} />
      <Button title="End session" variant="secondary" onPress={abort} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  progress: { color: '#666', marginBottom: 8 },
  card: { backgroundColor: '#eef4ff', padding: 16, borderRadius: 12, marginBottom: 16 },
  q: { fontSize: 18, lineHeight: 26 },
  hint: { color: '#666', marginVertical: 8, textAlign: 'center' },
  status: { textAlign: 'center', color: '#1f6feb', fontWeight: '600', marginVertical: 8 },
  center: { alignItems: 'center', marginVertical: 12 }
});
