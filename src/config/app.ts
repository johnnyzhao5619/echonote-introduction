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
      get fullRepo() {
        return `${this.owner}/${this.repo}`
      },
      get fullIntroRepo() {
        return `${this.owner}/${this.introRepo}`
      },
      get apiBase() {
        return 'https://api.github.com'
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
      supportedLocales: ['en', 'zh-CN', 'zh-TW', 'fr'],
      fallbackLocale: 'en',
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

    // 性能指标
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
