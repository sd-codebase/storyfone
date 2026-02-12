import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation';
import { useTheme } from '../../hooks/useTheme';
import { StoryfoneLogo } from '../../icons';
import { GradientButton } from '../../components/ui/GradientButton';
import { LEGAL_URLS } from '../../constants/api';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const t = useTheme();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Radial glow overlay */}
      <View style={[styles.glow, { backgroundColor: t.primaryGlow }]} />

      <View style={styles.center}>
        <StoryfoneLogo width={280} theme={t} />
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          Immersive audio stories crafted{'\n'}just for you
        </Text>
      </View>

      <View style={styles.buttons}>
        <GradientButton title="Sign In" onPress={() => nav.navigate('Login')} />
        <TouchableOpacity
          onPress={() => nav.navigate('Phone')}
          style={[styles.outlineBtn, { borderColor: t.primary + '4D' }]}
        >
          <Text style={[styles.outlineBtnText, { color: t.primary }]}>Create Account</Text>
        </TouchableOpacity>
        <Text style={[styles.legal, { color: t.textMuted }]}>
          By continuing, you agree to our{' '}
          <Text style={[styles.legalLink, { color: t.primary }]} onPress={() => Linking.openURL(LEGAL_URLS.termsOfService)}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={[styles.legalLink, { color: t.primary }]} onPress={() => Linking.openURL(LEGAL_URLS.privacyPolicy)}>Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  glow: { position: 'absolute', top: '10%', left: '20%', right: '20%', height: 200, borderRadius: 100, opacity: 0.15 },
  center: { alignItems: 'center', marginBottom: 48 },
  subtitle: { fontSize: 14, textAlign: 'center', maxWidth: 260, lineHeight: 22, marginTop: 20 },
  buttons: { gap: 14 },
  outlineBtn: { borderWidth: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  outlineBtnText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  legal: { fontSize: 11, textAlign: 'center', lineHeight: 16, marginTop: 8 },
  legalLink: { textDecorationLine: 'underline', fontWeight: '600' },
});
