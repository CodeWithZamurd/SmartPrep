import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { api } from '../services/api';
import Button from '../components/Button';

export default function SetupScreen({ navigation }) {
  const [domain, setDomain] = useState('software');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);

  async function startSession() {
    setLoading(true);
    try {
      const { data } = await api.post('/sessions', {
        domain,
        difficulty,
        targetQuestions: count
      });
      navigation.replace('Interview', {
        sessionId: data.sessionId,
        question: data.question,
        index: data.index,
        total: data.total
      });
    } catch (e) {
      Alert.alert('Could not start', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
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

      <Text style={styles.label}>Difficulty</Text>
      <View style={styles.row}>
        {['easy', 'medium', 'hard'].map((d) => (
          <View style={styles.flex} key={d}>
            <Button
              title={d}
              variant={difficulty === d ? 'primary' : 'secondary'}
              onPress={() => setDifficulty(d)}
            />
          </View>
        ))}
      </View>

      <Text style={styles.label}>Number of questions</Text>
      <View style={styles.row}>
        {[3, 5, 8].map((n) => (
          <View style={styles.flex} key={n}>
            <Button
              title={`${n}`}
              variant={count === n ? 'primary' : 'secondary'}
              onPress={() => setCount(n)}
            />
          </View>
        ))}
      </View>

      <View style={{ height: 16 }} />
      <Button title="Start interview" onPress={startSession} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { color: '#555', marginTop: 12, marginBottom: 4 },
  row: { flexDirection: 'row' },
  flex: { flex: 1 }
});
