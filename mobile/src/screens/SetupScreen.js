import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../components/Screen';
import BottomTabs from '../components/BottomTabs';
import Button from '../components/Button';
import Card from '../components/Card';
import { api } from '../services/api';
import { colors, radii, spacing } from '../theme';

function ToggleRow({ icon, title, desc, value, onChange }) {
  return (
    <Card variant="alt" style={styles.row}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.danger }} />
    </Card>
  );
}

export default function SetupScreen({ navigation, route }) {
  const domain = route?.params?.domain;
  const [textInput, setText] = useState(true);
  const [voiceInput, setVoice] = useState(true);
  const [webcam, setWebcam] = useState(false);
  const [loading, setLoading] = useState(false);

  async function start() {
    if (!domain) return Alert.alert('No domain', 'Pick a domain first.');
    setLoading(true);
    try {
      const { data } = await api.post('/sessions', {
        domain: domain.slug || domain._id,
        difficulty: 'medium',
        targetQuestions: 15,
        mode: { textInput, voiceInput, webcam }
      });
      navigation.replace('Interview', {
        sessionId: data.sessionId,
        question: data.question,
        index: data.index,
        total: data.total,
        domain: data.domain,
        mode: { textInput, voiceInput, webcam }
      });
    } catch (e) {
      Alert.alert('Could not start', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
        <Brand small />
        <Text style={styles.heading}>Interview Setup</Text>

        <ToggleRow
          icon="🖱"
          title="Allow text input for answers"
          desc="Type your responses"
          value={textInput}
          onChange={setText}
        />
        <Text style={styles.section}>Input Preferences</Text>
        <ToggleRow
          icon="🗣"
          title="Allow voice input for answers"
          desc="Speak your responses"
          value={voiceInput}
          onChange={setVoice}
        />
        <ToggleRow
          icon="📷"
          title="Enable WebCam"
          desc="Record video for body language analysis (Optional)"
          value={webcam}
          onChange={setWebcam}
        />

        <Button title="▶ Begin Interview" onPress={start} loading={loading} style={{ marginTop: spacing.lg }} />
      </ScrollView>
      <BottomTabs active="InterviewDomain" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  heading: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 20, marginRight: 12 },
  title: { color: '#fff', fontWeight: '700' },
  desc: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  section: { color: '#fff', fontWeight: '900', marginTop: spacing.md }
});
