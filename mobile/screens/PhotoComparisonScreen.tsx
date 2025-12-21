import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import PhotoComparisonCard from '../components/molecules/PhotoComparisonCard';
import PhotoTypeButton from '../components/atoms/PhotoTypeButton';
import { progressPhotoService } from '../services/progressPhotoService';
import type { PhotoComparison, PhotoType } from '../types/progress.types';

export default function PhotoComparisonScreen() {
  const router = useRouter();
  const [comparison, setComparison] = useState<PhotoComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<PhotoType | 'all'>('all');

  const photoTypes: { type: PhotoType | 'all'; label: string }[] = [
    { type: 'all', label: 'All' },
    { type: 'front', label: 'Front' },
    { type: 'back', label: 'Back' },
    { type: 'side_left', label: 'Left' },
    { type: 'side_right', label: 'Right' },
  ];

  useEffect(() => {
    fetchComparison();
  }, [selectedType]);

  const fetchComparison = async () => {
    setIsLoading(true);
    try {
      const filterType = selectedType === 'all' ? undefined : selectedType;
      const data = await progressPhotoService.getComparison(filterType);
      setComparison(data);
    } catch (error) {
      console.error('Failed to fetch comparison:', error);
      Alert.alert('Error', 'Failed to load comparison data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Comparison</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {photoTypes.map((item) => (
          <PhotoTypeButton
            key={item.type}
            type={item.type as PhotoType}
            label={item.label}
            isSelected={selectedType === item.type}
            onPress={() => setSelectedType(item.type)}
          />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Comparison Card */}
        {comparison && <PhotoComparisonCard comparison={comparison} />}

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for Better Progress Photos</Text>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>1</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Same Lighting</Text>
              <Text style={styles.tipText}>
                Take photos in the same lighting conditions each time for accurate comparison
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>2</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Same Time of Day</Text>
              <Text style={styles.tipText}>
                Morning photos work best, before eating or working out
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>3</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Same Angle & Distance</Text>
              <Text style={styles.tipText}>
                Stand in the same position and distance from camera
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>4</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Be Consistent</Text>
              <Text style={styles.tipText}>
                Take photos weekly or bi-weekly for best progress tracking
              </Text>
            </View>
          </View>
        </View>

        {/* Motivation Section */}
        {comparison?.time_difference_days && comparison.time_difference_days > 30 && (
          <View style={styles.motivationCard}>
            <Text style={styles.motivationTitle}>Keep Going!</Text>
            <Text style={styles.motivationText}>
              You've been tracking your progress for {comparison.time_difference_days} days.
              That's {Math.floor(comparison.time_difference_days / 7)} weeks of dedication!
            </Text>
            {comparison.weight_change_kg !== null && comparison.weight_change_kg < 0 && (
              <Text style={styles.motivationHighlight}>
                You've lost {Math.abs(comparison.weight_change_kg).toFixed(1)} kg so far!
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  placeholder: {
    width: 60,
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterContent: {
    paddingHorizontal: 15,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  tipsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tipNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 15,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
  motivationCard: {
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6C63FF',
    marginBottom: 10,
  },
  motivationText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 10,
  },
  motivationHighlight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
});
