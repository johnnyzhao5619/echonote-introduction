import { computed } from 'vue'
import { useI18n as useVueI18n } from 'vue-i18n'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/types/i18n'

export function useI18n() {
  const { locale, t, availableLocales } = useVueI18n()

  const currentLanguage = computed(() => locale.value)

  const supportedLanguages = computed(() => SUPPORTED_LANGUAGES)

  const currentLanguageInfo = computed(() => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === locale.value) || SUPPORTED_LANGUAGES[0]
  })

  const changeLanguage = (langCode: SupportedLanguage) => {
    if (availableLocales.includes(langCode)) {
      locale.value = langCode
      // Save to localStorage
      localStorage.setItem('echonote-language', langCode)
      // Update document language attribute
      document.documentElement.lang = langCode
    }
  }

  const getBrowserLanguage = (): SupportedLanguage => {
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

  return {
    t,
    locale,
    currentLanguage,
    currentLanguageInfo,
    supportedLanguages,
    changeLanguage,
    getBrowserLanguage,
  }
}
