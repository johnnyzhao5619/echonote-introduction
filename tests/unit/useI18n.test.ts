import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useI18n } from '@/composables/useI18n'
import { createI18nMock } from '../mocks'

// 使用统一的Mock配置
const mockI18n = createI18nMock()

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

vi.mock('@/i18n', () => ({
  setDocumentLanguage: vi.fn(),
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  writable: true,
})

Object.defineProperty(navigator, 'languages', {
  value: ['en-US', 'en'],
  writable: true,
})

describe('useI18n', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockI18n.locale.value = 'en'
    vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns current language correctly', () => {
    const { currentLanguage } = useI18n()
    expect(currentLanguage.value).toBe('en')
  })

  it('returns current language info correctly', () => {
    const { currentLanguageInfo } = useI18n()
    expect(currentLanguageInfo.value).toEqual({
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
    })
  })

  it('returns supported languages list', () => {
    const { supportedLanguages } = useI18n()
    expect(supportedLanguages.value).toHaveLength(4)
    expect(supportedLanguages.value[0].code).toBe('en')
    expect(supportedLanguages.value[1].code).toBe('zh-CN')
  })

  it('changes language correctly', async () => {
    const { changeLanguage } = useI18n()

    await changeLanguage('zh-CN')

    expect(mockI18n.locale.value).toBe('zh-CN')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('echonote-language', 'zh-CN')
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'language-changed',
        detail: { language: 'zh-CN' },
      })
    )
  })

  it('does not change to unsupported language', async () => {
    const { changeLanguage } = useI18n()
    const originalLocale = mockI18n.locale.value

    await changeLanguage('unsupported' as any)

    expect(mockI18n.locale.value).toBe(originalLocale)
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
  })

  it('handles localStorage errors gracefully', async () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { changeLanguage } = useI18n()

    await changeLanguage('zh-CN')

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save language preference to localStorage:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('detects browser language correctly for Chinese', () => {
    const { getBrowserLanguage } = useI18n()

    Object.defineProperty(navigator, 'language', { value: 'zh-CN', writable: true })
    expect(getBrowserLanguage()).toBe('zh-CN')

    Object.defineProperty(navigator, 'language', { value: 'zh-TW', writable: true })
    expect(getBrowserLanguage()).toBe('zh-TW')

    Object.defineProperty(navigator, 'language', { value: 'zh-HK', writable: true })
    expect(getBrowserLanguage()).toBe('zh-TW')
  })

  it('detects browser language correctly for French', () => {
    const { getBrowserLanguage } = useI18n()

    Object.defineProperty(navigator, 'language', { value: 'fr-FR', writable: true })
    expect(getBrowserLanguage()).toBe('fr')
  })

  it('falls back to English for unsupported languages', () => {
    const { getBrowserLanguage } = useI18n()

    Object.defineProperty(navigator, 'language', { value: 'de-DE', writable: true })
    expect(getBrowserLanguage()).toBe('en')
  })

  it('handles missing navigator.language', () => {
    const { getBrowserLanguage } = useI18n()

    Object.defineProperty(navigator, 'language', { value: undefined, writable: true })
    Object.defineProperty(navigator, 'languages', { value: undefined, writable: true })

    expect(getBrowserLanguage()).toBe('en')
  })

  it('gets language name correctly', () => {
    const { getLanguageName } = useI18n()

    expect(getLanguageName('en')).toBe('English')
    expect(getLanguageName('en', true)).toBe('English')
    expect(getLanguageName('zh-CN')).toBe('Chinese (Simplified)')
    expect(getLanguageName('zh-CN', true)).toBe('简体中文')
  })

  it('returns language code for unknown languages', () => {
    const { getLanguageName } = useI18n()

    expect(getLanguageName('unknown' as any)).toBe('unknown')
  })

  it('returns false for RTL languages (not implemented)', () => {
    const { isRTL } = useI18n()
    expect(isRTL.value).toBe(false)
  })

  it('provides translation function', () => {
    const { t } = useI18n()
    expect(t).toBe(mockI18n.t)
  })

  it('provides locale ref', () => {
    const { locale } = useI18n()
    expect(locale).toBe(mockI18n.locale)
  })
})
