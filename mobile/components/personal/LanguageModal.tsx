import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import type { GradientColors } from './types';
import { styles } from './styles';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLanguage: (langCode: string) => void;
  currentLang: string;
  supportedLanguages: Array<{ code: string; name: string; nativeName: string }>;
  title: string;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  visible,
  onClose,
  onSelectLanguage,
  currentLang,
  supportedLanguages,
  title,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={theme.gradients.backgroundSubtle as unknown as GradientColors}
            style={styles.modalGradient}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons name="language" size={24} color={theme.colors.lightGreen} />
              </View>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.colors.darkGray} />
              </TouchableOpacity>
            </View>

            <View style={styles.languageOptions}>
              {supportedLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    currentLang === lang.code && styles.languageOptionActive,
                  ]}
                  onPress={() => onSelectLanguage(lang.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageOptionContent}>
                    <Text style={[
                      styles.languageOptionName,
                      currentLang === lang.code && styles.languageOptionNameActive,
                    ]}>
                      {lang.nativeName}
                    </Text>
                    <Text style={styles.languageOptionSubtext}>{lang.name}</Text>
                  </View>
                  {currentLang === lang.code && (
                    <View style={styles.languageCheckmark}>
                      <Ionicons name="checkmark" size={18} color={theme.colors.black} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};
