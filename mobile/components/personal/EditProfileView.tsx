import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../../utils/theme';
import { SectionCard } from './SectionCard';
import { EditableField } from './EditableField';
import type { GradientColors, EditData } from './types';
import { styles, screenStyles } from './styles';

interface EditProfileViewProps {
  fadeAnim: Animated.Value;
  editData: EditData;
  setEditData: (data: EditData) => void;
  avatarUri: string | null;
  isSaving: boolean;
  onPickImage: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const EditProfileView: React.FC<EditProfileViewProps> = ({
  fadeAnim,
  editData,
  setEditData,
  avatarUri,
  isSaving,
  onPickImage,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();

  const fitnessLevels = [
    { value: 'beginner', label: t('profile.fitnessLevels.beginner') },
    { value: 'intermediate', label: t('profile.fitnessLevels.intermediate') },
    { value: 'advanced', label: t('profile.fitnessLevels.advanced') },
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ];

  return (
    <View style={screenStyles.container}>
      <LinearGradient colors={theme.gradients.background as unknown as GradientColors} style={screenStyles.backgroundGradient} />

      <ScrollView
        contentContainerStyle={screenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Edit Header */}
          <View style={styles.editHeader}>
            <TouchableOpacity onPress={onCancel} style={styles.editHeaderButton}>
              <Ionicons name="close" size={24} color={theme.colors.darkGray} />
            </TouchableOpacity>
            <Text style={styles.editHeaderTitle}>{t('profile.actions.editProfile')}</Text>
            <TouchableOpacity
              onPress={onSave}
              style={styles.editHeaderButton}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={theme.colors.lightGreen} />
              ) : (
                <Ionicons name="checkmark" size={24} color={theme.colors.lightGreen} />
              )}
            </TouchableOpacity>
          </View>

          {/* Avatar Edit */}
          <View style={styles.editAvatarSection}>
            <TouchableOpacity onPress={onPickImage} style={styles.editAvatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.editAvatarImage} />
              ) : (
                <View style={styles.editAvatarPlaceholder}>
                  <Ionicons name="person" size={40} color={theme.colors.darkGray} />
                </View>
              )}
              <View style={styles.editAvatarOverlay}>
                <Ionicons name="camera" size={20} color={theme.colors.white} />
                <Text style={styles.editAvatarText}>Change</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Edit Fields */}
          <SectionCard title="Personal Information" icon="person-outline">
            <EditableField
              label="Full Name"
              value={editData.full_name}
              onChangeText={(text) => setEditData({ ...editData, full_name: text })}
              placeholder="Enter your name"
              icon="person-outline"
            />

            <EditableField
              label="Bio"
              value={editData.bio}
              onChangeText={(text) => setEditData({ ...editData, bio: text })}
              placeholder="Tell us about yourself"
              icon="document-text-outline"
            />

            <View style={styles.editableField}>
              <Text style={styles.editableFieldLabel}>Gender</Text>
              <View style={styles.optionButtonsRow}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      editData.gender === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() => setEditData({ ...editData, gender: option.value })}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      editData.gender === option.value && styles.optionButtonTextActive,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </SectionCard>

          <SectionCard title="Body Metrics" icon="body-outline" accentColor={theme.colors.neonCyan}>
            <EditableField
              label="Height"
              value={editData.height}
              onChangeText={(text) => setEditData({ ...editData, height: text })}
              placeholder="175"
              keyboardType="numeric"
              icon="resize-outline"
              suffix="cm"
            />

            <EditableField
              label="Weight"
              value={editData.weight}
              onChangeText={(text) => setEditData({ ...editData, weight: text })}
              placeholder="70"
              keyboardType="numeric"
              icon="scale-outline"
              suffix="kg"
            />

            <View style={styles.editableField}>
              <Text style={styles.editableFieldLabel}>Fitness Level</Text>
              <View style={styles.optionButtonsRow}>
                {fitnessLevels.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.optionButton,
                      editData.fitness_level === level.value && styles.optionButtonActive,
                    ]}
                    onPress={() => setEditData({ ...editData, fitness_level: level.value })}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      editData.fitness_level === level.value && styles.optionButtonTextActive,
                    ]}>
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </SectionCard>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={theme.gradients.buttonPrimary as unknown as GradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              {isSaving ? (
                <ActivityIndicator color={theme.colors.black} size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.black} />
                  <Text style={styles.saveButtonText}>{t('profile.edit.saveChanges')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

