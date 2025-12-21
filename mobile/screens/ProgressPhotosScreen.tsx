import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { progressPhotoService } from '../services/progressPhotoService';
import PhotoCard from '../components/atoms/PhotoCard';
import PhotoTypeButton from '../components/atoms/PhotoTypeButton';
import type { ProgressPhoto, PhotoType, PhotoComparison } from '../types/progress.types';

export default function ProgressPhotosScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [comparison, setComparison] = useState<PhotoComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<PhotoType | 'all'>('all');
  const [view, setView] = useState<'grid' | 'timeline' | 'comparison'>('grid');

  const photoTypes: { type: PhotoType | 'all'; label: string }[] = [
    { type: 'all', label: 'All' },
    { type: 'front', label: 'Front' },
    { type: 'back', label: 'Back' },
    { type: 'side_left', label: 'Left' },
    { type: 'side_right', label: 'Right' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchPhotos();
      fetchComparison();
    }
  }, [isAuthenticated, selectedType]);

  const fetchPhotos = async () => {
    try {
      const filterType = selectedType === 'all' ? undefined : selectedType;
      const data = await progressPhotoService.getProgressPhotos(filterType, 0, 100);
      setPhotos(data);
    } catch (error) {
      console.error('Failed to fetch progress photos:', error);
      Alert.alert('Error', 'Failed to load progress photos');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchComparison = async () => {
    try {
      const filterType = selectedType === 'all' ? undefined : selectedType;
      const data = await progressPhotoService.getComparison(filterType);
      setComparison(data);
    } catch (error) {
      console.error('Failed to fetch comparison:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPhotos();
    fetchComparison();
  };

  const handlePhotoPress = (photo: ProgressPhoto) => {
    router.push(`/photo-detail/${photo.id}` as any);
  };

  const handleTakePhoto = () => {
    router.push('/take-progress-photo' as any);
  };

  const handleViewComparison = () => {
    router.push('/photo-comparison' as any);
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
        <Text style={styles.title}>Progress Photos</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleTakePhoto}>
          <Text style={styles.addButtonText}>+ Take Photo</Text>
        </TouchableOpacity>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewButton, view === 'grid' && styles.viewButtonActive]}
          onPress={() => setView('grid')}
        >
          <Text style={[styles.viewButtonText, view === 'grid' && styles.viewButtonTextActive]}>
            Grid
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, view === 'comparison' && styles.viewButtonActive]}
          onPress={() => setView('comparison')}
        >
          <Text
            style={[styles.viewButtonText, view === 'comparison' && styles.viewButtonTextActive]}
          >
            Compare
          </Text>
        </TouchableOpacity>
      </View>

      {/* Photo Type Filter */}
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

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />}
      >
        {view === 'comparison' ? (
          // Comparison View
          <View style={styles.comparisonContainer}>
            {comparison && comparison.first_photo && comparison.latest_photo ? (
              <TouchableOpacity onPress={handleViewComparison}>
                <View style={styles.comparisonPreview}>
                  <Text style={styles.comparisonTitle}>Before & After</Text>
                  <Text style={styles.comparisonSubtitle}>
                    {comparison.time_difference_days} days of progress
                  </Text>

                  <View style={styles.comparisonImages}>
                    <View style={styles.comparisonImageWrapper}>
                      <PhotoCard photo={comparison.first_photo} onPress={handleViewComparison} showMetadata={false} />
                      <Text style={styles.comparisonLabel}>Before</Text>
                    </View>
                    <View style={styles.comparisonImageWrapper}>
                      <PhotoCard photo={comparison.latest_photo} onPress={handleViewComparison} showMetadata={false} />
                      <Text style={styles.comparisonLabel}>After</Text>
                    </View>
                  </View>

                  {(comparison.weight_change_kg !== null || comparison.body_fat_change !== null) && (
                    <View style={styles.comparisonStats}>
                      {comparison.weight_change_kg !== null && (
                        <View style={styles.comparisonStat}>
                          <Text style={styles.comparisonStatLabel}>Weight Change</Text>
                          <Text
                            style={[
                              styles.comparisonStatValue,
                              comparison.weight_change_kg < 0
                                ? styles.statPositive
                                : styles.statNegative,
                            ]}
                          >
                            {comparison.weight_change_kg > 0 ? '+' : ''}
                            {comparison.weight_change_kg.toFixed(1)} kg
                          </Text>
                        </View>
                      )}
                      {comparison.body_fat_change !== null && (
                        <View style={styles.comparisonStat}>
                          <Text style={styles.comparisonStatLabel}>Body Fat Change</Text>
                          <Text
                            style={[
                              styles.comparisonStatValue,
                              comparison.body_fat_change < 0
                                ? styles.statPositive
                                : styles.statNegative,
                            ]}
                          >
                            {comparison.body_fat_change > 0 ? '+' : ''}
                            {comparison.body_fat_change.toFixed(1)}%
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  <TouchableOpacity style={styles.viewFullButton} onPress={handleViewComparison}>
                    <Text style={styles.viewFullButtonText}>View Full Comparison</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Not enough photos for comparison</Text>
                <Text style={styles.emptySubtext}>Take at least 2 photos to see your progress</Text>
              </View>
            )}
          </View>
        ) : photos.length === 0 ? (
          // Empty State
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No progress photos yet</Text>
            <Text style={styles.emptySubtext}>Start tracking your fitness journey visually</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleTakePhoto}>
              <Text style={styles.emptyButtonText}>Take Your First Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Grid View
          <View style={styles.gridContainer}>
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} onPress={() => handlePhotoPress(photo)} />
            ))}
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
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
    gap: 10,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: '#6C63FF',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
  },
  viewButtonTextActive: {
    color: '#fff',
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  comparisonContainer: {
    marginTop: 10,
  },
  comparisonPreview: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 15,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  comparisonSubtitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 15,
  },
  comparisonImages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  comparisonImageWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C63FF',
    textAlign: 'center',
    marginTop: 8,
  },
  comparisonStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  comparisonStat: {
    alignItems: 'center',
  },
  comparisonStatLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  comparisonStatValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statPositive: {
    color: '#4CAF50',
  },
  statNegative: {
    color: '#FF5252',
  },
  viewFullButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewFullButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
