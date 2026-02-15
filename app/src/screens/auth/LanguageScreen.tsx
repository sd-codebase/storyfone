import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { StepDots } from '../../components/ui/StepDots';
import { GradientButton } from '../../components/ui/GradientButton';
import { IconButton } from '../../components/ui/IconButton';
import { getAvailableLanguages } from '../../api/auth';
import type { LanguageOption } from '../../api/auth';
import type { AuthStackParamList } from '../../types/navigation';
import axios from 'axios';

type LanguageRoute = RouteProp<AuthStackParamList, 'Language'>;
type Nav = NativeStackNavigationProp<AuthStackParamList, 'Language'>;

export function LanguageScreen() {
  const t = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<LanguageRoute>();
  const { phone, countryCode, birthdate, pin, name } = route.params;
  const insets = useSafeAreaInsets();

  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    getAvailableLanguages()
      .then(setLanguages)
      .catch((err) => {
        console.warn('Failed to load languages:', err?.message || err);
        Alert.alert('Error', 'Could not load languages. Please check your connection and try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleLanguage = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setRegistering(true);
    try {
      await useAuthStore.getState().register(phone, countryCode, birthdate, pin, name, selected);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        Alert.alert('Account Exists', 'An account with this number already exists. Please sign in.', [
          { text: 'OK', onPress: () => nav.navigate('Welcome') },
        ]);
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } finally {
      setRegistering(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top + 12 }]}>
      <IconButton name="arrow-left" onPress={() => nav.goBack()} bgColor={t.primarySoft} borderColor={t.border} color={t.textSecondary} />

      <View style={styles.content}>
        <StepDots current={4} total={5} />

        <View style={[styles.iconBox, { backgroundColor: t.primarySoft, borderColor: t.border }]}>
          <Feather name="globe" size={22} color={t.primary} />
        </View>

        <Text style={[styles.title, { color: t.text }]}>Preferred Languages</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          Select one or more languages to personalize your content
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={t.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {languages.map((lang) => {
              const isActive = selected.includes(lang.id);
              return (
                <TouchableOpacity
                  key={lang.id}
                  onPress={() => toggleLanguage(lang.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.langChip,
                    {
                      backgroundColor: isActive ? t.primary : t.bgCard,
                      borderColor: isActive ? t.primary : t.borderSubtle,
                    },
                  ]}
                >
                  <Feather name="check" size={14} color={isActive ? '#fff' : 'transparent'} />
                  <Text style={[styles.langText, { color: isActive ? '#fff' : t.text }]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
        <GradientButton
          title={registering ? 'Creating Account...' : 'Get Started'}
          onPress={handleSubmit}
          disabled={selected.length === 0 || registering}
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
  subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  langChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  langText: { fontSize: 15, fontWeight: '600' },
  bottom: { paddingTop: 32 },
});
