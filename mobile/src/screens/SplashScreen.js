import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import Button from '../components/Button';
import { colors } from '../theme';

export default function SplashScreen({ navigation }) {
  return (
    <Screen scroll={false}>
      <View style={styles.body}>
        <View style={styles.illustration}>
          <Text style={styles.bot}>🤖</Text>
          <Text style={styles.bubbles}>💬💬</Text>
          <Text style={styles.user}>🧑‍💼</Text>
        </View>
        <Text style={styles.title}>SmartPrep</Text>
        <Text style={styles.subtitle}>AI Interview Coach</Text>
        <Text style={styles.tagline}>
          Turn nervous answers into confident conversations.
        </Text>
        <Button
          title="GET STARTED"
          onPress={() => navigation.navigate('Login')}
          style={styles.btn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  illustration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40
  },
  bot: { fontSize: 64 },
  bubbles: { fontSize: 32, marginHorizontal: 8 },
  user: { fontSize: 64 },
  title: { color: '#fff', fontSize: 36, fontWeight: '900' },
  subtitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 16 },
  tagline: { color: colors.textSecondary, textAlign: 'center', marginBottom: 32, fontSize: 14 },
  btn: { paddingHorizontal: 40 }
});
