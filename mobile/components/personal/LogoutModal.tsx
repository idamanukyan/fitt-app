import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import type { GradientColors } from './types';
import { styles } from './styles';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
  title: string;
  message: string;
  cancelText: string;
  confirmText: string;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isLoggingOut,
  title,
  message,
  cancelText,
  confirmText,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.logoutModalContainer}>
          <LinearGradient
            colors={theme.gradients.backgroundSubtle as unknown as GradientColors}
            style={styles.logoutModalGradient}
          >
            <View style={styles.logoutModalIcon}>
              <Ionicons name="log-out-outline" size={40} color={theme.colors.error} />
            </View>

            <Text style={styles.logoutModalTitle}>{title}</Text>
            <Text style={styles.logoutModalMessage}>{message}</Text>

            <View style={styles.logoutModalActions}>
              <TouchableOpacity
                style={styles.logoutCancelButton}
                onPress={onClose}
                disabled={isLoggingOut}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutCancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutConfirmButton}
                onPress={onConfirm}
                disabled={isLoggingOut}
                activeOpacity={0.8}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color={theme.colors.white} size="small" />
                ) : (
                  <Text style={styles.logoutConfirmButtonText}>{confirmText}</Text>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};
