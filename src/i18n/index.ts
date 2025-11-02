import { createI18n } from 'vue-i18n'

// Import locale messages
import en from '../locales/en.json'
import zhCN from '../locales/zh-CN.json'

export type MessageLanguages = keyof typeof en
export type MessageSchema = typeof en

const messages = {
  en,
  'zh-CN': zhCN,
}

// Get browser language or default to English
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en'

  // Map browser language codes to our supported locales
  if (browserLang.startsWith('zh')) {
    if (browserLang.includes('TW') || browserLang.includes('HK')) {
      return 'zh-TW'
    }
    return 'zh-CN'
  }

  if (browserLang.startsWith('fr')) {
    return 'fr'
  }

  return 'en'
}

// Get saved language from localStorage or use browser language
const getSavedLanguage = (): string => {
  const saved = localStorage.getItem('echonote-language')
  if (saved && Object.keys(messages).includes(saved)) {
    return saved
  }
  return getBrowserLanguage()
}

export const i18n = createI18n({
  legacy: false,
  locale: getSavedLanguage(),
  fallbackLocale: 'en',
  messages,
})

export default i18n
