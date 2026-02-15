import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { StepDots } from '../../components/ui/StepDots';
import { DateInput } from '../../components/ui/DateInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { IconButton } from '../../components/ui/IconButton';
import { isValidDate, calculateAge } from '../../utils/validateAge';
import type { AuthStackParamList } from '../../types/navigation';

type BirthdateRoute = RouteProp<AuthStackParamList, 'Birthdate'>;
type Nav = NativeStackNavigationProp<AuthStackParamList, 'Birthdate'>;

export function BirthdateScreen() {
  const t = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<BirthdateRoute>();
  const { phone, countryCode } = route.params;
  const insets = useSafeAreaInsets();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    const d = parseInt(day), m = parseInt(month), y = parseInt(year);
    if (!isValidDate(d, m, y)) {
      setError('Please enter a valid date');
      return;
    }
    const age = calculateAge(d, m, y);
    if (age < 13) {
      setError('You must be at least 13 years old');
      return;
    }
    setError('');
    const birthdate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    nav.navigate('PinSetup', { phone, countryCode, birthdate });
  };

  const canSubmit = day.length > 0 && month.length > 0 && year.length === 4;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top + 12 }]}>
        <IconButton name="arrow-left" onPress={() => nav.goBack()} bgColor={t.primarySoft} borderColor={t.border} color={t.textSecondary} />

        <View style={styles.content}>
          <StepDots current={1} total={5} />

          <View style={[styles.iconBox, { backgroundColor: t.primarySoft, borderColor: t.border }]}>
            <Feather name="calendar" size={22} color={t.primary} />
          </View>

          <Text style={[styles.title, { color: t.text }]}>Date of Birth</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>We need to verify your age</Text>

          <DateInput
            day={day}
            month={month}
            year={year}
            onDayChange={(v) => { setDay(v); setError(''); }}
            onMonthChange={(v) => { setMonth(v); setError(''); }}
            onYearChange={(v) => { setYear(v); setError(''); }}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={[styles.ageNote, { backgroundColor: t.primarySoft }]}>
            <Feather name="alert-circle" size={16} color={t.textMuted} />
            <Text style={[styles.ageNoteText, { color: t.textMuted }]}>
              You must be at least 13 years old to use Storyfone.
            </Text>
          </View>
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
  error: { color: '#FF4444', fontSize: 13, marginTop: 8 },
  ageNote: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 10, marginTop: 20 },
  ageNoteText: { flex: 1, fontSize: 12, lineHeight: 18 },
  bottom: { paddingTop: 32 },
});
