import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Linking, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import type { MainStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { StoryfoneIcon } from '../../icons';
import { getUserStats, updateMe, deleteAccount, changeWhatsapp, verifyWhatsapp } from '../../api/user';
import { GradientButton } from '../../components/ui/GradientButton';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { PinInput } from '../../components/ui/PinInput';
import { LEGAL_URLS } from '../../constants/api';

export function ProfileScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { user, logout, setUser, loadToken } = useAuthStore();
  const { mode, toggle: toggleTheme } = useThemeStore();

  const [stats, setStats] = useState<{ total_hours: number; unique_books: number; streak_days: number } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');

  // Change number flow (unverified users only)
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [newCountryCode, setNewCountryCode] = useState(user?.countryCode || '+91');
  const [newPhone, setNewPhone] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState('');

  // Inline OTP verification flow (unverified users only)
  const [showInlineOtp, setShowInlineOtp] = useState(false);
  const [inlineOtp, setInlineOtp] = useState(['', '', '', '', '', '']);
  const [inlineLoading, setInlineLoading] = useState(false);
  const [inlineError, setInlineError] = useState('');

  useFocusEffect(
    useCallback(() => {
      getUserStats().then(setStats).catch(() => {});
    }, []),
  );

  const handleSaveName = async () => {
    if (nameValue.trim().length < 2) return;
    try {
      await updateMe({ name: nameValue.trim() });
      if (user) {
        setUser({ ...user, name: nameValue.trim() });
      }
    } catch {}
    setEditingName(false);
  };

  const handleChangeNumber = async () => {
    if (newPhone.length < 7) { setChangeError('Enter a valid phone number'); return; }
    setChangeLoading(true);
    setChangeError('');
    try {
      await changeWhatsapp(newPhone, newCountryCode);
      setShowChangeModal(false);
      setNewPhone('');
      await loadToken();
    } catch (e: any) {
      setChangeError(e?.response?.data?.detail || 'Failed. Try again.');
    } finally {
      setChangeLoading(false);
    }
  };

  const handleInlineVerify = async () => {
    const code = inlineOtp.join('');
    if (code.length < 6) { setInlineError('Enter the 6-digit OTP'); return; }
    setInlineLoading(true);
    setInlineError('');
    try {
      await verifyWhatsapp(code);
      setShowInlineOtp(false);
      setInlineOtp(['', '', '', '', '', '']);
      await loadToken();
    } catch {
      setInlineError('Invalid OTP. Try again.');
    } finally {
      setInlineLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent. All your data will be deleted and cannot be recovered.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              logout();
            } catch {
              Alert.alert('Error', 'Could not delete account. Please try again.');
            }
          },
        },
      ],
    );
  };

  const displayStats = [
    { label: 'Hours', value: stats ? (stats.total_hours > 0 ? stats.total_hours.toFixed(1) : 'Start listening!') : '—', icon: 'clock' as const, small: stats?.total_hours === 0 },
    { label: 'Stories', value: stats ? (stats.unique_books > 0 ? String(stats.unique_books) : 'Explore') : '—', icon: 'book' as const, small: stats?.unique_books === 0 },
    { label: 'Streak', value: stats ? (stats.streak_days > 0 ? `${stats.streak_days}d` : 'Begin today!') : '—', icon: 'trending-up' as const, small: stats?.streak_days === 0 },
  ];

  const settingsItems: { icon: React.ComponentProps<typeof Feather>['name']; label: string; onPress?: () => void }[] = [
    { icon: mode === 'dark' ? 'sun' : 'moon', label: `Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`, onPress: toggleTheme },
    { icon: 'download', label: 'Downloads', onPress: () => nav.navigate('Downloads') },
    { icon: 'lock', label: 'Privacy', onPress: () => Linking.openURL(LEGAL_URLS.privacyPolicy) },
    { icon: 'file-text', label: 'Terms of Use', onPress: () => Linking.openURL(LEGAL_URLS.termsOfService) },
    { icon: 'help-circle', label: 'Help & Support', onPress: () => Linking.openURL(LEGAL_URLS.helpAndSupport) },
  ];

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: t.bg }]}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: t.text }]}>Profile</Text>
        <StoryfoneIcon size={28} theme={t} />
      </View>

      {/* User Card */}
      <View style={styles.userRow}>
        <LinearGradient
          colors={t.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Feather name="headphones" size={28} color="#fff" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                value={nameValue}
                onChangeText={setNameValue}
                style={[styles.nameInput, { color: t.text, borderColor: t.border }]}
                autoFocus
                onSubmitEditing={handleSaveName}
              />
              <TouchableOpacity onPress={handleSaveName} activeOpacity={0.7}>
                <Feather name="check" size={20} color={t.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditingName(false); setNameValue(user?.name || ''); }} activeOpacity={0.7}>
                <Feather name="x" size={20} color={t.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingName(true)} style={styles.nameRow} activeOpacity={0.7}>
              <Text style={[styles.userName, { color: t.text }]}>
                {user?.name || 'Night Listener'}
              </Text>
              <Feather name="edit-2" size={14} color={t.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsRow}>
        {displayStats.map((stat) => (
          <View
            key={stat.label}
            style={[styles.statCard, { backgroundColor: t.bgCard, borderColor: t.borderSubtle }]}
          >
            <Feather name={stat.icon} size={20} color={t.primary} />
            <Text style={[styles.statValue, { color: t.text }, stat.small && styles.statValueSmall, stat.small && styles.statValueCenter]}>{stat.value}</Text>
            {!stat.small && <Text style={[styles.statLabel, { color: t.textMuted }]}>{stat.label}</Text>}
          </View>
        ))}
      </View>

      {/* Account Info */}
      <Text style={[styles.sectionTitle, { color: t.text }]}>ACCOUNT INFO</Text>
      <View style={[styles.infoCard, { backgroundColor: t.bgCard, borderColor: t.borderSubtle }]}>
        {/* WhatsApp */}
        <View style={[styles.infoRow, { borderBottomColor: t.borderSubtle }]}>
          <Feather name="smartphone" size={16} color={t.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: t.textMuted }]}>WHATSAPP</Text>
            <View style={styles.phoneRow}>
              <Text style={[styles.countryCode, { color: t.textMuted }]}>
                {user?.countryCode || '+91'}
              </Text>
              <Text style={[styles.phoneSeparator, { color: t.textMuted }]}>|</Text>
              <Text style={[styles.infoValue, { color: t.text }]}>
                {user?.whatsapp || '•••••••••'}
              </Text>
            </View>
          </View>
          {user?.isVerified ? (
            <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
              <Feather name="check" size={10} color="#22C55E" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : (
            <View style={styles.badgeRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setShowChangeModal(true);
                  setNewPhone('');
                  setChangeError('');
                }}
              >
                <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
                  <Feather name="edit-2" size={10} color="#6366F1" />
                  <Text style={[styles.verifiedText, { color: '#6366F1' }]}>Change</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setShowInlineOtp((v) => !v);
                  setInlineError('');
                  setInlineOtp(['', '', '', '', '', '']);
                }}
              >
                <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(234,179,8,0.1)' }]}>
                  <Feather name="alert-circle" size={10} color="#EAB308" />
                  <Text style={[styles.verifiedText, { color: '#EAB308' }]}>Verify</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Inline OTP verification for unverified users */}
        {showInlineOtp && !user?.isVerified && (
          <View style={[styles.inlineOtpContainer, { borderBottomColor: t.borderSubtle }]}>
            <Text style={[styles.inlineOtpLabel, { color: t.textMuted }]}>
              Enter the 6-digit OTP sent to your WhatsApp
            </Text>
            <PinInput value={inlineOtp} onChange={setInlineOtp} secure={false} error={!!inlineError} />
            {!!inlineError && <Text style={styles.waError}>{inlineError}</Text>}
            <GradientButton
              title="Verify"
              onPress={handleInlineVerify}
              loading={inlineLoading}
              style={styles.inlineOtpBtn}
            />
          </View>
        )}

        {/* Birth Year */}
        <View style={[styles.infoRow, { borderBottomColor: t.borderSubtle }]}>
          <Feather name="calendar" size={16} color={t.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: t.textMuted }]}>BIRTH YEAR</Text>
            <Text style={[styles.infoValue, { color: t.text }]}>
              {user?.birthYear || '••••'}
            </Text>
          </View>
        </View>

        {/* Member Since */}
        <View style={styles.infoRowLast}>
          <Feather name="clock" size={16} color={t.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: t.textMuted }]}>MEMBER SINCE</Text>
            <Text style={[styles.infoValue, { color: t.text }]}>
              {user?.memberSince || 'February 2026'}
            </Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <Text style={[styles.sectionTitle, { color: t.text }]}>SETTINGS</Text>
      {settingsItems.map((item) => (
        <TouchableOpacity
          key={item.label}
          onPress={item.onPress}
          style={[styles.settingsRow, { borderBottomColor: t.borderSubtle }]}
          activeOpacity={item.onPress ? 0.7 : 1}
        >
          <Feather name={item.icon} size={18} color={t.textSecondary} />
          <Text style={[styles.settingsLabel, { color: t.text }]}>{item.label}</Text>
          <Feather name="chevron-right" size={16} color={t.textMuted} />
        </TouchableOpacity>
      ))}

      {/* Sign Out */}
      <TouchableOpacity
        onPress={handleLogout}
        style={[styles.signOutBtn, { borderColor: t.border }]}
        activeOpacity={0.7}
      >
        <Feather name="log-out" size={16} color={t.primary} />
        <Text style={[styles.signOutText, { color: t.primary }]}>Sign Out</Text>
      </TouchableOpacity>

      {/* Delete Account */}
      <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteBtn} activeOpacity={0.7}>
        <Text style={styles.deleteText}>Delete my account</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <StoryfoneIcon size={24} theme={t} />
        <Text style={[styles.footerText, { color: t.textMuted }]}>v{appVersion}</Text>
      </View>

      {/* Change WhatsApp Number Modal (unverified users only) */}
      <Modal visible={showChangeModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowChangeModal(false)}
          activeOpacity={1}
        >
          <View
            style={[styles.modalCard, { backgroundColor: t.bgElevated, borderColor: t.border }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.modalTitle, { color: t.text }]}>Change WhatsApp Number</Text>
            <Text style={[styles.modalSubtitle, { color: t.textMuted }]}>
              Enter your new WhatsApp number
            </Text>
            <PhoneInput
              countryCode={newCountryCode}
              phone={newPhone}
              onCountryCodeChange={setNewCountryCode}
              onPhoneChange={setNewPhone}
            />
            {!!changeError && <Text style={styles.waError}>{changeError}</Text>}
            <GradientButton
              title="Change Number"
              onPress={handleChangeNumber}
              loading={changeLoading}
              style={styles.modalBtn}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 160 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  heading: { fontSize: 24, fontWeight: '800' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  avatar: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: { fontSize: 18, fontWeight: '700', borderBottomWidth: 1, paddingVertical: 2, flex: 1 },
  userName: { fontSize: 18, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 6, marginBottom: 2 },
  statValueSmall: { fontSize: 12, flex: 1 },
  statValueCenter: { textAlign: 'center' },
  statLabel: { fontSize: 11 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  infoCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 24 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  infoRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontWeight: '500', marginTop: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  countryCode: { fontSize: 15, fontWeight: '500' },
  phoneSeparator: { fontSize: 15, fontWeight: '300' },
  inlineOtpContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  inlineOtpLabel: { fontSize: 12, textAlign: 'center' },
  inlineOtpBtn: { width: '100%', marginTop: 4 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#22C55E' },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingsLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  signOutText: { fontSize: 14, fontWeight: '600' },
  deleteBtn: { alignItems: 'center', marginTop: 16 },
  deleteText: { fontSize: 12, color: '#FF4444' },
  footer: { alignItems: 'center', marginTop: 24, gap: 8 },
  footerText: { fontSize: 11 },
  badgeRow: { alignItems: 'flex-end', gap: 6 },
  waError: { fontSize: 12, color: '#FF4444', textAlign: 'center', marginTop: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: 300,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  modalSubtitle: { fontSize: 13, marginBottom: 20, textAlign: 'center' },
  modalBtn: { width: '100%', marginTop: 16 },
});
