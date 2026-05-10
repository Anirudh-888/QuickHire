import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import kn from './locales/kn.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import ml from './locales/ml.json';
import ta from './locales/ta.json';

const resources = {
  en: { translation: en },
  kn: { translation: kn },
  hi: { translation: hi },
  te: { translation: te },
  ml: { translation: ml },
  ta: { translation: ta }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
