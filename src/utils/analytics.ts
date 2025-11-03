/**
 * Analytics and user behavior tracking utilities
 * Provides privacy-friendly analytics and user feedback collection
 */

export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  custom_parameters?: Record<string, any>
}

export interface UserSession {
  sessionId: string
  startTime: number
  language: string
  userAgent: string
  referrer: string
  screenResolution: string
  timezone: string
}

export interface PageView {
  page: string
  title: string
  timestamp: number
  sessionId: string
  timeOnPage?: number
}

export interface UserInteraction {
  type: 'click' | 'scroll' | 'form_submit' | 'language_change' | 'download' | 'external_link'
  element: string
  timestamp: number
  sessionId: string
  metadata?: Record<string, any>
}

/**
 * Privacy-friendly analytics manager
 */
class AnalyticsManager {
  private isEnabled = false
  private sessionId = ''
  private startTime = 0
  private interactions: UserInteraction[] = []
  private pageViews: PageView[] = []

  constructor() {
    this.initialize()
  }

  /**
   * Initialize analytics with user consent
   */
  private initialize(): void {
    // Check for user consent (GDPR compliance)
    const consent = this.getAnalyticsConsent()
    if (consent) {
      this.enable()
    }

    // Generate session ID
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()

    // Set up page visibility tracking
    this.setupPageVisibilityTracking()

    // Set up automatic interaction tracking
    this.setupInteractionTracking()
  }

  /**
   * Enable analytics tracking
   */
  enable(): void {
    this.isEnabled = true
    this.setAnalyticsConsent(true)

    // Initialize Google Analytics 4 if available
    this.initializeGA4()

    // Track initial page view
    this.trackPageView(window.location.pathname, document.title)
  }

  /**
   * Disable analytics tracking
   */
  disable(): void {
    this.isEnabled = false
    this.setAnalyticsConsent(false)

    // Clear stored data
    this.clearStoredData()
  }

  /**
   * Track custom event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled) return

    // Send to Google Analytics 4
    this.sendToGA4(event)

    // Store locally for analysis
    this.storeEvent(event)

    // Log in development
    if (import.meta.env.DEV) {
      console.log('Analytics Event:', event)
    }
  }

  /**
   * Track page view
   */
  trackPageView(page: string, title: string): void {
    if (!this.isEnabled) return

    const pageView: PageView = {
      page,
      title,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    }

    this.pageViews.push(pageView)

    // Send to Google Analytics 4
    this.sendPageViewToGA4(pageView)
  }

  /**
   * Track user interaction
   */
  trackInteraction(interaction: Omit<UserInteraction, 'timestamp' | 'sessionId'>): void {
    if (!this.isEnabled) return

    const fullInteraction: UserInteraction = {
      ...interaction,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    }

    this.interactions.push(fullInteraction)

    // Send significant interactions to GA4
    if (this.isSignificantInteraction(interaction.type)) {
      this.trackEvent({
        action: interaction.type,
        category: 'user_interaction',
        label: interaction.element,
        custom_parameters: interaction.metadata,
      })
    }
  }

  /**
   * Track download event
   */
  trackDownload(filename: string, source: string): void {
    this.trackEvent({
      action: 'download',
      category: 'engagement',
      label: filename,
      custom_parameters: { source },
    })
  }

  /**
   * Track external link click
   */
  trackExternalLink(url: string, linkText: string): void {
    this.trackEvent({
      action: 'external_link_click',
      category: 'engagement',
      label: url,
      custom_parameters: { link_text: linkText },
    })
  }

  /**
   * Track language change
   */
  trackLanguageChange(fromLanguage: string, toLanguage: string): void {
    this.trackEvent({
      action: 'language_change',
      category: 'localization',
      label: `${fromLanguage}_to_${toLanguage}`,
      custom_parameters: { from: fromLanguage, to: toLanguage },
    })
  }

  /**
   * Track feedback submission
   */
  trackFeedbackSubmission(type: string, rating?: number): void {
    this.trackEvent({
      action: 'feedback_submitted',
      category: 'feedback',
      label: type,
      value: rating,
      custom_parameters: { feedback_type: type },
    })
  }

  /**
   * Get user session data
   */
  getSessionData(): UserSession {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      language: navigator.language,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): {
    session: UserSession
    pageViews: PageView[]
    interactions: UserInteraction[]
    totalTimeOnSite: number
  } {
    return {
      session: this.getSessionData(),
      pageViews: this.pageViews,
      interactions: this.interactions,
      totalTimeOnSite: Date.now() - this.startTime,
    }
  }

  /**
   * Export analytics data (for debugging or user data requests)
   */
  exportData(): string {
    const data = {
      ...this.getAnalyticsSummary(),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
    return JSON.stringify(data, null, 2)
  }

  // Private methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getAnalyticsConsent(): boolean {
    try {
      return localStorage.getItem('echonote_analytics_consent') === 'true'
    } catch {
      return false
    }
  }

  private setAnalyticsConsent(consent: boolean): void {
    try {
      localStorage.setItem('echonote_analytics_consent', consent.toString())
    } catch {
      // Handle localStorage not available
    }
  }

  private clearStoredData(): void {
    try {
      localStorage.removeItem('echonote_analytics_consent')
      localStorage.removeItem('echonote_analytics_data')
    } catch {
      // Handle localStorage not available
    }
  }

  private initializeGA4(): void {
    // Initialize Google Analytics 4 if gtag is available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag

      gtag('config', 'GA_MEASUREMENT_ID', {
        anonymize_ip: true,
        respect_dnt: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      })
    }
  }

  private sendToGA4(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag

      gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters,
      })
    }
  }

  private sendPageViewToGA4(pageView: PageView): void {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag

      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: pageView.title,
        page_location: window.location.href,
      })
    }
  }

  private storeEvent(event: AnalyticsEvent): void {
    // Store events locally for analysis (optional)
    try {
      const stored = localStorage.getItem('echonote_analytics_data')
      const data = stored ? JSON.parse(stored) : { events: [] }

      data.events.push({
        ...event,
        timestamp: Date.now(),
        sessionId: this.sessionId,
      })

      // Keep only last 100 events to prevent storage bloat
      if (data.events.length > 100) {
        data.events = data.events.slice(-100)
      }

      localStorage.setItem('echonote_analytics_data', JSON.stringify(data))
    } catch {
      // Handle localStorage not available
    }
  }

  private isSignificantInteraction(type: string): boolean {
    return ['form_submit', 'download', 'external_link', 'language_change'].includes(type)
  }

  private setupPageVisibilityTracking(): void {
    let pageStartTime = Date.now()

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page became hidden - record time on page
        const timeOnPage = Date.now() - pageStartTime
        const lastPageView = this.pageViews[this.pageViews.length - 1]
        if (lastPageView) {
          lastPageView.timeOnPage = timeOnPage
        }
      } else {
        // Page became visible - reset timer
        pageStartTime = Date.now()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Track page unload
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - pageStartTime
      const lastPageView = this.pageViews[this.pageViews.length - 1]
      if (lastPageView) {
        lastPageView.timeOnPage = timeOnPage
      }
    })
  }

  private setupInteractionTracking(): void {
    // Track clicks on important elements
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement

      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button')!
        this.trackInteraction({
          type: 'click',
          element: `button:${button.textContent?.trim() || 'unknown'}`,
          metadata: { tag: 'button' },
        })
      }

      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? (target as HTMLAnchorElement) : target.closest('a')!
        const isExternal = link.hostname !== window.location.hostname

        if (isExternal) {
          this.trackExternalLink(link.href, link.textContent?.trim() || 'unknown')
        }

        this.trackInteraction({
          type: 'click',
          element: `link:${link.textContent?.trim() || link.href}`,
          metadata: {
            tag: 'link',
            href: link.href,
            external: isExternal,
          },
        })
      }
    })

    // Track scroll depth
    let maxScrollDepth = 0
    const trackScrollDepth = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )

      if (scrollDepth > maxScrollDepth && scrollDepth % 25 === 0) {
        maxScrollDepth = scrollDepth
        this.trackInteraction({
          type: 'scroll',
          element: `scroll_depth_${scrollDepth}`,
          metadata: { scroll_depth: scrollDepth },
        })
      }
    }

    window.addEventListener('scroll', trackScrollDepth, { passive: true })
  }
}

// Create singleton instance
export const analytics = new AnalyticsManager()

// Convenience functions
export const trackEvent = (event: AnalyticsEvent) => analytics.trackEvent(event)
export const trackPageView = (page: string, title: string) => analytics.trackPageView(page, title)
export const trackInteraction = (interaction: Omit<UserInteraction, 'timestamp' | 'sessionId'>) =>
  analytics.trackInteraction(interaction)
export const trackDownload = (filename: string, source: string) =>
  analytics.trackDownload(filename, source)
export const trackExternalLink = (url: string, linkText: string) =>
  analytics.trackExternalLink(url, linkText)
export const trackLanguageChange = (from: string, to: string) =>
  analytics.trackLanguageChange(from, to)
export const trackFeedbackSubmission = (type: string, rating?: number) =>
  analytics.trackFeedbackSubmission(type, rating)

// Analytics consent management
export const enableAnalytics = () => analytics.enable()
export const disableAnalytics = () => analytics.disable()
export const getAnalyticsSummary = () => analytics.getAnalyticsSummary()
export const exportAnalyticsData = () => analytics.exportData()

export default analytics
