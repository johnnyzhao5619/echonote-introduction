import { computed, watch, nextTick, ref } from 'vue'
import { useI18n as useVueI18n } from 'vue-i18n'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/types/i18n'
import { setDocumentLanguage } from '@/i18n'
import {
  translationManager,
  getFallbackTranslation,
  type TranslationReport,
} from '@/utils/translationManager'

// Import all locale messages for validation
import en from '@/locales/en.json'
import zhCN from '@/locales/zh-CN.json'
import zhTW from '@/locales/zh-TW.json'
import fr from '@/locales/fr.json'

export function useI18n() {
  const { locale, t, availableLocales } = useVueI18n()

  // Translation validation state
  const translationReports = ref<Record<string, TranslationReport>>({})
  const terminologyIssues = ref<Record<string, string[]>>({})
  const isValidationComplete = ref(false)

  const currentLanguage = computed(() => locale.value as SupportedLanguage)

  const supportedLanguages = computed(() => SUPPORTED_LANGUAGES)

  const currentLanguageInfo = computed(() => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === locale.value) || SUPPORTED_LANGUAGES[0]
  })

  const isRTL = computed(() => {
    // Add RTL language support if needed in the future
    return false
  })

  const currentTranslationReport = computed(() => {
    return translationReports.value[locale.value] || null
  })

  const translationCompleteness = computed(() => {
    const report = currentTranslationReport.value
    return report ? report.completeness : 100
  })

  const changeLanguage = async (langCode: SupportedLanguage) => {
    if (availableLocales.includes(langCode)) {
      locale.value = langCode

      // Save to localStorage with error handling
      try {
        localStorage.setItem('echonote-language', langCode)
      } catch (error) {
        console.warn('Failed to save language preference to localStorage:', error)
      }

      // Update document language attribute
      await nextTick()
      setDocumentLanguage(langCode)

      // Dispatch custom event for other components to listen
      window.dispatchEvent(
        new CustomEvent('language-changed', {
          detail: { language: langCode },
        })
      )
    }
  }

  const getBrowserLanguage = (): SupportedLanguage => {
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

  const getLanguageName = (langCode: SupportedLanguage, native = false): string => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode)
    return lang ? (native ? lang.nativeName : lang.name) : langCode
  }

  /**
   * Enhanced translation function with fallback support
   */
  const tWithFallback = (key: string, values?: Record<string, any>): string => {
    try {
      const translation = t(key, values || {})

      // Check if translation is missing or empty
      if (!translation || translation === key || translation.trim() === '') {
        console.warn(`Missing translation for key: ${key} in locale: ${locale.value}`)

        // Dispatch event for tracking fallback usage
        window.dispatchEvent(
          new CustomEvent('translation-fallback-used', {
            detail: { key, locale: locale.value },
          })
        )

        return getFallbackTranslation(key, en, getCurrentMessages())
      }

      return translation
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error)

      // Dispatch event for tracking fallback usage
      window.dispatchEvent(
        new CustomEvent('translation-fallback-used', {
          detail: { key, locale: locale.value, error: true },
        })
      )

      return getFallbackTranslation(key, en, getCurrentMessages())
    }
  }

  /**
   * Get current locale messages
   */
  const getCurrentMessages = () => {
    const messages = { en, 'zh-CN': zhCN, 'zh-TW': zhTW, fr }
    return messages[locale.value as keyof typeof messages] || en
  }

  /**
   * Validate all translations and generate reports
   */
  const validateTranslations = async () => {
    try {
      const allMessages = { en, 'zh-CN': zhCN, 'zh-TW': zhTW, fr }

      // Generate translation reports using unified manager
      translationReports.value = await translationManager.validateAllTranslations(en, allMessages)

      // Extract terminology issues from reports
      terminologyIssues.value = {}
      Object.entries(translationReports.value).forEach(([locale, report]) => {
        const terminologyIssuesList = report.issues
          .filter(issue => issue.type === 'terminology')
          .map(issue => issue.message)

        if (terminologyIssuesList.length > 0) {
          terminologyIssues.value[locale] = terminologyIssuesList
        }
      })

      isValidationComplete.value = true

      // Log validation results in development
      if (import.meta.env.DEV) {
        console.group('Translation Validation Results')
        Object.entries(translationReports.value).forEach(([locale, report]) => {
          console.log(
            `${locale}: ${report.completeness}% complete (Overall: ${report.overallScore}%)`
          )
          if (report.issues.length > 0) {
            console.warn(`${locale} issues:`, report.issues)
          }
          if (report.recommendations.length > 0) {
            console.info(`${locale} recommendations:`, report.recommendations)
          }
        })
        console.groupEnd()
      }
    } catch (error) {
      console.error('Translation validation failed:', error)
    }
  }

  /**
   * Get missing translation keys for current locale
   */
  const getMissingKeys = computed(() => {
    const report = currentTranslationReport.value
    return report ? report.missingKeys : []
  })

  /**
   * Check if current locale has translation issues
   */
  const hasTranslationIssues = computed(() => {
    const report = currentTranslationReport.value
    return report ? report.issues.length > 0 : false
  })

  // Watch for locale changes and update document attributes
  watch(
    locale,
    newLocale => {
      setDocumentLanguage(newLocale)
    },
    { immediate: true }
  )

  // Validate translations on initialization
  validateTranslations()

  return {
    t,
    tWithFallback,
    locale,
    currentLanguage,
    currentLanguageInfo,
    supportedLanguages,
    isRTL,
    changeLanguage,
    getBrowserLanguage,
    getLanguageName,
    validateTranslations,
    translationReports,
    currentTranslationReport,
    translationCompleteness,
    terminologyIssues,
    isValidationComplete,
    getMissingKeys,
    hasTranslationIssues,
  }
}
