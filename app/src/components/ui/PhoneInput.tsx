import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const COUNTRY_CODES = [
  { code: '+91', flag: '\u{1F1EE}\u{1F1F3}', name: 'India' },
  { code: '+1', flag: '\u{1F1FA}\u{1F1F8}', name: 'US' },
  { code: '+44', flag: '\u{1F1EC}\u{1F1E7}', name: 'UK' },
  { code: '+971', flag: '\u{1F1E6}\u{1F1EA}', name: 'UAE' },
  { code: '+65', flag: '\u{1F1F8}\u{1F1EC}', name: 'Singapore' },
  { code: '+61', flag: '\u{1F1E6}\u{1F1FA}', name: 'Australia' },
  { code: '+81', flag: '\u{1F1EF}\u{1F1F5}', name: 'Japan' },
  { code: '+49', flag: '\u{1F1E9}\u{1F1EA}', name: 'Germany' },
  { code: '+33', flag: '\u{1F1EB}\u{1F1F7}', name: 'France' },
  { code: '+55', flag: '\u{1F1E7}\u{1F1F7}', name: 'Brazil' },
];

interface Props {
  countryCode: string;
  phone: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
}

export function PhoneInput({ countryCode, phone, onCountryCodeChange, onPhoneChange }: Props) {
  const t = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const current = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={[styles.countryBtn, { backgroundColor: t.bgInput, borderColor: t.borderSubtle }]}
      >
        <Text style={styles.flag}>{current.flag}</Text>
        <Text style={[styles.code, { color: t.text }]}>{current.code}</Text>
      </TouchableOpacity>
      <TextInput
        value={phone}
        onChangeText={(text) => onPhoneChange(text.replace(/\D/g, ''))}
        placeholder="WhatsApp number"
        placeholderTextColor={t.textMuted}
        keyboardType="phone-pad"
        maxLength={12}
        style={[styles.input, { backgroundColor: t.bgInput, borderColor: t.borderSubtle, color: t.text }]}
      />
      <Modal visible={showPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowPicker(false)} activeOpacity={1}>
          <View style={[styles.pickerContainer, { backgroundColor: t.bgElevated }]}>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { onCountryCodeChange(item.code); setShowPicker(false); }}
                  style={[styles.pickerRow, { borderBottomColor: t.borderSubtle }]}
                >
                  <Text style={styles.pickerFlag}>{item.flag}</Text>
                  <Text style={[styles.pickerName, { color: t.text }]}>{item.name}</Text>
                  <Text style={[styles.pickerCode, { color: t.textSecondary }]}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  flag: { fontSize: 16 },
  code: { fontSize: 14, fontWeight: '500' },
  input: { flex: 1, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, letterSpacing: 0.5 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  pickerContainer: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: 400, paddingTop: 12, paddingBottom: 40 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1 },
  pickerFlag: { fontSize: 22, marginRight: 12 },
  pickerName: { flex: 1, fontSize: 16 },
  pickerCode: { fontSize: 15 },
});
