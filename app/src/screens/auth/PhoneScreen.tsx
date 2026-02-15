import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { StepDots } from '../../components/ui/StepDots';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { IconButton } from '../../components/ui/IconButton';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Phone'>;

export function PhoneScreen() {
  const t = useTheme();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (phone.length < 8) {
      setError('Enter a valid WhatsApp number');
      return;
    }
    setError('');
    nav.navigate('Birthdate', { phone, countryCode });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top + 12 }]}>
        <IconButton name="arrow-left" onPress={() => nav.goBack()} bgColor={t.primarySoft} borderColor={t.border} color={t.textSecondary} />

        <View style={styles.content}>
          <StepDots current={0} total={5} />

          <View style={[styles.iconBox, { backgroundColor: t.primarySoft, borderColor: t.border }]}>
            <Feather name="smartphone" size={22} color={t.primary} />
          </View>

          <Text style={[styles.title, { color: t.text }]}>WhatsApp Number</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>
            You'll receive an OTP on WhatsApp shortly.{'\n'}Verify it on your Profile page
          </Text>

          <PhoneInput
            countryCode={countryCode}
            phone={phone}
            onCountryCodeChange={setCountryCode}
            onPhoneChange={(v) => { setPhone(v); setError(''); }}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={[styles.privacyBox, { backgroundColor: t.primarySoft }]}>
            <Feather name="shield" size={16} color={t.textMuted} />
            <Text style={[styles.privacyText, { color: t.textMuted }]}>
              Your number is encrypted and never shared with third parties
            </Text>
          </View>
        </View>

        <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
          <GradientButton title="Continue" onPress={handleContinue} disabled={phone.length < 8} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28 },
  content: { paddingTop: 40 },
  iconBox: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 28 },
  error: { color: '#FF4444', fontSize: 13, marginTop: 8 },
  privacyBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 10, marginTop: 20 },
  privacyText: { flex: 1, fontSize: 12, lineHeight: 18 },
  bottom: { paddingTop: 32 },
});
