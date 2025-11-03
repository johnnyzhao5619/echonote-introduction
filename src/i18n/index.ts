import { createI18n } from 'vue-i18n'

// Import locale messages
import en from '../locales/en.json'
import zhCN from '../locales/zh-CN.json'
import zhTW from '../locales/zh-TW.json'
import fr from '../locales/fr.json'

export type MessageLanguages = 'en' | 'zh-CN' | 'zh-TW' | 'fr'
export type MessageSchema = typeof en

const messages = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  fr,
}

// Get browser language or default to English
const getBrowserLanguage = (): MessageLanguages => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en'

  // Map browser language codes to our supported locales
  if (browserLang.startsWith('zh')) {
    if (browserLang.includes('TW') || browserLang.includes('HK') || browserLang.includes('MO')) {
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
const getSavedLanguage = (): MessageLanguages => {
  const saved = localStorage.getItem('echonote-language')
  if (saved && Object.keys(messages).includes(saved)) {
    return saved as MessageLanguages
  }
  return getBrowserLanguage()
}

// Set document language attribute
const setDocumentLanguage = (locale: string): void => {
  document.documentElement.lang = locale
}

// Initialize document language
const initialLocale = getSavedLanguage() as MessageLanguages
setDocumentLanguage(initialLocale)

export const i18n = createI18n<[MessageSchema], MessageLanguages>({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages,
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false,
})

export { getBrowserLanguage, getSavedLanguage, setDocumentLanguage }
export default i18n
