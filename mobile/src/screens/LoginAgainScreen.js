import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import Button from '../components/Button';
import { colors, radii, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';

function Item({ icon, title, desc }) {
  return (
    <View style={styles.item}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDesc}>{desc}</Text>
      </View>
    </View>
  );
}

export default function LoginAgainScreen({ navigation }) {
  const { logout } = useAuth();
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.brand}>🧠 SmartPrep</Text>
        <Text style={styles.brandSub}>AI Interview Coach for Tech Job Seekers</Text>
        <Text style={styles.tag}>Crack your interviews by practicing{'\n'}SmartPrep interviews</Text>
      </View>

      <Button
        title="↪  Login in again"
        onPress={async () => {
          await logout();
          navigation.replace('Login');
        }}
        style={{ marginVertical: spacing.lg }}
      />

      <View style={styles.feature}>
        <Text style={styles.featureTitle}>What you'll get:</Text>
        <Item icon="❓" title="700+ AI Questions" desc="Curated questions for specific tech domain." />
        <Item icon="🎤" title="AI Interviews" desc="Practice with text/voice input along with WebCam video to get real-time feedback." />
        <Item icon="📈" title="Progress Tracking" desc="Monitor your learning journey and improvements." />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.lg
  },
  brand: { color: '#fff', fontSize: 26, fontWeight: '900' },
  brandSub: { color: '#fff', marginTop: 4 },
  tag: { color: '#fff', textAlign: 'center', marginTop: spacing.md, fontWeight: '700' },
  feature: { backgroundColor: colors.cardAlt, borderRadius: radii.lg, padding: spacing.lg },
  featureTitle: { color: '#fff', fontWeight: '800', textAlign: 'center', marginBottom: spacing.md },
  item: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: spacing.sm },
  icon: { fontSize: 22 },
  itemTitle: { color: colors.primary, fontWeight: '800' },
  itemDesc: { color: colors.textSecondary, fontSize: 12, marginTop: 2 }
});
