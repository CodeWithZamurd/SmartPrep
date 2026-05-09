import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Screen, Brand } from '../components/Screen';
import { colors, spacing } from '../theme';

function Bullet({ children, color = colors.textSecondary }) {
  return (
    <View style={styles.bullet}>
      <Text style={{ color, marginRight: 6 }}>•</Text>
      <Text style={{ color: colors.textSecondary, flex: 1 }}>{children}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={styles.section}>{title}</Text>
      {children}
    </View>
  );
}

export default function EvaluationRulesScreen({ navigation }) {
  return (
    <Screen>
      <Brand />
      <Text style={styles.heading}>Evaluation Rules</Text>

      <Text style={styles.subhead}>Score Distribution</Text>
      <Text style={[styles.row, { color: colors.green }]}>Technical Skills: 60%</Text>
      <Text style={[styles.row, { color: colors.yellow }]}>Voice Analysis: 20%</Text>
      <Text style={[styles.row, { color: colors.orange }]}>Body Language Analysis: 20%</Text>
      <Text style={styles.italic}>
        If video is off, body language score is automatically added to technical and voice analysis.
      </Text>

      <Section title="Technical Evaluation">
        <Bullet>Answers checked for correctness and logic</Bullet>
        <Bullet>Harder questions carry higher marks</Bullet>
        <Bullet>Score adjusts based on question difficulty</Bullet>
      </Section>

      <Section title="Adaptive Questions">
        <Bullet>Good performance → harder questions</Bullet>
        <Bullet>Weak performance → easier questions</Bullet>
        <Bullet>Difficulty changes in real time</Bullet>
      </Section>

      <Section title="Voice Analysis">
        <Bullet>Confidence</Bullet>
        <Bullet>Clarity</Bullet>
        <Bullet>Filler words</Bullet>
        <Bullet>Pacing</Bullet>
      </Section>

      <Section title="Body Language Analysis">
        <Bullet>Eye contact</Bullet>
        <Bullet>Posture</Bullet>
        <Bullet>Facial sentiments</Bullet>
        <Bullet>Fidgeting Detection</Bullet>
      </Section>

      <Pressable onPress={() => navigation.navigate('Home')} style={styles.next}>
        <Text style={styles.nextTxt}>Next ›</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center', marginVertical: spacing.sm },
  subhead: { color: '#fff', fontWeight: '900', fontSize: 16, marginTop: spacing.md },
  row: { fontWeight: '700', marginVertical: 2 },
  italic: { color: colors.textSecondary, fontStyle: 'italic', marginTop: spacing.sm, fontSize: 12 },
  section: { color: colors.primary, fontWeight: '900', fontSize: 16, marginBottom: 6 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 2 },
  next: { alignSelf: 'flex-end', padding: spacing.md },
  nextTxt: { color: colors.primary, fontWeight: '700', fontSize: 16 }
});
