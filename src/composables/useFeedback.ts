import { ref, computed } from 'vue'
import { APP_CONFIG } from '@/config/app'
import { useAnalytics } from './useAnalytics'

interface FeedbackData {
  type: 'bug' | 'feature' | 'general' | 'translation'
  rating?: number
  message: string
  contact?: string
  metadata: {
    timestamp: string
    url: string
    userAgent: string
    language: string
    viewport: {
      width: number
      height: number
    }
  }
}

interface CommunityMetrics {
  feedbackSubmitted: number
  issuesCreated: number
  discussionsParticipated: number
  socialShares: number
}

/**
 * 增强的反馈和社区建设系统
 * 支持多种反馈渠道和社区参与跟踪
 */
export function useFeedback() {
  const { trackFeedback, trackExternalLink, trackInteraction: _trackInteraction } = useAnalytics()

  const isSubmitting = ref(false)
  const lastSubmissionTime = ref<number | null>(null)
  const communityMetrics = ref<CommunityMetrics>({
    feedbackSubmitted: 0,
    issuesCreated: 0,
    discussionsParticipated: 0,
    socialShares: 0,
  })

  // 防止重复提交的冷却时间（毫秒）
  const SUBMISSION_COOLDOWN = 30000 // 30秒

  // 检查是否可以提交
  const canSubmit = computed(() => {
    if (isSubmitting.value) return false
    if (!lastSubmissionTime.value) return true
    return Date.now() - lastSubmissionTime.value > SUBMISSION_COOLDOWN
  })

  // 获取系统信息
  const getSystemInfo = () => {
    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: screen.width,
        height: screen.height,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }

  // 创建 GitHub Issue
  const createGitHubIssue = (
    type: 'bug' | 'feature' | 'general' | 'translation' = 'general',
    data?: Partial<FeedbackData>
  ) => {
    const issueUrl = new URL(`${APP_CONFIG.github.introRepoUrl}/issues/new`)
    const systemInfo = getSystemInfo()

    // 根据类型设置标签和模板
    const labels: string[] = [type]
    if (type === 'translation') labels.push('i18n')
    if (type === 'bug') labels.push('needs-triage')

    issueUrl.searchParams.set('labels', labels.join(','))

    // 生成详细的系统信息
    const systemInfoText = `
**System Information:**
- Browser: ${systemInfo.userAgent}
- Language: ${systemInfo.language}
- Viewport: ${systemInfo.viewport.width}x${systemInfo.viewport.height}
- Screen: ${systemInfo.screen.width}x${systemInfo.screen.height}
- Timezone: ${systemInfo.timezone}
- URL: ${systemInfo.url}
- Timestamp: ${systemInfo.timestamp}
    `.trim()

    if (type === 'bug') {
      issueUrl.searchParams.set('title', '[Bug Report] ')
      issueUrl.searchParams.set(
        'body',
        `
**Bug Description:**
${data?.message || ''}

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**


**Actual Behavior:**


**Additional Context:**


${systemInfoText}
      `.trim()
      )
    } else if (type === 'feature') {
      issueUrl.searchParams.set('title', '[Feature Request] ')
      issueUrl.searchParams.set(
        'body',
        `
**Feature Description:**
${data?.message || ''}

**Use Case:**


**Proposed Solution:**


**Alternatives Considered:**


**Additional Context:**


${systemInfoText}
      `.trim()
      )
    } else if (type === 'translation') {
      issueUrl.searchParams.set('title', '[Translation Issue] ')
      issueUrl.searchParams.set(
        'body',
        `
**Translation Issue:**
${data?.message || ''}

**Language:** ${systemInfo.language}

**Current Text:**


**Suggested Translation:**


**Context/Location:**


${systemInfoText}
      `.trim()
      )
    } else {
      issueUrl.searchParams.set('title', '[General Feedback] ')
      issueUrl.searchParams.set(
        'body',
        `
**Feedback:**
${data?.message || ''}

**Rating:** ${data?.rating ? '⭐'.repeat(data.rating) : 'Not provided'}

**Contact:** ${data?.contact || 'Not provided'}

${systemInfoText}
      `.trim()
      )
    }

    // 跟踪分析
    trackExternalLink(issueUrl.toString(), `GitHub Issue - ${type}`)
    trackFeedback(type, data?.rating)

    // 更新社区指标
    communityMetrics.value.issuesCreated++
    saveCommunityMetrics()

    window.open(issueUrl.toString(), '_blank')
  }

  // 提交反馈到 GitHub Discussions
  const createDiscussion = (
    category: 'general' | 'ideas' | 'q-and-a' | 'show-and-tell' = 'general'
  ) => {
    const discussionUrl = `${APP_CONFIG.github.introRepoUrl}/discussions/new?category=${category}`

    trackExternalLink(discussionUrl, `GitHub Discussion - ${category}`)
    communityMetrics.value.discussionsParticipated++
    saveCommunityMetrics()

    window.open(discussionUrl, '_blank')
  }

  // 发送邮件反馈
  const sendEmailFeedback = (subject = 'EchoNote Feedback', body = '') => {
    const emailUrl = `mailto:${APP_CONFIG.links.support.email.replace('mailto:', '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    trackExternalLink(emailUrl, 'Email Feedback')
    window.location.href = emailUrl
  }

  // 社交媒体分享
  const shareOnSocial = (
    platform: 'twitter' | 'facebook' | 'linkedin' | 'reddit',
    message?: string
  ) => {
    const baseUrl = APP_CONFIG.deployment.baseUrl
    const defaultMessage = `Check out EchoNote - Smart voice transcription & calendar management with privacy-first approach! ${baseUrl}`
    const shareMessage = message || defaultMessage

    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(baseUrl)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`
        break
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(baseUrl)}&title=${encodeURIComponent('EchoNote - Smart Voice Transcription & Calendar Management')}`
        break
    }

    if (shareUrl) {
      trackExternalLink(shareUrl, `Social Share - ${platform}`)
      communityMetrics.value.socialShares++
      saveCommunityMetrics()
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  // 加入社区渠道
  const joinCommunity = (channel: 'discord' | 'reddit' | 'twitter') => {
    let url = ''

    switch (channel) {
      case 'discord':
        url = APP_CONFIG.links.social.discord
        break
      case 'reddit':
        url = APP_CONFIG.links.social.reddit
        break
      case 'twitter':
        url = APP_CONFIG.links.social.twitter
        break
    }

    if (url) {
      trackExternalLink(url, `Join Community - ${channel}`)
      window.open(url, '_blank')
    }
  }

  // 提交结构化反馈
  const submitStructuredFeedback = async (feedbackData: FeedbackData): Promise<boolean> => {
    if (!canSubmit.value) {
      throw new Error('Please wait before submitting another feedback')
    }

    isSubmitting.value = true
    lastSubmissionTime.value = Date.now()

    try {
      // 在实际应用中，这里会发送到后端API
      // 现在我们模拟提交过程并创建GitHub Issue

      await new Promise(resolve => setTimeout(resolve, 1500)) // 模拟网络延迟

      // 创建 GitHub Issue 作为备选方案
      createGitHubIssue(feedbackData.type, feedbackData)

      // 跟踪反馈提交
      trackFeedback(feedbackData.type, feedbackData.rating)

      // 更新社区指标
      communityMetrics.value.feedbackSubmitted++
      saveCommunityMetrics()

      return true
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  // 保存社区指标到本地存储
  const saveCommunityMetrics = () => {
    try {
      localStorage.setItem('echonote-community-metrics', JSON.stringify(communityMetrics.value))
    } catch (error) {
      console.warn('Failed to save community metrics:', error)
    }
  }

  // 加载社区指标
  const loadCommunityMetrics = () => {
    try {
      const stored = localStorage.getItem('echonote-community-metrics')
      if (stored) {
        communityMetrics.value = { ...communityMetrics.value, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.warn('Failed to load community metrics:', error)
    }
  }

  // 获取用户参与度评分
  const getUserEngagementScore = computed(() => {
    const metrics = communityMetrics.value
    const score =
      metrics.feedbackSubmitted * 10 +
      metrics.issuesCreated * 15 +
      metrics.discussionsParticipated * 8 +
      metrics.socialShares * 5

    if (score >= 100) return 'Champion'
    if (score >= 50) return 'Contributor'
    if (score >= 20) return 'Supporter'
    if (score >= 5) return 'Member'
    return 'Visitor'
  })

  // 便捷方法
  const reportBug = (data?: Partial<FeedbackData>) => createGitHubIssue('bug', data)
  const requestFeature = (data?: Partial<FeedbackData>) => createGitHubIssue('feature', data)
  const sendGeneralFeedback = (data?: Partial<FeedbackData>) => createGitHubIssue('general', data)
  const reportTranslationIssue = (data?: Partial<FeedbackData>) =>
    createGitHubIssue('translation', data)

  // 初始化
  loadCommunityMetrics()

  return {
    // 状态
    isSubmitting,
    canSubmit,
    communityMetrics: computed(() => communityMetrics.value),
    userEngagementScore: getUserEngagementScore,

    // GitHub 相关
    createGitHubIssue,
    createDiscussion,
    reportBug,
    requestFeature,
    sendGeneralFeedback,
    reportTranslationIssue,

    // 其他反馈渠道
    sendEmailFeedback,
    submitStructuredFeedback,

    // 社区参与
    shareOnSocial,
    joinCommunity,

    // 工具方法
    getSystemInfo,
    saveCommunityMetrics,
    loadCommunityMetrics,
  }
}
