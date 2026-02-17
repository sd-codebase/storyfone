import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../../hooks/useTheme';
import { StepDots } from '../../components/ui/StepDots';
import { GradientButton } from '../../components/ui/GradientButton';
import { IconButton } from '../../components/ui/IconButton';
import { isValidYear, isEligibleFromYear } from '../../utils/validateAge';
import type { AuthStackParamList } from '../../types/navigation';

const COOLDOWN_KEY = 'registration_cooldown_until';
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

type BirthdateRoute = RouteProp<AuthStackParamList, 'Birthdate'>;
type Nav = NativeStackNavigationProp<AuthStackParamList, 'Birthdate'>;

export function BirthdateScreen() {
  const t = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<BirthdateRoute>();
  const { phone, countryCode } = route.params;
  const insets = useSafeAreaInsets();
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [cooldownActive, setCooldownActive] = useState(false);

  useEffect(() => {
    checkCooldown();
  }, []);

  const checkCooldown = async () => {
    const until = await SecureStore.getItemAsync(COOLDOWN_KEY);
    if (until && Date.now() < Number(until)) {
      setCooldownActive(true);
      setError('Please try again later');
    } else if (until) {
      await SecureStore.deleteItemAsync(COOLDOWN_KEY);
    }
  };

  const handleContinue = async () => {
    const y = parseInt(year);
    if (!isValidYear(y)) {
      setError('Please enter a valid year');
      return;
    }
    if (!isEligibleFromYear(y)) {
      setError('You are not eligible to use this app');
      await SecureStore.setItemAsync(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS));
      setCooldownActive(true);
      return;
    }
    setError('');
    nav.navigate('PinSetup', { phone, countryCode, birthYear: year });
  };

  const canSubmit = year.length === 4 && !cooldownActive;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top + 12 }]}>
        <IconButton name="arrow-left" onPress={() => nav.goBack()} bgColor={t.primarySoft} borderColor={t.border} color={t.textSecondary} />

        <View style={styles.content}>
          <StepDots current={1} total={5} />

          <View style={[styles.iconBox, { backgroundColor: t.primarySoft, borderColor: t.border }]}>
            <Feather name="calendar" size={22} color={t.primary} />
          </View>

          <Text style={[styles.title, { color: t.text }]}>Birth Year</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>We need to verify your age</Text>

          <View style={styles.yearField}>
            <Text style={[styles.label, { color: t.textMuted }]}>YEAR</Text>
            <TextInput
              value={year}
              onChangeText={(v) => { setYear(v.replace(/\D/g, '')); setError(''); }}
              placeholder="YYYY"
              placeholderTextColor={t.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              editable={!cooldownActive}
              style={[styles.input, { backgroundColor: t.bgInput, borderColor: t.borderSubtle, color: t.text, opacity: cooldownActive ? 0.5 : 1 }]}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
          <GradientButton title="Continue" onPress={handleContinue} disabled={!canSubmit} />
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
  yearField: { width: '100%' },
  label: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, fontWeight: '700', textAlign: 'center', letterSpacing: 2 },
  error: { color: '#FF4444', fontSize: 13, marginTop: 8 },
  bottom: { paddingTop: 32 },
});
