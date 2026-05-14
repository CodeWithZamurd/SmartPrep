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
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('idle');
  const [recordingActive, setRecordingActive] = useState(false);
  const [permError, setPermError] = useState('');

  const audioRecRef = useRef(null);
  const camRef = useRef(null);
  const videoPromiseRef = useRef(null);
  const isLast = index + 1 >= total;

  const useCam = mode?.webcam === true;
  const useMic = mode?.voiceInput !== false || useCam;

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();

  // ---------- permissions on mount ----------
  useEffect(() => {
    (async () => {
      if (useCam && !camPerm?.granted) await requestCamPerm();
      if (useMic && !micPerm?.granted) await requestMicPerm();
    })();
    return () => {
      stopAudio().catch(() => {});
      stopVideo().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- auto-start recording per question ----------
  useEffect(() => {
    if (!useMic && !useCam) return;
    // Wait briefly so the camera ref mounts before we call recordAsync.
    const t = setTimeout(() => {
      startRecording();
    }, 350);
    return () => {
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, useCam, useMic, camPerm?.granted, micPerm?.granted]);

  async function startRecording() {
    setPermError('');
    try {
      if (useCam) {
        if (!camPerm?.granted) {
          const p = await requestCamPerm();
          if (!p?.granted) {
            setPermError('Camera permission denied');
            return;
          }
        }
        // expo-camera handles both video AND audio when recordAsync is called
        // with the mic permission granted and `mute` not set.
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        if (!camRef.current) return; // ref not mounted yet
        videoPromiseRef.current = camRef.current.recordAsync({
          maxDuration: 180,
          quality: '480p'
        });
        setRecordingActive(true);
      } else if (useMic) {
        const perm = await Audio.requestPermissionsAsync();
        if (!perm.granted) {
          setPermError('Microphone permission denied');
          return;
        }
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await rec.startAsync();
        audioRecRef.current = rec;
        setRecordingActive(true);
      }
    } catch (e) {
      setPermError(e.message || 'Could not start recording');
      setRecordingActive(false);
    }
  }

  async function stopAudio() {
    if (!audioRecRef.current) return null;
    try {
      await audioRecRef.current.stopAndUnloadAsync();
      const uri = audioRecRef.current.getURI();
      audioRecRef.current = null;
      return uri;
    } catch (e) {
      audioRecRef.current = null;
      return null;
    }
  }

  async function stopVideo() {
    if (!videoPromiseRef.current) return null;
    try {
      if (camRef.current) camRef.current.stopRecording();
      const result = await videoPromiseRef.current;
      videoPromiseRef.current = null;
      return result?.uri || null;
    } catch (e) {
      videoPromiseRef.current = null;
      return null;
    }
  }

  async function captureFrame() {
    if (!useCam || !camRef.current) return null;
    try {
      const photo = await camRef.current.takePictureAsync({
        quality: 0.5,
        skipProcessing: true,
        shutterSound: false
      });
      return photo?.uri || null;
    } catch (_) {
      return null;
    }
  }

  async function submit() {
    setBusy(true);
    setStage('uploading');
    try {
      let audioUri = null;
      let videoUri = null;
      let frameUri = null;

      if (useCam) {
        frameUri = await captureFrame();
        videoUri = await stopVideo();
        // expo-camera video recordings include audio — send as audio source too
        audioUri = videoUri;
      } else if (useMic) {
        audioUri = await stopAudio();
      }
      setRecordingActive(false);

      if (!text && !audioUri) {
        setBusy(false);
        setStage('idle');
        // Re-arm the recorder so user can try again
        startRecording();
        return Alert.alert(
          'No answer captured',
          useMic
            ? 'I did not catch any audio. Please speak your answer (or type it) and try again.'
            : 'Type your answer first.'
        );
      }

      const form = new FormData();
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (text) form.append('textFallback', text);
      if (audioUri) {
        const isMp4 = audioUri.endsWith('.mp4') || useCam;
        const name = isMp4 ? 'answer.mp4' : 'answer.m4a';
        const type = isMp4 ? 'video/mp4' : 'audio/m4a';
        form.append('audio', { uri: audioUri, name, type });
      }
      if (videoUri) {
        form.append('video', { uri: videoUri, name: 'answer.mp4', type: 'video/mp4' });
      }
      if (frameUri) {
        form.append('frame', { uri: frameUri, name: 'frame.jpg', type: 'image/jpeg' });
      }

      const { data } = await api.post(`/sessions/${sessionId}/answer`, form, { headers });
      if (data.done) {
        navigation.replace('Feedback', { sessionId });
      } else {
        setQuestion(data.question);
        setIndex(data.index);
        setText('');
        setStage('idle');
        // Next question's useEffect will auto-start the next recording.
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
            await stopAudio();
            await stopVideo();
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

        {useCam && (
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
                <Text style={{ color: '#fff' }}>{permError || 'Camera permission required'}</Text>
                <Button title="Grant permission" onPress={requestCamPerm} style={{ marginTop: 8 }} />
              </View>
            )}
            {recordingActive && (
              <View style={styles.recBadge}>
                <Text style={styles.recBadgeTxt}>● REC</Text>
              </View>
            )}
          </View>
        )}

        {useMic && (
          <View style={[styles.statusRow, recordingActive ? styles.statusRec : styles.statusIdle]}>
            <Text style={{ color: recordingActive ? colors.danger : colors.textSecondary, fontWeight: '700' }}>
              {recordingActive
                ? `🔴 Listening… speak your answer${useCam ? ' (camera + mic)' : ''}.`
                : permError || 'Recording paused.'}
            </Text>
          </View>
        )}

        {mode?.textInput !== false && (
          <View style={styles.answerBox}>
            <TextInput
              style={styles.input}
              placeholder={useMic ? 'Optional notes (the mic is your main answer)…' : 'Type your answer…'}
              placeholderTextColor={colors.textMuted}
              multiline
              value={text}
              onChangeText={setText}
            />
          </View>
        )}

        {permError ? (
          <Text style={{ color: colors.danger, fontSize: 12, marginTop: 6 }}>{permError}</Text>
        ) : null}

        {stage === 'uploading' ? (
          <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={{ color: colors.primary, marginTop: 6 }}>Analyzing your answer…</Text>
          </View>
        ) : (
          <Button
            title={isLast ? 'End Interview' : 'Submit & Next'}
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
    height: 200,
    backgroundColor: '#000',
    position: 'relative'
  },
  cam: { flex: 1 },
  camFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
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
  statusRow: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md
  },
  statusRec: { backgroundColor: 'rgba(255,92,92,0.15)' },
  statusIdle: { backgroundColor: colors.cardAlt },
  answerBox: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: 8,
    minHeight: 100,
    marginTop: spacing.md
  },
  input: { color: '#fff', minHeight: 90, textAlignVertical: 'top' }
});
