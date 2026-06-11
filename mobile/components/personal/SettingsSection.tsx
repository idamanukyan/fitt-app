import React from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import theme from '../../utils/theme';
import type { UserProfile } from '../../types/api.types';
import { SectionCard } from './SectionCard';
import { SettingsRow } from './SettingsRow';

interface ProfileDetailsSectionProps {
  profile: UserProfile | null;
  userEmail: string;
  onEditPress: () => void;
}

export const ProfileDetailsSection: React.FC<ProfileDetailsSectionProps> = ({
  profile,
  userEmail,
  onEditPress,
}) => {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('profile.sections.details')} icon="person-outline">
      <SettingsRow
        icon="person"
        label={t('profile.fields.fullName')}
        value={profile?.full_name || t('common.notSet', 'Not set')}
        onPress={onEditPress}
      />
      <SettingsRow
        icon="mail"
        label={t('profile.fields.email')}
        value={userEmail}
        showChevron={false}
      />
      {profile?.bio && (
        <SettingsRow
          icon="document-text"
          label="Bio"
          value={profile.bio.length > 30 ? `${profile.bio.substring(0, 30)}...` : profile.bio}
          onPress={onEditPress}
        />
      )}
    </SectionCard>
  );
};

interface BodyMetricsSectionProps {
  profile: UserProfile | null;
  onEditPress: () => void;
}

export const BodyMetricsSection: React.FC<BodyMetricsSectionProps> = ({
  profile,
  onEditPress,
}) => {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('profile.sections.metrics')} icon="body-outline" accentColor={theme.colors.neonCyan}>
      <SettingsRow
        icon="resize-outline"
        label={t('profile.fields.height')}
        value={profile?.height ? `${profile.height} cm` : t('common.notSet', 'Not set')}
        onPress={onEditPress}
        accentColor={theme.colors.neonCyan}
      />
      <SettingsRow
        icon="scale-outline"
        label={t('profile.fields.weight')}
        value={profile?.weight ? `${profile.weight} kg` : t('common.notSet', 'Not set')}
        onPress={onEditPress}
        accentColor={theme.colors.neonCyan}
      />
      <SettingsRow
        icon="fitness-outline"
        label={t('profile.fields.fitnessLevel')}
        value={profile?.fitness_level ? t(`profile.fitnessLevels.${profile.fitness_level}`) : t('common.notSet', 'Not set')}
        onPress={onEditPress}
        accentColor={theme.colors.neonCyan}
      />
    </SectionCard>
  );
};

interface PreferencesSectionProps {
  currentLanguageName: string;
  onLanguagePress: () => void;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  currentLanguageName,
  onLanguagePress,
}) => {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('profile.sections.preferences')} icon="settings-outline" accentColor={theme.colors.neonOrange}>
      <SettingsRow
        icon="language-outline"
        label={t('profile.language.title')}
        value={currentLanguageName}
        onPress={onLanguagePress}
        accentColor={theme.colors.neonOrange}
      />
      <SettingsRow
        icon="notifications-outline"
        label={t('profile.notifications', 'Notifications')}
        value={t('common.enabled', 'Enabled')}
        onPress={() => Alert.alert(t('profile.comingSoon.title'), t('profile.comingSoon.message'))}
        accentColor={theme.colors.neonOrange}
      />
      <SettingsRow
        icon="moon-outline"
        label={t('profile.theme', 'Theme')}
        value={t('profile.themeDark', 'Dark')}
        showChevron={false}
        accentColor={theme.colors.neonOrange}
      />
    </SectionCard>
  );
};

interface SecuritySectionProps {}

export const SecuritySection: React.FC<SecuritySectionProps> = () => {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('profile.sections.security')} icon="shield-outline" accentColor={theme.colors.neonPurple}>
      <SettingsRow
        icon="key-outline"
        label={t('profile.actions.changePassword')}
        onPress={() => Alert.alert(t('profile.comingSoon.title'), t('profile.comingSoon.message'))}
        accentColor={theme.colors.neonPurple}
      />
      <SettingsRow
        icon="finger-print-outline"
        label={t('profile.actions.twoFactor')}
        value={t('common.off', 'Off')}
        onPress={() => Alert.alert(t('profile.comingSoon.title'), t('profile.comingSoon.message'))}
        accentColor={theme.colors.neonPurple}
      />
      <SettingsRow
        icon="phone-portrait-outline"
        label={t('profile.connectedDevices', 'Connected Devices')}
        value={t('profile.oneDevice', '1 device')}
        onPress={() => Alert.alert(t('profile.comingSoon.title'), t('profile.comingSoon.message'))}
        accentColor={theme.colors.neonPurple}
      />
    </SectionCard>
  );
};

interface DataPrivacySectionProps {}

export const DataPrivacySection: React.FC<DataPrivacySectionProps> = () => {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('profile.sections.dataPrivacy')} icon="lock-closed-outline" accentColor={theme.colors.techBlue}>
      <SettingsRow
        icon="download-outline"
        label={t('profile.actions.exportData')}
        onPress={() => Alert.alert(t('profile.comingSoon.title'), t('profile.comingSoon.message'))}
        accentColor={theme.colors.techBlue}
      />
      <SettingsRow
        icon="analytics-outline"
        label={t('profile.usageAnalytics', 'Usage Analytics')}
        value={t('common.enabled', 'Enabled')}
        onPress={() => Alert.alert(t('profile.comingSoon.title'), t('profile.comingSoon.message'))}
        accentColor={theme.colors.techBlue}
      />
    </SectionCard>
  );
};

interface AccountSectionProps {
  onLogout: () => void;
}

export const AccountSection: React.FC<AccountSectionProps> = ({ onLogout }) => {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('profile.sections.account')} icon="log-out-outline" accentColor={theme.colors.error}>
      <SettingsRow
        icon="log-out-outline"
        label={t('profile.actions.logout')}
        onPress={onLogout}
        destructive
        showChevron={false}
      />
    </SectionCard>
  );
};
