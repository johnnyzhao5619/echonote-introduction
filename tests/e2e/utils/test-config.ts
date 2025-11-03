/**
 * 统一的测试配置管理
 * 遵循DRY原则，集中管理所有测试参数
 */

export const TEST_CONFIG = {
  // 性能阈值配置
  performance: {
    // 开发环境阈值（更宽松）
    development: {
      firstContentfulPaint: 3000,
      largestContentfulPaint: 4000,
      domContentLoaded: 3000,
      firstByte: 1000,
      jsBundle: 1024 * 1024, // 1MB
      cssBundle: 500 * 1024, // 500KB
      imageSize: 1024 * 1024, // 1MB per image
    },
    // 生产环境阈值（严格）
    production: {
      firstContentfulPaint: 1800,
      largestContentfulPaint: 2500,
      domContentLoaded: 2000,
      firstByte: 800,
      jsBundle: 500 * 1024, // 500KB
      cssBundle: 100 * 1024, // 100KB
      imageSize: 500 * 1024, // 500KB per image
    },
  },

  // 响应式断点
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1024, height: 768 },
    large: { width: 1920, height: 1080 },
  },

  // 测试选择器
  selectors: {
    navigation: 'nav',
    main: 'main',
    languageSwitcher: '[data-testid="language-switcher"]',
    languageOption: '[data-testid="language-option"]',
    sections: {
      hero: '[data-testid="hero-section"]',
      features: '[data-testid="features-section"]',
      quickstart: '[data-testid="quickstart-section"]',
      technical: '[data-testid="technical-section"]',
      community: '[data-testid="community-section"]',
    },
  },

  // 可访问性配置
  accessibility: {
    minTouchTarget: 24, // 最小触摸目标尺寸 (px)
    minFontSize: 12, // 最小字体大小 (px)
    contrastRatio: 4.5, // WCAG AA 对比度要求
  },

  // 可访问性常量（向后兼容）
  ACCESSIBILITY: {
    MIN_HEADING_LENGTH: 3,
  },

  // SEO配置
  SEO: {
    TITLE: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 60,
    },
    DESCRIPTION: {
      MIN_LENGTH: 50,
      MAX_LENGTH: 160,
    },
    HEADING: {
      MIN_LENGTH: 5,
      MAX_LENGTH: 100,
    },
  },

  // 支持的语言
  languages: ['zh-CN', 'zh-TW', 'en', 'fr'],

  // 浏览器配置
  browsers: ['chromium', 'firefox', 'webkit'],

  // 超时配置
  timeouts: {
    default: 30000,
    navigation: 10000,
    interaction: 5000,
  },
} as const

export type TestConfig = typeof TEST_CONFIG
