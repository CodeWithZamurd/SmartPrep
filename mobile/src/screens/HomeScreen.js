import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sessions');
      setSessions(data.sessions);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi {user?.name?.split(' ')[0] || 'there'} 👋</Text>
      <Text style={styles.subtitle}>Ready to practice?</Text>

      <View style={styles.row}>
        <View style={styles.cardWrap}>
          <Button title="Start Interview" onPress={() => navigation.navigate('Setup')} />
        </View>
        <View style={styles.cardWrap}>
          <Button title="Practice" variant="secondary" onPress={() => navigation.navigate('Practice')} />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.cardWrap}>
          <Button title="AI Challenge" variant="secondary" onPress={() => navigation.navigate('Challenge')} />
        </View>
        <View style={styles.cardWrap}>
          <Button title="Profile" variant="secondary" onPress={() => navigation.navigate('Profile')} />
        </View>
      </View>

      <Text style={styles.section}>History</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text style={styles.empty}>No sessions yet — start your first interview!</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('Feedback', { sessionId: item._id })}
          >
            <Text style={styles.itemTitle}>
              {item.domain === 'software' ? 'Software Dev' : 'AI / Data Science'} · {item.difficulty}
            </Text>
            <Text style={styles.itemMeta}>
              {item.status === 'completed'
                ? `Tech ${item.overallTechnical ?? 0} · Clarity ${item.overallClarity ?? 0} · Conf ${item.overallConfidence ?? 0}`
                : item.status}
            </Text>
            <Text style={styles.itemDate}>{new Date(item.createdAt).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.settings}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  greeting: { fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#555', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 8 },
  cardWrap: { flex: 1 },
  section: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  empty: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 24 },
  item: { padding: 12, backgroundColor: '#f5f7fb', borderRadius: 10, marginBottom: 8 },
  itemTitle: { fontWeight: '600' },
  itemMeta: { color: '#333', marginTop: 2 },
  itemDate: { color: '#888', fontSize: 12, marginTop: 2 },
  settings: { textAlign: 'center', color: '#1f6feb', padding: 12 }
});
