/**
 * 应用程序统一配置
 * 所有配置都应该从这里获取，避免硬编码
 */

// 从环境变量或默认值获取配置
const getConfig = () => {
  const isDev = import.meta.env.DEV
  const isProd = import.meta.env.PROD

  return {
    // 项目基本信息
    app: {
      name: 'EchoNote',
      version: '1.2.0',
      description:
        'Smart voice transcription and calendar management desktop application with privacy-first approach',
      license: 'Apache-2.0',
    },

    // GitHub 仓库配置 - 统一管理所有仓库相关配置
    github: {
      owner: 'johnnyzhao5619',
      repo: 'echonote',
      introRepo: 'echonote-introduction',
      cacheTimeout: 10 * 60 * 1000, // 10 minutes
      rateLimit: {
        delay: 1000,
        maxRetries: 3,
      },
      get fullRepo() {
        return `${this.owner}/${this.repo}`
      },
      get fullIntroRepo() {
        return `${this.owner}/${this.introRepo}`
      },
      get repository() {
        return this.fullRepo
      },
      get introRepository() {
        return this.fullIntroRepo
      },
      get apiBase() {
        return 'https://api.github.com'
      },
      get apiUrl() {
        return this.apiBase
      },
      get repoUrl() {
        return `https://github.com/${this.fullRepo}`
      },
      get introRepoUrl() {
        return `https://github.com/${this.fullIntroRepo}`
      },
      get releasesUrl() {
        return `${this.repoUrl}/releases`
      },
      get latestReleaseUrl() {
        return `${this.releasesUrl}/latest`
      },
    },

    // 部署配置
    deployment: {
      get baseUrl() {
        return isProd
          ? 'https://johnnyzhao5619.github.io/echonote-introduction'
          : 'http://localhost:5173'
      },
      get basePath() {
        return isProd ? '/echonote-introduction/' : '/'
      },
    },

    // 支持的语言
    i18n: {
      defaultLocale: 'en',
      supportedLocales: ['en', 'zh-CN', 'zh-TW', 'fr'] as const,
      fallbackLocale: 'en',
    },

    // 图像优化配置
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

    // 下载链接 - 使用动态生成避免硬编码
    get downloads() {
      const baseDownloadUrl = `https://github.com/${this.github.fullRepo}/releases/latest/download`
      return {
        windows: `${baseDownloadUrl}/echonote-windows-x64.exe`,
        macos: `${baseDownloadUrl}/echonote-macos.dmg`,
        linux: `${baseDownloadUrl}/echonote-linux-x64.deb`,
      }
    },

    // 系统要求
    systemRequirements: {
      windows: {
        os: 'Windows 10 (64-bit) or later',
        memory: '4 GB RAM (8 GB recommended)',
        storage: '500 MB available space',
        audio: 'Microphone for voice input',
        additional: 'Microsoft Visual C++ Redistributable',
      },
      macos: {
        os: 'macOS 10.14 (Mojave) or later',
        memory: '4 GB RAM (8 GB recommended)',
        storage: '500 MB available space',
        audio: 'Microphone for voice input',
        additional: 'No additional requirements',
      },
      linux: {
        os: 'Ubuntu 18.04+ / Debian 10+ / Fedora 32+',
        memory: '4 GB RAM (8 GB recommended)',
        storage: '500 MB available space',
        audio: 'Microphone for voice input (ALSA/PulseAudio)',
        additional: 'Python 3.8+ runtime (usually pre-installed)',
      },
    },

    // 社区统计数据
    communityStats: {
      totalDownloads: '50K+',
      languagesSupported: '99+',
      issuesResolved: '200+',
      documentationPages: '25+',
      socialFollowers: {
        twitter: '1.2K',
        discord: '500+',
        reddit: '800+',
      },
    },

    // 性能指标与阈值
    performance: {
      speechRecognition: {
        realTimeFactor: '< 0.3x',
        accuracy: '95%+',
        latency: '< 500ms',
        languages: '99+',
      },
      application: {
        startupTime: '< 3s',
        memoryUsage: '< 200MB',
        cpuUsage: '< 15%',
        storage: '< 500MB',
      },
      dataProcessing: {
        eventExtraction: '90%+',
        processingSpeed: '1000+ WPM',
        batchSize: '10MB+',
        concurrentTasks: '5+',
      },
      thresholds: {
        imageLoadTimeout: 10000,
        apiTimeout: 5000,
        cacheSize: 50,
      },
    },

    // 翻译配置
    translation: {
      fallbackLocale: 'en',
      supportedLocales: ['en', 'zh-CN', 'zh-TW', 'fr'] as const,
      cacheTimeout: 5 * 60 * 1000,
      validation: {
        enableInDev: isDev,
        enableInProd: false,
        reportThreshold: 95,
      },
    },

    // 外部链接 - 使用内部引用避免循环依赖
    get links() {
      const baseRepoUrl = `https://github.com/${this.github.fullRepo}`
      return {
        releases: `${baseRepoUrl}/releases`,
        wiki: `${baseRepoUrl}/wiki`,
        contributing: `${baseRepoUrl}/blob/main/CONTRIBUTING.md`,
        issues: `${baseRepoUrl}/issues`,
        discussions: `${baseRepoUrl}/discussions`,
        social: {
          twitter: 'https://twitter.com/echonote_dev',
          discord: 'https://discord.gg/echonote',
          reddit: 'https://reddit.com/r/echonote',
        },
        support: {
          email: 'mailto:support@echonote.dev',
          troubleshooting: `${baseRepoUrl}/wiki/Installation-Troubleshooting`,
          audioSetup: `${baseRepoUrl}/wiki/Audio-Setup`,
          performance: `${baseRepoUrl}/wiki/Performance-Tips`,
          faq: `${baseRepoUrl}/wiki/FAQ`,
        },
      }
    },

    // 外部服务配置
    services: {
      analytics: {
        enabled: isProd,
        provider: 'none', // 'google' | 'plausible' | 'none'
        respectDNT: true,
        anonymizeIP: true,
      },
      monitoring: {
        enabled: isProd,
        performanceTracking: true,
        errorTracking: true,
      },
    },

    // 功能开关
    features: {
      serviceWorker: isProd,
      performanceMonitoring: isProd,
      feedbackSystem: true,
      versionSync: true,
      translationValidator: isDev,
      feedbackCollection: true,
      communityDashboard: true,
    },

    // 开发配置
    dev: {
      showDevtools: isDev,
      enableHMR: isDev,
      sourceMap: isDev,
    },
  } as const
}

export const APP_CONFIG = getConfig()

// 导出类型
export type AppConfig = typeof APP_CONFIG
export type ImageContext = keyof AppConfig['images']['contexts']
export type SupportedLocale = AppConfig['translation']['supportedLocales'][number]
export type ImageFormat = AppConfig['images']['formats'][number]
