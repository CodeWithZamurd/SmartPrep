import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Pressable,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { api } from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';
import { Brand } from '../components/Screen';
import BottomTabs from '../components/BottomTabs';
import { colors, radii, spacing } from '../theme';

export default function InterviewScreen({ navigation, route }) {
  const { sessionId, question: initialQ, index: initialIdx, total, domain, mode } = route.params;
  const [question, setQuestion] = useState(initialQ);
  const [index, setIndex] = useState(initialIdx);
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('idle');
  const recRef = useRef(null);
  const isLast = index + 1 >= total;

  useEffect(() => {
    return () => {
      if (recRef.current) recRef.current.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return Alert.alert('Microphone permission required');
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      recRef.current = rec;
      setRecordedUri(null);
      setIsRecording(true);
      setStage('recording');
    } catch (e) {
      Alert.alert('Recording error', e.message);
    }
  }

  async function stopRecording() {
    if (!recRef.current) return;
    try {
      await recRef.current.stopAndUnloadAsync();
      const uri = recRef.current.getURI();
      recRef.current = null;
      setRecordedUri(uri);
      setIsRecording(false);
      setStage('idle');
    } catch (e) {
      setIsRecording(false);
      setStage('idle');
    }
  }

  async function submit() {
    let uri = recordedUri;
    if (!uri && recRef.current) {
      try {
        await recRef.current.stopAndUnloadAsync();
        uri = recRef.current.getURI();
        recRef.current = null;
        setIsRecording(false);
      } catch (_) {}
    }
    if (!text && !uri) {
      return Alert.alert('No answer', 'Type or record an answer first.');
    }
    setBusy(true);
    setStage('uploading');
    try {
      const payload = new FormData();
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (uri) payload.append('audio', { uri, name: 'answer.m4a', type: 'audio/m4a' });
      if (text) payload.append('textFallback', text);
      const { data } = await api.post(`/sessions/${sessionId}/answer`, payload, { headers });
      if (data.done) {
        navigation.replace('Feedback', { sessionId });
      } else {
        setQuestion(data.question);
        setIndex(data.index);
        setText('');
        setRecordedUri(null);
        setStage('idle');
      }
    } catch (e) {
      Alert.alert('Submission failed', e?.response?.data?.error || e.message);
      setStage('idle');
    } finally {
      setBusy(false);
    }
  }

  async function endSession() {
    Alert.alert('End interview?', 'Your progress so far will be saved.', [
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
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
        <Brand small />
        <Text style={styles.title}>AI Interview</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Category: </Text>
          <Text style={styles.metaVal}>{(domain && domain.name) || 'General'}</Text>
        </View>
        <Text style={styles.progress}>
          Question {index + 1} of {total}
        </Text>

        <Card variant="alt">
          <Text style={styles.q}>{question}</Text>
        </Card>

        <View style={styles.botRow}>
          <Text style={{ fontSize: 64 }}>🤖</Text>
          {isRecording && <Text style={styles.recDot}>🔴 Recording…</Text>}
        </View>

        {mode?.textInput !== false && (
          <View style={styles.answerBox}>
            <TextInput
              style={styles.input}
              placeholder="Type your answer......"
              placeholderTextColor={colors.textMuted}
              multiline
              value={text}
              onChangeText={setText}
            />
          </View>
        )}

        {mode?.voiceInput !== false && (
          <View style={{ marginVertical: spacing.sm }}>
            {isRecording ? (
              <Button title="⏹ Stop Recording" onPress={stopRecording} variant="danger" />
            ) : recordedUri ? (
              <Button title="🎤 Re-record" onPress={startRecording} variant="outline" />
            ) : (
              <Button title="🎤 Record Voice" onPress={startRecording} variant="outline" />
            )}
            {recordedUri ? (
              <Text style={{ color: colors.green, marginTop: 6, fontSize: 12 }}>
                ✓ Voice recorded
              </Text>
            ) : null}
          </View>
        )}

        {stage === 'uploading' ? (
          <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={{ color: colors.primary, marginTop: 6 }}>Analyzing your answer…</Text>
          </View>
        ) : (
          <Button
            title={isLast ? 'End Interview' : 'Next Question'}
            onPress={submit}
            loading={busy}
            style={{ marginTop: spacing.md }}
          />
        )}

        <Pressable onPress={endSession} style={{ alignSelf: 'center', marginTop: spacing.md }}>
          <Text style={{ color: colors.danger }}>End session</Text>
        </Pressable>
      </ScrollView>
      <BottomTabs active="InterviewDomain" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: spacing.sm },
  metaRow: { flexDirection: 'row' },
  metaLabel: { color: '#fff', fontWeight: '700' },
  metaVal: { color: colors.star, fontWeight: '900' },
  progress: { color: '#fff', marginVertical: 6, fontWeight: '700' },
  q: { color: '#fff', fontSize: 16, lineHeight: 22 },
  botRow: { alignItems: 'center', marginVertical: spacing.md },
  recDot: { color: colors.danger, marginTop: 4, fontWeight: '700' },
  answerBox: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: 8,
    minHeight: 100
  },
  input: { color: '#fff', minHeight: 90, textAlignVertical: 'top' }
});
