import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { AuthStackParamList } from '../../types/navigation';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { StoryfoneLogo } from '../../icons';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { PinInput } from '../../components/ui/PinInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { LEGAL_URLS } from '../../constants/api';
import axios from 'axios';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const t = useTheme();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const pinValue = pin.join('');
  const canSubmit = phone.length >= 8 && pinValue.length === 4 && !loading;

  const handleSignIn = async () => {
    setError('');
    setPinError(false);
    setLoading(true);

    try {
      await useAuthStore.getState().loginWithPhone(phone, countryCode, pinValue);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError('No account found. Tap "Create Account" below to sign up.');
        } else if (err.response?.status === 401) {
          setError('Incorrect PIN');
          setPinError(true);
          setTimeout(() => {
            setPin(['', '', '', '']);
            setPinError(false);
          }, 500);
        } else if (err.response?.status === 403) {
          setError('This account has been deleted');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, { backgroundColor: t.bg }]}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Radial glow overlay */}
        <View style={[styles.glow, { backgroundColor: t.primaryGlow }]} />

        {/* Logo */}
        <View style={styles.center}>
          <StoryfoneLogo width={260} theme={t} />
          <Text style={[styles.subtitle, { color: t.textMuted }]}>
            Immersive audio stories crafted{'\n'}just for you
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <PhoneInput
            countryCode={countryCode}
            phone={phone}
            onCountryCodeChange={setCountryCode}
            onPhoneChange={(v) => { setPhone(v); setError(''); }}
          />

          <Text style={[styles.pinLabel, { color: t.textSecondary }]}>PIN</Text>

          <PinInput
            value={pin}
            onChange={(v) => { setPin(v); setError(''); setPinError(false); }}
            secure={!showPin}
            error={pinError}
            autoFocus={false}
          />

          <TouchableOpacity
            onPress={() => setShowPin(!showPin)}
            style={styles.toggleRow}
            activeOpacity={0.7}
          >
            <Feather name={showPin ? 'eye-off' : 'eye'} size={16} color={t.textMuted} />
            <Text style={[styles.toggleText, { color: t.textMuted }]}>
              {showPin ? 'Hide PIN' : 'Show PIN'}
            </Text>
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <GradientButton
            title={loading ? 'Signing In...' : 'Sign In'}
            onPress={handleSignIn}
            disabled={!canSubmit}
            style={styles.signInBtn}
          />
        </View>

        {/* Create Account */}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 32, flexGrow: 1, justifyContent: 'center' },
  glow: { position: 'absolute', top: '10%', left: '20%', right: '20%', height: 200, borderRadius: 100, opacity: 0.15 },
  center: { alignItems: 'center', marginBottom: 32 },
  subtitle: { fontSize: 14, textAlign: 'center', maxWidth: 260, lineHeight: 22, marginTop: 20 },
  form: { marginBottom: 20 },
  pinLabel: { fontSize: 14, fontWeight: '600', marginTop: 20, marginBottom: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  toggleText: { fontSize: 13, fontWeight: '500' },
  error: { color: '#FF4444', fontSize: 13, textAlign: 'center', marginTop: 12 },
  signInBtn: { marginTop: 20 },
  outlineBtn: { borderWidth: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  outlineBtnText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  legal: { fontSize: 11, textAlign: 'center', lineHeight: 16, marginTop: 14 },
  legalLink: { textDecorationLine: 'underline', fontWeight: '600' },
});
