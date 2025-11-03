/**
 * 统一的测试Mock配置
 * 遵循DRY原则，避免重复代码
 */
import { vi } from 'vitest'
import { ref } from 'vue'

// 统一的i18n Mock配置
export const createI18nMock = () => {
  const mockLocale = ref('en')
  const mockT = vi.fn((key: string) => key)
  const mockAvailableLocales = ['en', 'zh-CN', 'zh-TW', 'fr']

  return {
    locale: mockLocale,
    t: mockT,
    availableLocales: mockAvailableLocales,
  }
}

// 统一的useI18n composable Mock
export const createUseI18nMock = () => {
  const mockChangeLanguage = vi.fn()
  const mockCurrentLanguage = ref('en')
  const mockCurrentLanguageInfo = ref({
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  })
  const mockSupportedLanguages = ref([
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  ])

  return {
    t: vi.fn((key: string) => key),
    currentLanguage: mockCurrentLanguage,
    currentLanguageInfo: mockCurrentLanguageInfo,
    supportedLanguages: mockSupportedLanguages,
    changeLanguage: mockChangeLanguage,
    getBrowserLanguage: vi.fn(() => 'en'),
    getLanguageName: vi.fn((code: string) => code),
    isRTL: ref(false),
    locale: mockCurrentLanguage,
  }
}

// 统一的GitHub API Mock
export const createGitHubApiMock = () => {
  const mockStats = ref({
    stars: 150,
    forks: 25,
    contributors: 8,
    releases: 12,
    lastUpdate: '2025-01-01T00:00:00Z',
    version: 'v1.2.0',
  })
  const mockIsLoading = ref(false)
  const mockError = ref(null)
  const mockFetchStats = vi.fn()
  const mockRefreshStats = vi.fn()

  return {
    stats: mockStats,
    isLoading: mockIsLoading,
    error: mockError,
    fetchStats: mockFetchStats,
    refreshStats: mockRefreshStats,
    repoData: ref(null),
    contributors: ref([]),
    releases: ref([]),
    apiUrl: ref('https://api.github.com/repos/echonote/echonote'),
    cacheKey: ref('github-echonote-echonote'),
    fetchRepository: vi.fn(),
    fetchContributors: vi.fn(),
    fetchReleases: vi.fn(),
    formatDate: vi.fn((date: string) => {
      try {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      } catch {
        return 'Unknown'
      }
    }),
    getLatestRelease: vi.fn(),
    getTopContributors: vi.fn(),
  }
}

// 统一的UI composables Mock
export const createUIMocks = () => ({
  useStaggeredAnimations: () => ({
    containerRef: ref(null),
  }),
  useSmoothScroll: () => ({
    scrollToElement: vi.fn(),
  }),
  useWebPSupport: () => ({
    supportsWebP: ref(false),
    isChecking: ref(false),
    getOptimizedImageSrc: (src: string) => src,
  }),
  useLazyImage: () => ({
    imageRef: ref(null),
    currentSrc: ref(''),
    isLoaded: ref(false),
    isError: ref(false),
    isLoading: ref(true),
  }),
})

// 统一的浏览器API Mock
export const setupBrowserMocks = () => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  }
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

  // Mock clipboard API
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
  })

  // Mock document.execCommand
  document.execCommand = vi.fn().mockReturnValue(true)

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn(function (_callback, _options) {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }
  })

  // Mock fetch
  global.fetch = vi.fn()

  // Mock Prism
  global.Prism = {
    highlight: vi.fn((code: string) => `<span class="token">${code}</span>`),
    highlightElement: vi.fn(),
    languages: {
      javascript: {},
      typescript: {},
      python: {},
      bash: {},
      json: {},
      yaml: {},
      markdown: {},
      css: {},
      scss: {},
      text: {},
    },
  }

  return { mockLocalStorage }
}
