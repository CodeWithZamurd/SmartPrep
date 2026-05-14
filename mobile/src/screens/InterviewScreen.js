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
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
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
  const [videoUri, setVideoUri] = useState(null);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const audioRecRef = useRef(null);
  const camRef = useRef(null);
  const videoStopRef = useRef(null);
  const isLast = index + 1 >= total;

  const webcamEnabled = !!mode?.webcam;
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();

  useEffect(() => {
    (async () => {
      if (webcamEnabled) {
        if (!camPerm?.granted) await requestCamPerm();
        if (!micPerm?.granted) await requestMicPerm();
      }
    })();
    return () => {
      if (audioRecRef.current) audioRecRef.current.stopAndUnloadAsync().catch(() => {});
    };
  }, [webcamEnabled]);

  // ---------- audio recording (voice answer) ----------
  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return Alert.alert('Microphone permission required');
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      audioRecRef.current = rec;
      setRecordedUri(null);
      setIsRecording(true);
      setStage('recording');
    } catch (e) {
      Alert.alert('Recording error', e.message);
    }
  }

  async function stopRecording() {
    if (!audioRecRef.current) return;
    try {
      await audioRecRef.current.stopAndUnloadAsync();
      const uri = audioRecRef.current.getURI();
      audioRecRef.current = null;
      setRecordedUri(uri);
      setIsRecording(false);
      setStage('idle');
    } catch (e) {
      setIsRecording(false);
      setStage('idle');
    }
  }

  // ---------- video recording (webcam, optional) ----------
  async function startVideoRecording() {
    if (!camRef.current || isVideoRecording) return;
    try {
      setIsVideoRecording(true);
      setVideoUri(null);
      // recordAsync resolves with { uri } when stopRecording() is called
      const promise = camRef.current.recordAsync({ maxDuration: 180, mute: true });
      videoStopRef.current = promise;
      const result = await promise;
      if (result?.uri) setVideoUri(result.uri);
      setIsVideoRecording(false);
    } catch (e) {
      setIsVideoRecording(false);
    }
  }

  async function stopVideoAndCaptureFrame() {
    let frameUri = null;
    if (camRef.current) {
      try {
        const photo = await camRef.current.takePictureAsync({
          quality: 0.5,
          skipProcessing: true,
          shutterSound: false
        });
        frameUri = photo?.uri || null;
      } catch (_) {}
    }
    if (isVideoRecording && camRef.current) {
      try {
        camRef.current.stopRecording();
      } catch (_) {}
      // Wait for recordAsync to resolve
      try {
        const result = await videoStopRef.current;
        if (result?.uri) setVideoUri(result.uri);
      } catch (_) {}
    }
    return frameUri;
  }

  // Auto-start video recording for each turn when webcam is enabled
  useEffect(() => {
    if (webcamEnabled && camPerm?.granted && !isVideoRecording && !busy) {
      startVideoRecording();
    }
  }, [index, webcamEnabled, camPerm?.granted]);

  // ---------- submit ----------
  async function submit() {
    let audioUri = recordedUri;
    if (!audioUri && audioRecRef.current) {
      try {
        await audioRecRef.current.stopAndUnloadAsync();
        audioUri = audioRecRef.current.getURI();
        audioRecRef.current = null;
        setIsRecording(false);
      } catch (_) {}
    }
    if (!text && !audioUri) {
      return Alert.alert('No answer', 'Type or record an answer first.');
    }

    setBusy(true);
    setStage('uploading');
    try {
      const form = new FormData();
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (audioUri) form.append('audio', { uri: audioUri, name: 'answer.m4a', type: 'audio/m4a' });
      if (text) form.append('textFallback', text);

      if (webcamEnabled && camPerm?.granted) {
        const frameUri = await stopVideoAndCaptureFrame();
        if (frameUri) form.append('frame', { uri: frameUri, name: 'frame.jpg', type: 'image/jpeg' });
        if (videoUri) form.append('video', { uri: videoUri, name: 'answer.mp4', type: 'video/mp4' });
      }

      const { data } = await api.post(`/sessions/${sessionId}/answer`, form, { headers });
      if (data.done) {
        navigation.replace('Feedback', { sessionId });
      } else {
        setQuestion(data.question);
        setIndex(data.index);
        setText('');
        setRecordedUri(null);
        setVideoUri(null);
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
            if (audioRecRef.current) await audioRecRef.current.stopAndUnloadAsync().catch(() => {});
            if (isVideoRecording && camRef.current) camRef.current.stopRecording();
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

        {webcamEnabled && (
          <View style={styles.camWrap}>
            {camPerm?.granted ? (
              <CameraView
                ref={camRef}
                style={styles.cam}
                facing="front"
                mode="video"
                videoQuality="480p"
              />
            ) : (
              <View style={styles.camFallback}>
                <Text style={{ color: '#fff' }}>Camera permission required</Text>
                <Button title="Grant permission" onPress={requestCamPerm} style={{ marginTop: 8 }} />
              </View>
            )}
            {isVideoRecording && (
              <View style={styles.recBadge}>
                <Text style={styles.recBadgeTxt}>● REC</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.botRow}>
          <Text style={{ fontSize: 64 }}>🤖</Text>
          {isRecording && <Text style={styles.recDot}>🔴 Recording voice…</Text>}
        </View>

        {mode?.textInput !== false && (
          <View style={styles.answerBox}>
            <TextInput
              style={styles.input}
              placeholder="Type your answer……"
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
  camWrap: {
    marginTop: spacing.md,
    borderRadius: radii.md,
    overflow: 'hidden',
    height: 180,
    backgroundColor: '#000',
    position: 'relative'
  },
  cam: { flex: 1 },
  camFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  recBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,92,92,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4
  },
  recBadgeTxt: { color: '#fff', fontWeight: '900', fontSize: 11 },
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
