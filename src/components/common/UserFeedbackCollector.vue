<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import FeedbackForm from './FeedbackForm.vue'

// Props
interface Props {
  showFloatingButton?: boolean
  showInlineFeedback?: boolean
  showAnalytics?: boolean
  autoShow?: boolean
  showDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  showFloatingButton: true,
  showInlineFeedback: false,
  showAnalytics: false,
  autoShow: false,
  showDelay: 30000, // 30 seconds
})

// Composables
const { t } = useI18n()

// State
const isModalOpen = ref(false)
const quickRating = ref<number | null>(null)
const quickRatingSubmitted = ref(false)

const popularRequests = ref([
  {
    id: 1,
    title: 'Multi-language speech recognition',
    description: 'Support for recognizing speech in multiple languages simultaneously',
    votes: 42,
    userVoted: false,
  },
  {
    id: 2,
    title: 'Mobile companion app',
    description: 'A mobile app to sync with the desktop application',
    votes: 38,
    userVoted: false,
  },
  {
    id: 3,
    title: 'Advanced calendar integrations',
    description: 'Integration with more calendar services like Notion, Todoist',
    votes: 29,
    userVoted: false,
  },
])

const commonIssues = ref([
  {
    id: 1,
    title: 'Microphone not detected',
    solution: 'Check system permissions and ensure microphone is connected',
    userMarked: false,
  },
  {
    id: 2,
    title: 'Transcription accuracy issues',
    solution: 'Ensure clear audio input and check language settings',
    userMarked: false,
  },
  {
    id: 3,
    title: 'Calendar sync not working',
    solution: 'Verify calendar permissions and internet connection',
    userMarked: false,
  },
])

const analyticsData = ref({
  pageViews: 15420,
  uniqueVisitors: 8930,
  averageTime: '2m 34s',
  bounceRate: 32,
})

// Computed
const ratingOptions = computed(() => [
  { value: 1, emoji: '😞', label: t('feedback.rating.poor') },
  { value: 2, emoji: '😐', label: t('feedback.rating.fair') },
  { value: 3, emoji: '🙂', label: t('feedback.rating.good') },
  { value: 4, emoji: '😊', label: t('feedback.rating.great') },
  { value: 5, emoji: '🤩', label: t('feedback.rating.excellent') },
])

// Methods
const openFeedbackModal = () => {
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeFeedbackModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = ''
}

const submitQuickRating = (rating: number) => {
  quickRating.value = rating
  quickRatingSubmitted.value = true

  // Track rating submission
  window.dispatchEvent(
    new CustomEvent('quick-rating-submitted', {
      detail: { rating, timestamp: new Date().toISOString() },
    })
  )

  // Auto-hide after 3 seconds
  setTimeout(() => {
    quickRatingSubmitted.value = false
  }, 3000)
}

const voteForRequest = (requestId: number) => {
  const request = popularRequests.value.find(r => r.id === requestId)
  if (request && !request.userVoted) {
    request.votes++
    request.userVoted = true

    // Track vote
    window.dispatchEvent(
      new CustomEvent('feature-request-voted', {
        detail: { requestId, timestamp: new Date().toISOString() },
      })
    )
  }
}

const markAsHelpful = (issueId: number) => {
  const issue = commonIssues.value.find(i => i.id === issueId)
  if (issue && !issue.userMarked) {
    issue.userMarked = true

    // Track helpful marking
    window.dispatchEvent(
      new CustomEvent('issue-marked-helpful', {
        detail: { issueId, timestamp: new Date().toISOString() },
      })
    )
  }
}

const openFeatureRequestForm = () => {
  // Open feedback form with feature request pre-selected
  openFeedbackModal()
}

const openBugReportForm = () => {
  // Open feedback form with bug report pre-selected
  openFeedbackModal()
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

// Auto-show logic
let autoShowTimer: number | null = null

const setupAutoShow = () => {
  if (props.autoShow && !localStorage.getItem('feedback-auto-shown')) {
    autoShowTimer = window.setTimeout(() => {
      openFeedbackModal()
      localStorage.setItem('feedback-auto-shown', 'true')
    }, props.showDelay)
  }
}

// Lifecycle
onMounted(() => {
  setupAutoShow()

  // Track page engagement
  window.dispatchEvent(
    new CustomEvent('feedback-collector-loaded', {
      detail: { timestamp: new Date().toISOString() },
    })
  )
})

onUnmounted(() => {
  if (autoShowTimer) {
    clearTimeout(autoShowTimer)
  }
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="feedback-collector">
    <!-- Floating Feedback Button -->
    <div
      v-if="showFloatingButton"
      class="floating-feedback"
    >
      <button
        @click="openFeedbackModal"
        class="feedback-fab"
        :aria-label="t('feedback.button.label')"
      >
        <svg
          class="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Feedback Modal -->
    <div
      v-if="isModalOpen"
      class="feedback-modal-overlay"
      @click="closeFeedbackModal"
    >
      <div
        class="feedback-modal"
        @click.stop
      >
        <FeedbackForm @close="closeFeedbackModal" />
      </div>
    </div>

    <!-- Inline Feedback Sections -->
    <div
      v-if="showInlineFeedback"
      class="inline-feedback-sections"
    >
      <!-- Quick Rating -->
      <div class="quick-rating-section">
        <h3 class="rating-title">{{ t('feedback.quickRating.title') }}</h3>
        <p class="rating-description">{{ t('feedback.quickRating.description') }}</p>

        <div class="rating-options">
          <button
            v-for="option in ratingOptions"
            :key="option.value"
            @click="submitQuickRating(option.value)"
            class="rating-option"
            :class="{ selected: quickRating === option.value }"
          >
            <span class="rating-emoji">{{ option.emoji }}</span>
            <span class="rating-label">{{ option.label }}</span>
          </button>
        </div>

        <div
          v-if="quickRatingSubmitted"
          class="rating-thanks"
        >
          {{ t('feedback.quickRating.thanks') }}
        </div>
      </div>

      <!-- Feature Requests -->
      <div class="feature-request-section">
        <h3 class="section-title">{{ t('feedback.featureRequest.title') }}</h3>
        <p class="section-description">{{ t('feedback.featureRequest.description') }}</p>

        <div class="popular-requests">
          <div
            v-for="request in popularRequests"
            :key="request.id"
            class="request-item"
          >
            <div class="request-content">
              <h4 class="request-title">{{ request.title }}</h4>
              <p class="request-description">{{ request.description }}</p>
            </div>
            <div class="request-actions">
              <button
                @click="voteForRequest(request.id)"
                class="vote-button"
                :class="{ voted: request.userVoted }"
              >
                <svg
                  class="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ request.votes }}
              </button>
            </div>
          </div>
        </div>

        <button
          @click="openFeatureRequestForm"
          class="suggest-feature-button"
        >
          {{ t('feedback.featureRequest.suggest') }}
        </button>
      </div>

      <!-- Bug Reports -->
      <div class="bug-report-section">
        <h3 class="section-title">{{ t('feedback.bugReport.title') }}</h3>
        <p class="section-description">{{ t('feedback.bugReport.description') }}</p>

        <div class="common-issues">
          <div
            v-for="issue in commonIssues"
            :key="issue.id"
            class="issue-item"
          >
            <div class="issue-content">
              <h4 class="issue-title">{{ issue.title }}</h4>
              <p class="issue-solution">{{ issue.solution }}</p>
            </div>
            <div class="issue-actions">
              <button
                @click="markAsHelpful(issue.id)"
                class="helpful-button"
                :class="{ marked: issue.userMarked }"
              >
                {{ t('feedback.bugReport.helpful') }}
              </button>
            </div>
          </div>
        </div>

        <button
          @click="openBugReportForm"
          class="report-bug-button"
        >
          {{ t('feedback.bugReport.report') }}
        </button>
      </div>
    </div>

    <!-- Analytics Tracking -->
    <div
      v-if="showAnalytics"
      class="analytics-section"
    >
      <h3 class="section-title">{{ t('feedback.analytics.title') }}</h3>
      <p class="section-description">{{ t('feedback.analytics.description') }}</p>

      <div class="analytics-stats">
        <div class="stat-item">
          <div class="stat-value">{{ formatNumber(analyticsData.pageViews) }}</div>
          <div class="stat-label">{{ t('feedback.analytics.pageViews') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ formatNumber(analyticsData.uniqueVisitors) }}</div>
          <div class="stat-label">{{ t('feedback.analytics.uniqueVisitors') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ analyticsData.averageTime }}</div>
          <div class="stat-label">{{ t('feedback.analytics.averageTime') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ analyticsData.bounceRate }}%</div>
          <div class="stat-label">{{ t('feedback.analytics.bounceRate') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feedback-collector {
  position: relative;
}

.floating-feedback {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 40;
}

.feedback-fab {
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 50%;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.feedback-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
}

.feedback-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.feedback-modal {
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.inline-feedback-sections {
  space-y: 3rem;
}

.quick-rating-section {
  background: #f8fafc;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
}

.rating-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.rating-description {
  color: #6b7280;
  margin-bottom: 2rem;
}

.rating-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.rating-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: white;
  border: 2px solid #e5e7eb;
  transition: all 0.2s;
  min-width: 80px;
}

.rating-option:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.rating-option.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.rating-emoji {
  font-size: 2rem;
}

.rating-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.rating-thanks {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 0.5rem;
  font-weight: 500;
}

.feature-request-section,
.bug-report-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.section-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.popular-requests,
.common-issues {
  space-y: 1rem;
  margin-bottom: 2rem;
}

.request-item,
.issue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  gap: 1rem;
}

.request-title,
.issue-title {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.request-description,
.issue-solution {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.vote-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s;
}

.vote-button:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.vote-button.voted {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.helpful-button {
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s;
}

.helpful-button:hover {
  border-color: #10b981;
  color: #10b981;
}

.helpful-button.marked {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.suggest-feature-button,
.report-bug-button {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.suggest-feature-button:hover,
.report-bug-button:hover {
  background: #2563eb;
}

.analytics-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.analytics-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .quick-rating-section {
    background: #1f2937;
  }

  .rating-title,
  .section-title {
    color: #f9fafb;
  }

  .rating-description,
  .section-description {
    color: #9ca3af;
  }

  .rating-option {
    background: #374151;
    border-color: #4b5563;
  }

  .rating-option.selected {
    background: #1e40af;
    border-color: #3b82f6;
  }

  .rating-label {
    color: #e5e7eb;
  }

  .feature-request-section,
  .bug-report-section,
  .analytics-section {
    background: #1f2937;
  }

  .request-item,
  .issue-item {
    background: #374151;
  }

  .request-title,
  .issue-title {
    color: #f9fafb;
  }

  .request-description,
  .issue-solution {
    color: #9ca3af;
  }

  .vote-button,
  .helpful-button {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }

  .vote-button:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .helpful-button:hover {
    border-color: #10b981;
    color: #10b981;
  }

  .stat-item {
    background: #374151;
  }

  .stat-value {
    color: #f9fafb;
  }

  .stat-label {
    color: #9ca3af;
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .floating-feedback {
    bottom: 1rem;
    right: 1rem;
  }

  .feedback-fab {
    width: 3rem;
    height: 3rem;
  }

  .rating-options {
    gap: 0.5rem;
  }

  .rating-option {
    min-width: 60px;
    padding: 0.75rem 0.5rem;
  }

  .rating-emoji {
    font-size: 1.5rem;
  }

  .request-item,
  .issue-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .request-actions,
  .issue-actions {
    width: 100%;
  }

  .vote-button,
  .helpful-button {
    width: 100%;
    justify-content: center;
  }

  .analytics-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
