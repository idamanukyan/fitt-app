/**
 * i18n Configuration
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import de from './locales/de.json';

const LANGUAGE_KEY = '@hyperfit_language';

export const resources = {
  en: { translation: en },
  de: { translation: de },
};

export const getStoredLanguage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredLanguage = async (lang: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18n.changeLanguage(lang);
  } catch (error) {
    console.error('Error storing language:', error);
  }
};

export const initI18n = async () => {
  const storedLang = await getStoredLanguage();
  const systemLang = Localization.locale?.split('-')[0] || 'en';
  const defaultLang = storedLang || (systemLang === 'de' ? 'de' : 'en');

  await i18n.use(initReactI18next).init({
    resources,
    lng: defaultLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  return i18n;
};

export const changeLanguage = async (lang: string) => {
  await setStoredLanguage(lang);
};

export const getCurrentLanguage = (): string => {
  return i18n.language || 'en';
};

export const getSupportedLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

export default i18n;
