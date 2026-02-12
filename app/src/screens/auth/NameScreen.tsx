import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { StepDots } from '../../components/ui/StepDots';
import { GradientButton } from '../../components/ui/GradientButton';
import { IconButton } from '../../components/ui/IconButton';
import type { AuthStackParamList } from '../../types/navigation';

type NameRoute = RouteProp<AuthStackParamList, 'Name'>;
type Nav = NativeStackNavigationProp<AuthStackParamList, 'Name'>;

export function NameScreen() {
  const t = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<NameRoute>();
  const { phone, countryCode, birthdate, pin } = route.params;
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');

  const handleContinue = () => {
    nav.navigate('Language', { phone, countryCode, birthdate, pin, name: name.trim() });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top + 12 }]}>
        <IconButton name="arrow-left" onPress={() => nav.goBack()} bgColor={t.primarySoft} borderColor={t.border} color={t.textSecondary} />

        <View style={styles.content}>
          <StepDots current={3} total={5} />

          <View style={[styles.iconBox, { backgroundColor: t.primarySoft, borderColor: t.border }]}>
            <Feather name="user" size={22} color={t.primary} />
          </View>

          <Text style={[styles.title, { color: t.text }]}>What's your name?</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>
            This is how you'll appear in the app
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your display name"
            placeholderTextColor={t.textMuted}
            style={[styles.input, { backgroundColor: t.bgInput, borderColor: t.borderSubtle, color: t.text }]}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={name.trim().length >= 2 ? handleContinue : undefined}
          />
        </View>

        <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
          <GradientButton title="Continue" onPress={handleContinue} disabled={name.trim().length < 2} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28 },
  content: { flex: 1, paddingTop: 40 },
  iconBox: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 28 },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 16, fontSize: 18, fontWeight: '600' },
  bottom: { paddingTop: 16 },
});
