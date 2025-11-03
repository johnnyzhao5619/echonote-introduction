import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setupBrowserMocks } from './mocks'

// 简化的i18n配置，只包含测试必需的翻译
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      nav: { language: 'Language' },
      hero: {
        title: 'EchoNote',
        tagline: 'Smart Voice Transcription & Calendar Management',
        description:
          'Privacy-first desktop application for intelligent voice transcription and seamless calendar integration.',
        downloadButton: 'Download',
        docsButton: 'Documentation',
        githubButton: 'GitHub',
        features: {
          0: 'Privacy First',
          1: 'Local Processing',
          2: 'Smart Transcription',
          3: 'Calendar Integration',
          4: 'Cross Platform',
        },
        stats: {
          stars: 'Stars',
          forks: 'Forks',
          contributors: 'Contributors',
          releases: 'Releases',
        },
      },
      common: {
        loading: 'Loading...',
        error: 'Error',
        retry: 'Retry',
        copy: 'Copy',
        copied: 'Copied!',
      },
    },
  },
})

// 全局测试配置
config.global.plugins = [i18n]

// 设置浏览器API Mock
setupBrowserMocks()
