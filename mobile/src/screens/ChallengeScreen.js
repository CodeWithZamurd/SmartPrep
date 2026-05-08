import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { api } from '../services/api';
import Button from '../components/Button';

export default function ChallengeScreen() {
  const [domain, setDomain] = useState('software');
  const [item, setItem] = useState(null);
  const [picked, setPicked] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setPicked(null);
    setItem(null);
    try {
      const { data } = await api.get('/challenge', { params: { domain } });
      setItem(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button
            title="Software"
            variant={domain === 'software' ? 'primary' : 'secondary'}
            onPress={() => setDomain('software')}
          />
        </View>
        <View style={{ width: 8 }} />
        <View style={styles.flex}>
          <Button
            title="AI / DS"
            variant={domain === 'ai_ds' ? 'primary' : 'secondary'}
            onPress={() => setDomain('ai_ds')}
          />
        </View>
      </View>
      <Button title="New challenge" onPress={load} loading={loading} />

      {loading || !item ? (
        <ActivityIndicator color="#1f6feb" style={{ margin: 16 }} />
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.q}>{item.question}</Text>
          </View>
          {item.options.map((opt, i) => {
            const showResult = picked !== null;
            const isCorrect = i === item.correctIndex;
            const isPicked = picked === i;
            return (
              <TouchableOpacity
                key={i}
                disabled={showResult}
                style={[
                  styles.option,
                  showResult && isCorrect && styles.correct,
                  showResult && isPicked && !isCorrect && styles.wrong
                ]}
                onPress={() => setPicked(i)}
              >
                <Text style={styles.optionText}>{String.fromCharCode(65 + i)}. {opt}</Text>
              </TouchableOpacity>
            );
          })}
          {picked !== null ? (
            <View style={styles.card}>
              <Text style={styles.section}>
                {picked === item.correctIndex ? '✅ Correct!' : '❌ Not quite.'}
              </Text>
              <Text style={styles.body}>{item.explanation}</Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  row: { flexDirection: 'row' },
  flex: { flex: 1 },
  card: { backgroundColor: '#f5f7fb', padding: 14, borderRadius: 12, marginVertical: 8 },
  q: { fontSize: 17, lineHeight: 24 },
  option: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginVertical: 4 },
  optionText: { fontSize: 15 },
  correct: { backgroundColor: '#e6f7e6', borderColor: '#52c41a' },
  wrong: { backgroundColor: '#fdecec', borderColor: '#e25555' },
  section: { fontWeight: '600', marginBottom: 4 },
  body: { color: '#333', lineHeight: 20 }
});
