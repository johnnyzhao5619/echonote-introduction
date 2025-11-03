import { ref, computed, reactive } from 'vue'
import { useAnalytics } from './useAnalytics'
import { useFeedback } from './useFeedback'
import { APP_CONFIG as _APP_CONFIG } from '@/config/app'

interface UserActivity {
  pageViews: number
  timeSpent: number // in seconds
  downloadsInitiated: number
  linksClicked: number
  feedbackSubmitted: number
  socialShares: number
  lastVisit: string
  firstVisit: string
  visitCount: number
  preferredLanguage: string
}

interface CommunityInsights {
  totalUsers: number
  activeUsers: number
  topFeatures: string[]
  commonIssues: string[]
  popularDownloads: Record<string, number>
  languageDistribution: Record<string, number>
}

/**
 * 社区建设和用户参与度管理
 * 跟踪用户行为，提供个性化体验，促进社区参与
 */
export function useCommunity() {
  const { trackEvent, trackInteraction } = useAnalytics()
  const { communityMetrics: _communityMetrics, userEngagementScore } = useFeedback()

  // 用户活动数据
  const userActivity = reactive<UserActivity>({
    pageViews: 0,
    timeSpent: 0,
    downloadsInitiated: 0,
    linksClicked: 0,
    feedbackSubmitted: 0,
    socialShares: 0,
    lastVisit: new Date().toISOString(),
    firstVisit: new Date().toISOString(),
    visitCount: 1,
    preferredLanguage: navigator.language,
  })

  // 会话开始时间
  const sessionStartTime = ref(Date.now())
  const isNewUser = ref(true)
  const userSegment = ref<'new' | 'returning' | 'engaged' | 'champion'>('new')

  // 社区洞察数据（模拟数据，实际应用中从API获取）
  const communityInsights = reactive<CommunityInsights>({
    totalUsers: 12500,
    activeUsers: 3200,
    topFeatures: [
      'Privacy Protection',
      'Local Processing',
      'Calendar Integration',
      'Cross-platform',
    ],
    commonIssues: ['Installation Help', 'Audio Setup', 'Performance Tips', 'Language Support'],
    popularDownloads: {
      windows: 8500,
      macos: 2800,
      linux: 1200,
    },
    languageDistribution: {
      en: 45,
      'zh-CN': 25,
      'zh-TW': 12,
      fr: 8,
      other: 10,
    },
  })

  // 计算用户参与度等级
  const engagementLevel = computed(() => {
    const activity = userActivity
    const score =
      activity.pageViews * 2 +
      Math.min(activity.timeSpent / 60, 30) * 3 + // 最多30分钟
      activity.downloadsInitiated * 20 +
      activity.linksClicked * 5 +
      activity.feedbackSubmitted * 25 +
      activity.socialShares * 15

    if (score >= 200) return 'champion'
    if (score >= 100) return 'engaged'
    if (score >= 30) return 'returning'
    return 'new'
  })

  // 获取个性化推荐
  const getPersonalizedRecommendations = computed(() => {
    const recommendations = []
    const level = engagementLevel.value

    if (level === 'new') {
      recommendations.push({
        type: 'getting-started',
        title: 'Get Started with EchoNote',
        description: 'Learn the basics and set up your first transcription',
        action: 'View Quick Start Guide',
        priority: 'high',
      })
    }

    if (userActivity.downloadsInitiated === 0) {
      recommendations.push({
        type: 'download',
        title: 'Try EchoNote Today',
        description: 'Download and experience privacy-first voice transcription',
        action: 'Download Now',
        priority: 'high',
      })
    }

    if (userActivity.feedbackSubmitted === 0 && level !== 'new') {
      recommendations.push({
        type: 'feedback',
        title: 'Share Your Experience',
        description: 'Help us improve EchoNote with your valuable feedback',
        action: 'Send Feedback',
        priority: 'medium',
      })
    }

    if (level === 'engaged' || level === 'champion') {
      recommendations.push({
        type: 'contribute',
        title: 'Join Our Community',
        description: 'Contribute to EchoNote development and help other users',
        action: 'Start Contributing',
        priority: 'medium',
      })
    }

    return recommendations
  })

  // 获取用户状态徽章
  const getUserBadges = computed(() => {
    const badges = []
    const activity = userActivity

    if (activity.visitCount >= 10) {
      badges.push({ name: 'Regular Visitor', icon: '🏆', description: 'Visited 10+ times' })
    }

    if (activity.feedbackSubmitted >= 3) {
      badges.push({ name: 'Feedback Champion', icon: '💬', description: 'Submitted 3+ feedback' })
    }

    if (activity.socialShares >= 5) {
      badges.push({ name: 'Community Advocate', icon: '📢', description: 'Shared 5+ times' })
    }

    if (activity.downloadsInitiated >= 1) {
      badges.push({ name: 'Early Adopter', icon: '🚀', description: 'Downloaded EchoNote' })
    }

    if (activity.timeSpent >= 1800) {
      // 30 minutes
      badges.push({ name: 'Explorer', icon: '🔍', description: 'Spent 30+ minutes exploring' })
    }

    return badges
  })

  // 跟踪页面浏览
  const trackPageView = (page: string) => {
    userActivity.pageViews++
    trackEvent('community_page_view', { page, engagement_level: engagementLevel.value })
    saveUserActivity()
  }

  // 跟踪用户交互
  const trackUserInteraction = (element: string, action: string) => {
    userActivity.linksClicked++
    trackInteraction(element, action)
    saveUserActivity()
  }

  // 跟踪下载行为
  const trackDownloadAction = (platform: string) => {
    userActivity.downloadsInitiated++
    trackEvent('community_download', { platform, engagement_level: engagementLevel.value })
    saveUserActivity()
  }

  // 跟踪社交分享
  const trackSocialShare = (platform: string) => {
    userActivity.socialShares++
    trackEvent('community_social_share', { platform, engagement_level: engagementLevel.value })
    saveUserActivity()
  }

  // 跟踪反馈提交
  const trackFeedbackSubmission = (type: string) => {
    userActivity.feedbackSubmitted++
    trackEvent('community_feedback', { type, engagement_level: engagementLevel.value })
    saveUserActivity()
  }

  // 计算会话时长
  const updateSessionTime = () => {
    userActivity.timeSpent = Math.floor((Date.now() - sessionStartTime.value) / 1000)
    saveUserActivity()
  }

  // 保存用户活动数据
  const saveUserActivity = () => {
    try {
      const data = {
        ...userActivity,
        lastVisit: new Date().toISOString(),
      }
      localStorage.setItem('echonote-user-activity', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save user activity:', error)
    }
  }

  // 加载用户活动数据
  const loadUserActivity = () => {
    try {
      const stored = localStorage.getItem('echonote-user-activity')
      if (stored) {
        const data = JSON.parse(stored)
        Object.assign(userActivity, data)

        // 检查是否是新用户
        const lastVisit = new Date(data.lastVisit)
        const now = new Date()
        const daysSinceLastVisit = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)

        isNewUser.value = daysSinceLastVisit > 30 || !data.firstVisit

        if (!isNewUser.value) {
          userActivity.visitCount++
        }
      }
    } catch (error) {
      console.warn('Failed to load user activity:', error)
    }
  }

  // 获取社区统计数据
  const getCommunityStats = () => {
    return {
      totalUsers: communityInsights.totalUsers,
      activeUsers: communityInsights.activeUsers,
      userEngagement: userEngagementScore.value,
      personalLevel: engagementLevel.value,
    }
  }

  // 获取热门内容推荐
  const getPopularContent = () => {
    return {
      features: communityInsights.topFeatures,
      downloads: communityInsights.popularDownloads,
      helpTopics: communityInsights.commonIssues,
    }
  }

  // 获取语言使用统计
  const getLanguageStats = () => {
    return communityInsights.languageDistribution
  }

  // 初始化社区数据
  const initializeCommunity = () => {
    loadUserActivity()

    // 设置定期更新会话时长
    const sessionTimer = setInterval(updateSessionTime, 30000) // 每30秒更新一次

    // 页面卸载时保存数据
    window.addEventListener('beforeunload', () => {
      updateSessionTime()
      clearInterval(sessionTimer)
    })

    // 页面可见性变化时更新数据
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        updateSessionTime()
      }
    })
  }

  // 重置用户数据（用于测试或隐私清理）
  const resetUserData = () => {
    Object.assign(userActivity, {
      pageViews: 0,
      timeSpent: 0,
      downloadsInitiated: 0,
      linksClicked: 0,
      feedbackSubmitted: 0,
      socialShares: 0,
      lastVisit: new Date().toISOString(),
      firstVisit: new Date().toISOString(),
      visitCount: 1,
      preferredLanguage: navigator.language,
    })

    try {
      localStorage.removeItem('echonote-user-activity')
      localStorage.removeItem('echonote-community-metrics')
    } catch (error) {
      console.warn('Failed to clear user data:', error)
    }
  }

  return {
    // 状态
    userActivity: computed(() => userActivity),
    isNewUser,
    userSegment,
    engagementLevel,
    communityInsights: computed(() => communityInsights),

    // 计算属性
    personalizedRecommendations: getPersonalizedRecommendations,
    userBadges: getUserBadges,

    // 跟踪方法
    trackPageView,
    trackUserInteraction,
    trackDownloadAction,
    trackSocialShare,
    trackFeedbackSubmission,
    updateSessionTime,

    // 数据方法
    getCommunityStats,
    getPopularContent,
    getLanguageStats,
    saveUserActivity,
    loadUserActivity,

    // 管理方法
    initializeCommunity,
    resetUserData,
  }
}
