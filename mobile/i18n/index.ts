/**
 * i18n Configuration for HyperFit
 * Supports English and Spanish
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './locales/en.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

// Get the device locale
const getDeviceLocale = (): string => {
  try {
    const locales = getLocales();
    if (locales && locales.length > 0) {
      return locales[0].languageCode || 'en';
    }
  } catch (error) {
    console.log('Error getting device locale:', error);
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLocale(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

export default i18n;
