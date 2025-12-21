import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import type { ProgressPhoto } from '../../types/progress.types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2; // 2 columns with padding

interface PhotoCardProps {
  photo: ProgressPhoto;
  onPress: () => void;
  showMetadata?: boolean;
}

export default function PhotoCard({ photo, onPress, showMetadata = true }: PhotoCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPhotoTypeLabel = (type: string) => {
    switch (type) {
      case 'front':
        return 'Front';
      case 'back':
        return 'Back';
      case 'side_left':
        return 'Left Side';
      case 'side_right':
        return 'Right Side';
      default:
        return 'Custom';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: photo.thumbnail_url || photo.photo_url }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.typebadge}>
            <Text style={styles.typeBadgeText}>{getPhotoTypeLabel(photo.photo_type)}</Text>
          </View>
        </View>
      </View>

      {showMetadata && (
        <View style={styles.metadata}>
          <Text style={styles.date}>{formatDate(photo.taken_at)}</Text>

          {(photo.weight_kg || photo.body_fat_percentage) && (
            <View style={styles.stats}>
              {photo.weight_kg && (
                <Text style={styles.statText}>{photo.weight_kg}kg</Text>
              )}
              {photo.body_fat_percentage && (
                <Text style={styles.statText}>{photo.body_fat_percentage}%</Text>
              )}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 8,
  },
  typebadge: {
    backgroundColor: 'rgba(108, 99, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  metadata: {
    padding: 10,
  },
  date: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  statText: {
    fontSize: 11,
    color: '#6C63FF',
    fontWeight: '600',
  },
});
