import { StyleSheet } from 'react-native';
import theme from '../../utils/theme';

// Screen-level styles used by PersonalScreen itself
export const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: theme.colors.darkGray,
    letterSpacing: 1,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.darkGray,
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 11,
    color: `${theme.colors.darkGray}80`,
  },
});

// Component-level styles shared across sub-components
export const styles = StyleSheet.create({
  // Section Card
  sectionCard: {
    backgroundColor: theme.colors.concrete,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}15`,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  sectionContent: {
    paddingBottom: 8,
  },

  // Settings Row
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  settingsRowPressed: {
    backgroundColor: `${theme.colors.white}05`,
  },
  settingsRowDisabled: {
    opacity: 0.5,
  },
  settingsRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsRowContent: {
    flex: 1,
  },
  settingsRowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.white,
  },
  settingsRowValue: {
    fontSize: 13,
    color: theme.colors.darkGray,
    marginTop: 2,
  },

  // Editable Field
  editableField: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  editableFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.darkGray,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  editableFieldInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.concreteDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.darkGray}40`,
    paddingHorizontal: 14,
    height: 50,
  },
  editableFieldInputFocused: {
    borderColor: theme.colors.lightGreen,
    backgroundColor: `${theme.colors.lightGreen}08`,
  },
  editableFieldIcon: {
    marginRight: 10,
  },
  editableFieldTextInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.white,
  },
  editableFieldSuffix: {
    fontSize: 14,
    color: theme.colors.darkGray,
    marginLeft: 8,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.lightGreen,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.lightGreen,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.lightGreen,
    letterSpacing: 2,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.black,
  },
  avatarGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 60,
    backgroundColor: `${theme.colors.lightGreen}10`,
    zIndex: -1,
  },
  avatarInfo: {
    alignItems: 'center',
  },
  avatarName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 4,
  },
  avatarEmail: {
    fontSize: 14,
    color: theme.colors.darkGray,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    backgroundColor: theme.colors.concrete,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}20`,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: theme.colors.darkGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: `${theme.colors.darkGray}40`,
    marginHorizontal: 16,
  },

  // Edit Mode
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  editHeaderButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
  },
  editAvatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  editAvatarWrapper: {
    position: 'relative',
  },
  editAvatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editAvatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.concrete,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.darkGray,
    borderStyle: 'dashed',
  },
  editAvatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarText: {
    fontSize: 12,
    color: theme.colors.white,
    marginTop: 4,
  },

  // Option Buttons
  optionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: `${theme.colors.darkGray}40`,
  },
  optionButtonActive: {
    backgroundColor: `${theme.colors.lightGreen}20`,
    borderColor: theme.colors.lightGreen,
  },
  optionButtonText: {
    fontSize: 13,
    color: theme.colors.darkGray,
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: theme.colors.lightGreen,
  },

  // Save/Cancel Buttons
  saveButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 0.5,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    color: theme.colors.darkGray,
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}30`,
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  modalHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${theme.colors.lightGreen}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
  },

  // Language Options
  languageOptions: {
    gap: 10,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.concreteDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  languageOptionActive: {
    borderColor: theme.colors.lightGreen,
    backgroundColor: `${theme.colors.lightGreen}10`,
  },
  languageOptionContent: {
    flex: 1,
  },
  languageOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  languageOptionNameActive: {
    color: theme.colors.lightGreen,
  },
  languageOptionSubtext: {
    fontSize: 13,
    color: theme.colors.darkGray,
    marginTop: 2,
  },
  languageCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Logout Modal
  logoutModalContainer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${theme.colors.error}40`,
  },
  logoutModalGradient: {
    padding: 28,
    alignItems: 'center',
  },
  logoutModalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${theme.colors.error}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 8,
  },
  logoutModalMessage: {
    fontSize: 14,
    color: theme.colors.darkGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  logoutModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.concreteDark,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${theme.colors.darkGray}40`,
  },
  logoutCancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.darkGray,
  },
  logoutConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
  },
  logoutConfirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.white,
  },
});
