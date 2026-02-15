import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { PinInput } from '../../components/ui/PinInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { IconButton } from '../../components/ui/IconButton';
import type { AuthStackParamList } from '../../types/navigation';
import axios from 'axios';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
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
          setError('No account found with this number');
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
      <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top + 12 }]}>
        <IconButton name="arrow-left" onPress={() => nav.goBack()} bgColor={t.primarySoft} borderColor={t.border} color={t.textSecondary} />

        <View style={styles.content}>
          <View style={[styles.iconBox, { backgroundColor: t.primarySoft, borderColor: t.border }]}>
            <Feather name="smartphone" size={22} color={t.primary} />
          </View>

          <Text style={[styles.title, { color: t.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>
            Enter your WhatsApp number and PIN
          </Text>

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
        </View>

        <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
          <GradientButton
            title={loading ? 'Signing In...' : 'Sign In'}
            onPress={handleSignIn}
            disabled={!canSubmit}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28 },
  content: { paddingTop: 40 },
  iconBox: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 28, textAlign: 'center' },
  pinLabel: { fontSize: 14, fontWeight: '600', marginTop: 24, marginBottom: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 },
  toggleText: { fontSize: 13, fontWeight: '500' },
  error: { color: '#FF4444', fontSize: 13, textAlign: 'center', marginTop: 16 },
  bottom: { paddingTop: 32 },
});
