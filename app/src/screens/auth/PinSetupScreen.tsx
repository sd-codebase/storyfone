import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { StepDots } from '../../components/ui/StepDots';
import { PinInput } from '../../components/ui/PinInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { IconButton } from '../../components/ui/IconButton';
import type { AuthStackParamList } from '../../types/navigation';

type PinSetupRoute = RouteProp<AuthStackParamList, 'PinSetup'>;
type Nav = NativeStackNavigationProp<AuthStackParamList, 'PinSetup'>;

export function PinSetupScreen() {
  const t = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<PinSetupRoute>();
  const { phone, countryCode, birthYear } = route.params;
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const pinValue = pin.join('');
  const confirmValue = confirmPin.join('');
  const isComplete = step === 'confirm' ? confirmValue.length === 4 : pinValue.length === 4;

  const handleSubmit = () => {
    if (step === 'create') {
      setStep('confirm');
      return;
    }

    // Confirm step
    if (pinValue !== confirmValue) {
      setError(true);
      Alert.alert('Mismatch', "PINs don't match. Try again.");
      setTimeout(() => {
        setConfirmPin(['', '', '', '']);
        setError(false);
        setStep('create');
        setPin(['', '', '', '']);
      }, 500);
      return;
    }

    // Navigate to Name screen instead of registering
    nav.navigate('Name', { phone, countryCode, birthYear, pin: pinValue });
  };

  const title = step === 'create' ? 'Create Your PIN' : 'Confirm Your PIN';
  const subtitle = step === 'create'
    ? 'Choose a 4-digit PIN to secure your account'
    : 'Re-enter your PIN to confirm';

  return (
    <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top + 12 }]}>
      <IconButton name="arrow-left" onPress={() => nav.goBack()} bgColor={t.primarySoft} borderColor={t.border} color={t.textSecondary} />

      <View style={styles.content}>
        <StepDots current={2} total={5} />

        <View style={[styles.iconBox, { backgroundColor: t.primarySoft, borderColor: t.border }]}>
          <Feather name="lock" size={22} color={t.primary} />
        </View>

        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>{subtitle}</Text>

        <View style={styles.pinContainer}>
          <PinInput
            key={step}
            value={step === 'confirm' ? confirmPin : pin}
            onChange={step === 'confirm' ? setConfirmPin : setPin}
            secure={!showPin}
            error={error}
          />
        </View>

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
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
        <GradientButton
          title={step === 'create' ? 'Continue' : 'Continue'}
          onPress={handleSubmit}
          disabled={!isComplete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28 },
  content: { paddingTop: 40 },
  iconBox: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 28 },
  pinContainer: { marginTop: 8 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 },
  toggleText: { fontSize: 13, fontWeight: '500' },
  bottom: { paddingTop: 32 },
});
