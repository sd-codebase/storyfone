import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Linking, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
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
  const { user, logout, setUser } = useAuthStore();
  const { mode, toggle: toggleTheme } = useThemeStore();

  const [stats, setStats] = useState<{ total_hours: number; unique_books: number; streak_days: number } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');

  // WhatsApp change flow
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [whatsappStep, setWhatsappStep] = useState<'phone' | 'otp'>('phone');
  const [newCountryCode, setNewCountryCode] = useState(user?.countryCode || '+91');
  const [newPhone, setNewPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [waLoading, setWaLoading] = useState(false);
  const [waError, setWaError] = useState('');

  useEffect(() => {
    getUserStats().then(setStats).catch(() => {});
  }, []);

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

  const handleWhatsappChange = async () => {
    if (newPhone.length < 7) { setWaError('Enter a valid phone number'); return; }
    setWaLoading(true);
    setWaError('');
    try {
      await changeWhatsapp(newPhone, newCountryCode);
      setWhatsappStep('otp');
    } catch {
      setWaError('Failed to send OTP. Try again.');
    } finally {
      setWaLoading(false);
    }
  };

  const handleWhatsappVerify = async () => {
    const code = otp.join('');
    if (code.length < 4) { setWaError('Enter the 4-digit OTP'); return; }
    setWaLoading(true);
    setWaError('');
    try {
      await verifyWhatsapp(code);
      if (user) {
        setUser({ ...user, whatsapp: newPhone, countryCode: newCountryCode, isVerified: true });
      }
      setShowWhatsappModal(false);
      setWhatsappStep('phone');
      setNewPhone('');
      setOtp(['', '', '', '']);
    } catch {
      setWaError('Invalid OTP. Try again.');
    } finally {
      setWaLoading(false);
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

  const isNewUser = stats && stats.total_hours === 0 && stats.unique_books === 0 && stats.streak_days === 0;
  const displayStats = [
    { label: 'Hours', value: stats ? (isNewUser ? 'Start listening!' : stats.total_hours.toFixed(1)) : '—', icon: 'clock' as const },
    { label: 'Stories', value: stats ? (isNewUser ? 'Explore' : String(stats.unique_books)) : '—', icon: 'book' as const },
    { label: 'Streak', value: stats ? (isNewUser ? 'Begin today!' : `${stats.streak_days}d`) : '—', icon: 'trending-up' as const },
  ];

  const settingsItems: { icon: React.ComponentProps<typeof Feather>['name']; label: string; onPress?: () => void }[] = [
    { icon: mode === 'dark' ? 'sun' : 'moon', label: `Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`, onPress: toggleTheme },
    { icon: 'download', label: 'Downloads' },
    { icon: 'lock', label: 'Privacy' },
    { icon: 'file-text', label: 'Terms of Use', onPress: () => Linking.openURL(LEGAL_URLS.termsOfService) },
    { icon: 'help-circle', label: 'Help & Support' },
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
          <Text style={[styles.userPlan, { color: t.textSecondary }]}>
            {user?.plan || 'Premium Member'}
          </Text>
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
            <Text style={[styles.statValue, { color: t.text }, isNewUser && styles.statValueSmall]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Account Info */}
      <Text style={[styles.sectionTitle, { color: t.text }]}>ACCOUNT INFO</Text>
      <View style={[styles.infoCard, { backgroundColor: t.bgCard, borderColor: t.borderSubtle }]}>
        {/* WhatsApp */}
        <TouchableOpacity
          style={[styles.infoRow, { borderBottomColor: t.borderSubtle }]}
          activeOpacity={0.7}
          onPress={() => {
            setShowWhatsappModal(true);
            setWhatsappStep('phone');
            setNewPhone('');
            setOtp(['', '', '', '']);
            setWaError('');
          }}
        >
          <Feather name="smartphone" size={16} color={t.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: t.textMuted }]}>WHATSAPP</Text>
            <View style={styles.phoneRow}>
              <Text style={[styles.countryCode, { color: t.textMuted }]}>
                {user?.countryCode || '+91'}
              </Text>
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
            <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(234,179,8,0.1)' }]}>
              <Feather name="alert-circle" size={10} color="#EAB308" />
              <Text style={[styles.verifiedText, { color: '#EAB308' }]}>Unverified</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Date of Birth */}
        <View style={[styles.infoRow, { borderBottomColor: t.borderSubtle }]}>
          <Feather name="calendar" size={16} color={t.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: t.textMuted }]}>DATE OF BIRTH</Text>
            <Text style={[styles.infoValue, { color: t.text }]}>
              {user?.dob || '••/••/••••'}
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

      {/* WhatsApp Change Modal */}
      <Modal visible={showWhatsappModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.waOverlay}
          onPress={() => setShowWhatsappModal(false)}
          activeOpacity={1}
        >
          <View
            style={[styles.waCard, { backgroundColor: t.bgElevated, borderColor: t.border }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.waTitle, { color: t.text }]}>
              {whatsappStep === 'phone' ? 'Change WhatsApp Number' : 'Verify OTP'}
            </Text>

            {whatsappStep === 'phone' ? (
              <>
                <Text style={[styles.waSubtitle, { color: t.textMuted }]}>
                  Enter your new WhatsApp number
                </Text>
                <PhoneInput
                  countryCode={newCountryCode}
                  phone={newPhone}
                  onCountryCodeChange={setNewCountryCode}
                  onPhoneChange={setNewPhone}
                />
                {!!waError && <Text style={styles.waError}>{waError}</Text>}
                <GradientButton
                  title="Send OTP"
                  onPress={handleWhatsappChange}
                  loading={waLoading}
                  style={styles.waBtn}
                />
              </>
            ) : (
              <>
                <Text style={[styles.waSubtitle, { color: t.textMuted }]}>
                  Enter the 4-digit code sent to {newCountryCode} {newPhone}
                </Text>
                <PinInput value={otp} onChange={setOtp} error={!!waError} />
                {!!waError && <Text style={styles.waError}>{waError}</Text>}
                <GradientButton
                  title="Verify"
                  onPress={handleWhatsappVerify}
                  loading={waLoading}
                  style={styles.waBtn}
                />
              </>
            )}
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
  userPlan: { fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 6, marginBottom: 2 },
  statValueSmall: { fontSize: 12 },
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
  waOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waCard: {
    width: 300,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  waTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  waSubtitle: { fontSize: 13, marginBottom: 20, textAlign: 'center' },
  waError: { fontSize: 12, color: '#FF4444', textAlign: 'center', marginTop: 8 },
  waBtn: { width: '100%', marginTop: 16 },
});
