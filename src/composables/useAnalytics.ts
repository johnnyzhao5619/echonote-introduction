import { ref, computed } from 'vue'
import { APP_CONFIG } from '@/config/app'

/**
 * 增强的分析系统
 * 基于配置和用户隐私偏好决定是否启用，支持多种分析服务
 */
export function useAnalytics() {
  const isEnabled = ref(APP_CONFIG.services.analytics.enabled)
  const userConsent = ref<boolean | null>(null)

  // 检查 Do Not Track
  const isDNTEnabled = () => {
    return (
      navigator.doNotTrack === '1' ||
      (window as unknown as { doNotTrack?: string }).doNotTrack === '1' ||
      (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack === '1'
    )
  }

  // 检查用户是否同意分析
  const hasUserConsent = computed(() => {
    if (userConsent.value !== null) return userConsent.value

    // 检查本地存储中的用户偏好
    try {
      const stored = localStorage.getItem('echonote-analytics-consent')
      return stored === 'true'
    } catch {
      return false
    }
  })

  // 检查是否应该启用分析
  const shouldTrack = computed(() => {
    if (!isEnabled.value) return false
    if (APP_CONFIG.services.analytics.respectDNT && isDNTEnabled()) return false
    return hasUserConsent.value
  })

  // 设置用户同意状态
  const setUserConsent = (consent: boolean) => {
    userConsent.value = consent
    try {
      localStorage.setItem('echonote-analytics-consent', consent.toString())
    } catch (error) {
      console.warn('Failed to save analytics consent:', error)
    }
  }

  // 获取会话信息
  const getSessionInfo = () => {
    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }

  // 增强的事件跟踪
  const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
    if (!shouldTrack.value) return

    const eventData = {
      event: eventName,
      properties: {
        ...properties,
        session: getSessionInfo(),
      },
    }

    // 开发模式下输出到控制台
    if (APP_CONFIG.dev.showDevtools) {
      console.log('Analytics Event:', eventData)
    }

    // 生产环境中的实际分析服务集成
    if (
      APP_CONFIG.services.analytics.provider !== 'none' &&
      typeof (window as any).gtag !== 'undefined'
    ) {
      ;(window as any).gtag('event', eventName, properties)
    }

    // 可以添加其他分析服务
    // if (APP_CONFIG.services.analytics.provider === 'plausible') {
    //   plausible(eventName, { props: properties })
    // }
  }

  // 页面浏览跟踪
  const trackPageView = (path?: string) => {
    const pagePath = path || window.location.pathname
    trackEvent('page_view', {
      page_path: pagePath,
      page_title: document.title,
    })
  }

  // 下载跟踪
  const trackDownload = (fileName: string, platform?: string) => {
    trackEvent('download', {
      file_name: fileName,
      platform: platform || 'unknown',
      download_source: 'website',
    })
  }

  // 语言切换跟踪
  const trackLanguageChange = (fromLanguage: string, toLanguage: string) => {
    trackEvent('language_change', {
      from_language: fromLanguage,
      to_language: toLanguage,
    })
  }

  // 用户交互跟踪
  const trackInteraction = (element: string, action: string, value?: string | number) => {
    trackEvent('user_interaction', {
      element,
      action,
      value,
    })
  }

  // 性能跟踪
  const trackPerformance = (metric: string, value: number, unit = 'ms') => {
    trackEvent('performance', {
      metric,
      value,
      unit,
    })
  }

  // 错误跟踪
  const trackError = (error: Error, context?: string) => {
    trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
    })
  }

  // 反馈跟踪
  const trackFeedback = (type: string, rating?: number) => {
    trackEvent('feedback_submitted', {
      feedback_type: type,
      rating,
    })
  }

  // 搜索跟踪
  const trackSearch = (query: string, results?: number) => {
    trackEvent('search', {
      search_query: query,
      results_count: results,
    })
  }

  // 社交分享跟踪
  const trackShare = (platform: string, content?: string) => {
    trackEvent('social_share', {
      platform,
      content_type: content,
    })
  }

  // 外部链接点击跟踪
  const trackExternalLink = (url: string, linkText?: string) => {
    trackEvent('external_link_click', {
      destination_url: url,
      link_text: linkText,
    })
  }

  // 初始化分析系统
  const initializeAnalytics = () => {
    if (!shouldTrack.value) return

    // 跟踪页面加载性能
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming
          if (navigation) {
            trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart)
            trackPerformance(
              'dom_content_loaded',
              navigation.domContentLoadedEventEnd - navigation.fetchStart
            )
            trackPerformance('first_paint', navigation.responseEnd - navigation.fetchStart)
          }
        }, 0)
      })
    }

    // 跟踪页面可见性变化
    document.addEventListener('visibilitychange', () => {
      trackEvent('page_visibility_change', {
        visibility_state: document.visibilityState,
      })
    })

    // 跟踪页面卸载
    window.addEventListener('beforeunload', () => {
      trackEvent('page_unload')
    })
  }

  return {
    isEnabled,
    hasUserConsent,
    shouldTrack,
    isDNTEnabled: isDNTEnabled(),
    setUserConsent,
    trackEvent,
    trackPageView,
    trackDownload,
    trackLanguageChange,
    trackInteraction,
    trackPerformance,
    trackError,
    trackFeedback,
    trackSearch,
    trackShare,
    trackExternalLink,
    initializeAnalytics,
  }
}
