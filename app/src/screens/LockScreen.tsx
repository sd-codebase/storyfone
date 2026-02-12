import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { useLockStore } from '../store/lockStore';
import { PinInput } from '../components/ui/PinInput';
import { GradientButton } from '../components/ui/GradientButton';

function isWithin24Hours(isoDate: string): boolean {
  try {
    const created = new Date(isoDate).getTime();
    const now = Date.now();
    return now - created < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function LockScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const user = useAuthStore((s) => s.user);
  const { isUnlocked, lock, verifyPin } = useLockStore();

  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const isVerified = user?.isVerified ?? false;
  const inGracePeriod = user?.createdAt ? isWithin24Hours(user.createdAt) : false;
  const canUnlock = isVerified || inGracePeriod;

  // If already unlocked, lock immediately and go back (no PIN needed)
  useEffect(() => {
    if (isUnlocked) {
      lock();
      nav.goBack();
    }
  }, []);

  // If we locked and went back, don't render anything
  if (isUnlocked) return null;

  const pinValue = pin.join('');
  const isComplete = pinValue.length === 4;

  const handleUnlock = async () => {
    const ok = await verifyPin(pinValue);
    if (ok) {
      nav.goBack();
    } else {
      setError(true);
      setTimeout(() => {
        setPin(['', '', '', '']);
        setError(false);
      }, 500);
    }
  };

  if (!canUnlock) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()} activeOpacity={0.7} style={styles.backBtn}>
            <Feather name="x" size={24} color={t.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.lockIconContainer}>
          <View style={[styles.lockIconBg, { backgroundColor: t.primarySoft }]}>
            <Feather name="shield" size={32} color={t.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: t.text }]}>Verification Required</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          Your WhatsApp number is not verified. Please verify it on your Profile page to unlock this content.
        </Text>

        <View style={styles.buttonContainer}>
          <GradientButton title="Go Back" onPress={() => nav.goBack()} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Feather name="x" size={24} color={t.text} />
        </TouchableOpacity>
      </View>

      {/* Lock Icon */}
      <View style={styles.lockIconContainer}>
        <View style={[styles.lockIconBg, { backgroundColor: t.primarySoft }]}>
          <Feather name="lock" size={32} color={t.primary} />
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: t.text }]}>Enter Your PIN</Text>
      <Text style={[styles.subtitle, { color: t.textSecondary }]}>
        Enter your 4-digit PIN to unlock restricted content
      </Text>

      {/* PIN Input */}
      <View style={styles.pinContainer}>
        <PinInput
          value={pin}
          onChange={setPin}
          secure={!showPin}
          error={error}
        />
      </View>

      {/* Show/Hide toggle */}
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

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <GradientButton
          title="Unlock"
          onPress={handleUnlock}
          disabled={!isComplete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  lockIconContainer: { alignItems: 'center', marginTop: 40 },
  lockIconBg: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 24 },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
  pinContainer: { marginTop: 40 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  toggleText: { fontSize: 13, fontWeight: '500' },
  buttonContainer: { paddingHorizontal: 32, marginTop: 40 },
});
