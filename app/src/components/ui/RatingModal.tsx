import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { GradientButton } from './GradientButton';

interface Props {
  visible: boolean;
  initialRating?: number;
  onRate: (rating: number) => void;
  onClose: () => void;
}

export function RatingModal({ visible, initialRating = 0, onRate, onClose }: Props) {
  const t = useTheme();
  const [rating, setRating] = useState(initialRating);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.card, { backgroundColor: t.bgElevated, borderColor: t.border }]}>
          <Text style={[styles.title, { color: t.text }]}>Rate this story</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>Tap a star to rate</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)} activeOpacity={0.7}>
                <Feather
                  name="star"
                  size={36}
                  color={s <= rating ? t.starActive : t.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
          <GradientButton
            title="Submit Rating"
            onPress={() => onRate(rating)}
            disabled={rating === 0}
            style={styles.submitBtn}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 280,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 20 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  submitBtn: { width: '100%' },
});
