import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import PhotoTypeButton from '../components/atoms/PhotoTypeButton';
import { progressPhotoService } from '../services/progressPhotoService';
import { measurementService } from '../services/measurementService';
import type { PhotoType } from '../types/progress.types';

export default function TakeProgressPhotoScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<PhotoType>('front');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const photoTypes: { type: PhotoType; label: string }[] = [
    { type: 'front', label: 'Front' },
    { type: 'back', label: 'Back' },
    { type: 'side_left', label: 'Left Side' },
    { type: 'side_right', label: 'Right Side' },
  ];

  useEffect(() => {
    requestPermissions();
    loadLatestMeasurement();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and photo library permissions are required to take progress photos.'
        );
      }
    }
  };

  const loadLatestMeasurement = async () => {
    try {
      const latest = await measurementService.getLatestMeasurement();
      if (latest.weight) {
        setWeight(latest.weight.toString());
      }
      if (latest.body_fat_percentage) {
        setBodyFat(latest.body_fat_percentage.toString());
      }
    } catch (error) {
      // No latest measurement, that's okay
      console.log('No latest measurement found');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleSave = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please take or select a photo first');
      return;
    }

    setIsUploading(true);

    try {
      const additionalData: any = {};

      if (weight) {
        const weightNum = parseFloat(weight);
        if (!isNaN(weightNum)) {
          additionalData.weight_kg = weightNum;
        }
      }

      if (bodyFat) {
        const bodyFatNum = parseFloat(bodyFat);
        if (!isNaN(bodyFatNum)) {
          additionalData.body_fat_percentage = bodyFatNum;
        }
      }

      if (notes) {
        additionalData.notes = notes;
      }

      await progressPhotoService.uploadPhoto(imageUri, photoType, additionalData);

      Alert.alert('Success', 'Progress photo uploaded successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Take Progress Photo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Photo Preview or Capture Button */}
        <View style={styles.photoSection}>
          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
              <TouchableOpacity style={styles.retakeButton} onPress={takePhoto}>
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.captureContainer}>
              <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                <Text style={styles.captureButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Photo Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoTypesContainer}
          >
            {photoTypes.map((item) => (
              <PhotoTypeButton
                key={item.type}
                type={item.type}
                label={item.label}
                isSelected={photoType === item.type}
                onPress={() => setPhotoType(item.type)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Weight Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Weight (kg) - Optional</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight"
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Body Fat Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Fat % - Optional</Text>
          <TextInput
            style={styles.input}
            value={bodyFat}
            onChangeText={setBodyFat}
            placeholder="Enter body fat percentage"
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Notes Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes - Optional</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about how you're feeling, workout routine, etc."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, (!imageUri || isUploading) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!imageUri || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Progress Photo</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  placeholder: {
    width: 60,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  photoSection: {
    marginBottom: 20,
  },
  previewContainer: {
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  retakeButton: {
    marginTop: 15,
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  captureContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  captureButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 15,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  galleryButton: {
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  galleryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 10,
  },
  photoTypesContainer: {
    paddingVertical: 5,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
