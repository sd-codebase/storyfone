import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { StoryfoneIcon } from '../../icons';
import { API_BASE } from '../../constants/api';

interface Props {
  thumbnailUrl: string | null;
  title: string;
  size: { width: number | '100%'; height: number };
  borderRadius?: number;
  fontSize?: number;
}

export function BookCover({ thumbnailUrl, title, size, borderRadius = 12, fontSize }: Props) {
  const t = useTheme();

  const containerStyle = {
    width: size.width,
    height: size.height,
    borderRadius,
    overflow: 'hidden' as const,
  };

  if (thumbnailUrl) {
    const uri = thumbnailUrl.startsWith('http') ? thumbnailUrl : API_BASE + thumbnailUrl;
    return (
      <View style={containerStyle}>
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      </View>
    );
  }

  // Fallback: Storyfone icon instead of letter gradient
  const iconSize = fontSize ? fontSize * 0.6 : (typeof size.height === 'number' ? size.height * 0.35 : 24);

  return (
    <LinearGradient
      colors={t.gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[containerStyle, styles.fallback]}
    >
      <StoryfoneIcon size={iconSize} theme={t} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
