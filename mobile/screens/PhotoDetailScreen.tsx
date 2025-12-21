import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { progressPhotoService } from '../services/progressPhotoService';
import type { ProgressPhoto } from '../types/progress.types';

const { width, height } = Dimensions.get('window');

export default function PhotoDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const photoId = params.id ? parseInt(params.id as string) : null;

  const [photo, setPhoto] = useState<ProgressPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (photoId) {
      fetchPhoto();
    }
  }, [photoId]);

  const fetchPhoto = async () => {
    if (!photoId) return;

    try {
      const data = await progressPhotoService.getProgressPhoto(photoId);
      setPhoto(data);
    } catch (error) {
      console.error('Failed to fetch photo:', error);
      Alert.alert('Error', 'Failed to load photo details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this progress photo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!photoId) return;

    setIsDeleting(true);
    try {
      await progressPhotoService.deleteProgressPhoto(photoId);
      Alert.alert('Success', 'Photo deleted successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Failed to delete photo:', error);
      Alert.alert('Error', 'Failed to delete photo');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getPhotoTypeLabel = (type: string) => {
    switch (type) {
      case 'front':
        return 'Front View';
      case 'back':
        return 'Back View';
      case 'side_left':
        return 'Left Side View';
      case 'side_right':
        return 'Right Side View';
      default:
        return 'Custom View';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!photo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Photo not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Details</Text>
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteButton}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#FF5252" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Full-size Image */}
        <Image
          source={{ uri: photo.photo_url }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Photo Info Card */}
        <View style={styles.infoCard}>
          {/* Type Badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{getPhotoTypeLabel(photo.photo_type)}</Text>
          </View>

          {/* Date & Time */}
          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>Taken on</Text>
            <Text style={styles.dateText}>{formatDate(photo.taken_at)}</Text>
            <Text style={styles.timeText}>{formatTime(photo.taken_at)}</Text>
          </View>

          {/* Stats */}
          {(photo.weight_kg || photo.body_fat_percentage) && (
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Measurements</Text>
              <View style={styles.statsGrid}>
                {photo.weight_kg && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Weight</Text>
                    <Text style={styles.statValue}>{photo.weight_kg} kg</Text>
                  </View>
                )}
                {photo.body_fat_percentage && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Body Fat</Text>
                    <Text style={styles.statValue}>{photo.body_fat_percentage}%</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Notes */}
          {photo.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{photo.notes}</Text>
            </View>
          )}
        </View>
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
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
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
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#FF5252',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  image: {
    width: width,
    height: height * 0.5,
    backgroundColor: '#000',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    margin: 15,
    borderRadius: 16,
    padding: 20,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  dateSection: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#aaa',
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6C63FF',
  },
  notesSection: {
    marginBottom: 10,
  },
  notesText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
  },
});
