export const APP_CONFIG = {
  // Application metadata
  name: 'EchoNote Introduction',
  version: '1.2.0',
  description: 'EchoNote 项目介绍页面 - 智能语音转录和日历管理桌面应用程序',

  // GitHub configuration
  github: {
    repository: 'johnnyzhao5619/EchoNote',
    apiUrl: 'https://api.github.com',
    cacheTimeout: 10 * 60 * 1000, // 10 minutes
    rateLimit: {
      delay: 1000, // 1 second between requests
      maxRetries: 3,
    },
  },

  // Image optimization
  images: {
    formats: ['webp', 'avif', 'jpeg'] as const,
    sizes: [320, 640, 768, 1024, 1280, 1920] as const,
    quality: 85,
    contexts: {
      hero: {
        aspectRatio: '16:9',
        maxWidth: 1920,
        sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px',
        priority: true,
      },
      feature: {
        aspectRatio: '4:3',
        maxWidth: 800,
        sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px',
        priority: false,
      },
      screenshot: {
        aspectRatio: '16:10',
        maxWidth: 1200,
        sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 800px',
        priority: false,
      },
      social: {
        aspectRatio: '1.91:1',
        maxWidth: 1200,
        sizes: '1200px',
        priority: false,
      },
      icon: {
        aspectRatio: '1:1',
        maxWidth: 512,
        sizes: '(max-width: 768px) 32px, 48px',
        priority: false,
      },
    } as const,
  },

  // Translation configuration
  translation: {
    fallbackLocale: 'en',
    supportedLocales: ['en', 'zh-CN', 'zh-TW', 'fr'] as const,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    validation: {
      enableInDev: true,
      enableInProd: false,
      reportThreshold: 95, // Minimum completeness percentage
    },
  },

  // Performance thresholds
  performance: {
    imageLoadTimeout: 10000, // 10 seconds
    apiTimeout: 5000, // 5 seconds
    cacheSize: 50, // Maximum cached items
  },

  // Feature flags
  features: {
    translationValidator: true,
    performanceMonitoring: true,
    feedbackCollection: true,
    communityDashboard: true,
  },
} as const

// Type exports for better type safety
export type ImageContext = keyof typeof APP_CONFIG.images.contexts
export type SupportedLocale = (typeof APP_CONFIG.translation.supportedLocales)[number]
export type ImageFormat = (typeof APP_CONFIG.images.formats)[number]

// Environment-specific overrides
export const getConfig = () => {
  const isDev = import.meta.env.DEV
  const _isProd = import.meta.env.PROD

  return {
    ...APP_CONFIG,
    translation: {
      ...APP_CONFIG.translation,
      validation: {
        ...APP_CONFIG.translation.validation,
        enableInDev: isDev,
        enableInProd: false, // Always false in production for performance
      },
    },
    features: {
      ...APP_CONFIG.features,
      translationValidator: isDev, // Only in development
      performanceMonitoring: true, // Always enabled
    },
  }
}

export default APP_CONFIG
