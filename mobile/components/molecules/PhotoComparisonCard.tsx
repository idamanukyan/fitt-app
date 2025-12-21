import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import type { PhotoComparison } from '../../types/progress.types';

const { width } = Dimensions.get('window');

interface PhotoComparisonCardProps {
  comparison: PhotoComparison;
}

export default function PhotoComparisonCard({ comparison }: PhotoComparisonCardProps) {
  const [sliderValue, setSliderValue] = useState(0.5);

  if (!comparison.first_photo || !comparison.latest_photo) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Not enough photos for comparison</Text>
        <Text style={styles.emptySubtext}>Take at least 2 photos to see progress</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Progress Comparison</Text>
        <Text style={styles.subtitle}>
          {comparison.time_difference_days} days of progress
        </Text>
      </View>

      {/* Image Comparison with Slider */}
      <View style={styles.imageContainer}>
        {/* Before Image (underneath) */}
        <Image
          source={{ uri: comparison.first_photo.photo_url }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* After Image (on top, clipped by slider) */}
        <View
          style={[
            styles.afterImageContainer,
            { width: width * sliderValue - 30 },
          ]}
        >
          <Image
            source={{ uri: comparison.latest_photo.photo_url }}
            style={[styles.image, { width: width - 30 }]}
            resizeMode="cover"
          />
        </View>

        {/* Slider Line */}
        <View
          style={[
            styles.sliderLine,
            { left: width * sliderValue - 30 },
          ]}
        />

        {/* Labels */}
        <View style={styles.labelContainer}>
          <View style={styles.label}>
            <Text style={styles.labelText}>BEFORE</Text>
            <Text style={styles.labelDate}>{formatDate(comparison.first_photo.taken_at)}</Text>
          </View>
          <View style={[styles.label, styles.labelRight]}>
            <Text style={styles.labelText}>AFTER</Text>
            <Text style={styles.labelDate}>{formatDate(comparison.latest_photo.taken_at)}</Text>
          </View>
        </View>
      </View>

      {/* Slider Control */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={sliderValue}
        onValueChange={setSliderValue}
        minimumTrackTintColor="#6C63FF"
        maximumTrackTintColor="#333"
        thumbTintColor="#6C63FF"
      />

      {/* Stats */}
      <View style={styles.statsContainer}>
        {comparison.weight_change_kg !== null && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Weight Change</Text>
            <Text
              style={[
                styles.statValue,
                comparison.weight_change_kg < 0 ? styles.statPositive : styles.statNegative,
              ]}
            >
              {comparison.weight_change_kg > 0 ? '+' : ''}
              {comparison.weight_change_kg.toFixed(1)} kg
            </Text>
          </View>
        )}

        {comparison.body_fat_change !== null && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Body Fat Change</Text>
            <Text
              style={[
                styles.statValue,
                comparison.body_fat_change < 0 ? styles.statPositive : styles.statNegative,
              ]}
            >
              {comparison.body_fat_change > 0 ? '+' : ''}
              {comparison.body_fat_change.toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  afterImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'hidden',
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#6C63FF',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  labelContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  labelRight: {
    alignItems: 'flex-end',
  },
  labelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6C63FF',
    marginBottom: 2,
  },
  labelDate: {
    fontSize: 10,
    color: '#fff',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statPositive: {
    color: '#4CAF50',
  },
  statNegative: {
    color: '#FF5252',
  },
  emptyContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#555',
  },
});
