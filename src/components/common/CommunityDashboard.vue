<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useGitHubApi } from '@/composables/useGitHubApi'

// Composables
const { t } = useI18n()
const { fetchStats, fetchContributors } = useGitHubApi()

// State
const githubStats = ref({
  stars: 0,
  forks: 0,
  contributors: 0,
  releases: 0,
})

const contributors = ref<
  Array<{ id: number; login: string; avatar_url: string; html_url: string; contributions: number }>
>([])
const isLoadingContributors = ref(true)
const showAll = ref(false)
const displayLimit = 12

// Computed
const displayedContributors = computed(() => {
  return showAll.value ? contributors.value : contributors.value.slice(0, displayLimit)
})

const contributionWays = computed(() => [
  t('community.contribute.ways.0'),
  t('community.contribute.ways.1'),
  t('community.contribute.ways.2'),
  t('community.contribute.ways.3'),
  t('community.contribute.ways.4'),
])

const roadmapItems = computed(() => [
  t('community.roadmap.items.0'),
  t('community.roadmap.items.1'),
  t('community.roadmap.items.2'),
  t('community.roadmap.items.3'),
  t('community.roadmap.items.4'),
])

// Methods
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

const toggleShowAll = () => {
  showAll.value = !showAll.value
}

const loadGitHubData = async () => {
  try {
    // Load repository stats
    const stats = await fetchStats()
    if (stats) {
      githubStats.value = {
        stars: stats.stars || 0,
        forks: stats.forks || 0,
        contributors: stats.contributors || 0,
        releases: stats.releases || 0,
      }
    }

    // Load contributors
    const contributorsData = await fetchContributors()
    contributors.value = contributorsData || []
  } catch (error) {
    console.error('Failed to load GitHub data:', error)
  } finally {
    isLoadingContributors.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadGitHubData()
})
</script>

<template>
  <div class="community-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h2 class="dashboard-title">{{ t('community.title') }}</h2>
      <p class="dashboard-subtitle">{{ t('community.subtitle') }}</p>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon github">
          <svg
            class="w-8 h-8"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(githubStats.stars) }}</div>
          <div class="stat-label">{{ t('hero.stats.stars') }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon contributors">
          <svg
            class="w-8 h-8"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(githubStats.contributors) }}</div>
          <div class="stat-label">{{ t('hero.stats.contributors') }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon forks">
          <svg
            class="w-8 h-8"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7l3.707-3.707a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(githubStats.forks) }}</div>
          <div class="stat-label">{{ t('hero.stats.forks') }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon releases">
          <svg
            class="w-8 h-8"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(githubStats.releases) }}</div>
          <div class="stat-label">{{ t('hero.stats.releases') }}</div>
        </div>
      </div>
    </div>

    <!-- Contributors Section -->
    <div class="contributors-section">
      <h3 class="section-title">{{ t('community.contributors.title') }}</h3>
      <p class="section-description">{{ t('community.contributors.description') }}</p>

      <div
        v-if="isLoadingContributors"
        class="loading-state"
      >
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div
        v-else-if="contributors.length > 0"
        class="contributors-grid"
      >
        <a
          v-for="contributor in displayedContributors"
          :key="contributor.id"
          :href="contributor.html_url"
          target="_blank"
          rel="noopener noreferrer"
          class="contributor-card"
          :title="`${contributor.login} - ${contributor.contributions} contributions`"
        >
          <img
            :src="contributor.avatar_url"
            :alt="`${contributor.login} avatar`"
            class="contributor-avatar"
            loading="lazy"
          />
          <div class="contributor-info">
            <div class="contributor-name">{{ contributor.login }}</div>
            <div class="contributor-contributions">
              {{ contributor.contributions }} {{ t('common.contributions') }}
            </div>
          </div>
        </a>
      </div>

      <div
        v-if="contributors.length > displayLimit"
        class="show-more-section"
      >
        <button
          @click="toggleShowAll"
          class="show-more-button"
        >
          {{ showAll ? t('common.showLess') : t('community.contributors.viewAll') }}
        </button>
      </div>
    </div>

    <!-- Support Channels -->
    <div class="support-section">
      <h3 class="section-title">{{ t('community.support.title') }}</h3>
      <p class="section-description">{{ t('community.support.description') }}</p>

      <div class="support-channels">
        <a
          href="https://github.com/echonote/echonote/issues"
          target="_blank"
          rel="noopener noreferrer"
          class="support-channel"
        >
          <div class="channel-icon github">
            <svg
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="channel-content">
            <div class="channel-title">GitHub Issues</div>
            <div class="channel-description">{{ t('community.support.channels.github') }}</div>
          </div>
        </a>

        <a
          href="https://github.com/echonote/echonote/discussions"
          target="_blank"
          rel="noopener noreferrer"
          class="support-channel"
        >
          <div class="channel-icon discussions">
            <svg
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="channel-content">
            <div class="channel-title">GitHub Discussions</div>
            <div class="channel-description">{{ t('community.support.channels.discussions') }}</div>
          </div>
        </a>

        <a
          href="https://echonote.github.io/docs"
          target="_blank"
          rel="noopener noreferrer"
          class="support-channel"
        >
          <div class="channel-icon docs">
            <svg
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="channel-content">
            <div class="channel-title">Documentation</div>
            <div class="channel-description">{{ t('community.support.channels.docs') }}</div>
          </div>
        </a>

        <a
          href="mailto:support@echonote.com"
          class="support-channel"
        >
          <div class="channel-icon email">
            <svg
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <div class="channel-content">
            <div class="channel-title">Email Support</div>
            <div class="channel-description">{{ t('community.support.channels.email') }}</div>
          </div>
        </a>
      </div>
    </div>

    <!-- Contribution Guide -->
    <div class="contribute-section">
      <h3 class="section-title">{{ t('community.contribute.title') }}</h3>
      <p class="section-description">{{ t('community.contribute.description') }}</p>

      <div class="contribute-ways">
        <div
          v-for="(way, index) in contributionWays"
          :key="index"
          class="contribute-way"
        >
          <div class="way-number">{{ index + 1 }}</div>
          <div class="way-content">{{ way }}</div>
        </div>
      </div>

      <div class="contribute-actions">
        <a
          href="https://github.com/echonote/echonote/blob/main/CONTRIBUTING.md"
          target="_blank"
          rel="noopener noreferrer"
          class="contribute-button primary"
        >
          {{ t('community.contribute.guide') }}
        </a>
        <a
          href="https://github.com/echonote/echonote"
          target="_blank"
          rel="noopener noreferrer"
          class="contribute-button secondary"
        >
          {{ t('nav.github') }}
        </a>
      </div>
    </div>

    <!-- Roadmap Preview -->
    <div class="roadmap-section">
      <h3 class="section-title">{{ t('community.roadmap.title') }}</h3>
      <p class="section-description">{{ t('community.roadmap.description') }}</p>

      <div class="roadmap-items">
        <div
          v-for="(item, index) in roadmapItems"
          :key="index"
          class="roadmap-item"
        >
          <div class="roadmap-icon">
            <svg
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="roadmap-content">{{ item }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.community-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.dashboard-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.github {
  background: linear-gradient(135deg, #333 0%, #24292e 100%);
}

.stat-icon.contributors {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon.forks {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-icon.releases {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.section-title {
  font-size: 1.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.section-description {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.contributors-section {
  margin-bottom: 4rem;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.contributors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.contributor-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
}

.contributor-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.contributor-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
}

.contributor-name {
  font-weight: 500;
  color: #1f2937;
}

.contributor-contributions {
  font-size: 0.875rem;
  color: #6b7280;
}

.show-more-section {
  text-align: center;
}

.show-more-button {
  background: #f3f4f6;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.show-more-button:hover {
  background: #e5e7eb;
}

.support-section {
  margin-bottom: 4rem;
}

.support-channels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.support-channel {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
}

.support-channel:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.channel-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.channel-icon.github {
  background: linear-gradient(135deg, #333 0%, #24292e 100%);
}

.channel-icon.discussions {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.channel-icon.docs {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.channel-icon.email {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.channel-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.channel-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.contribute-section {
  margin-bottom: 4rem;
}

.contribute-ways {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.contribute-way {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.contribute-way:last-child {
  margin-bottom: 0;
}

.way-number {
  width: 2rem;
  height: 2rem;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.way-content {
  color: #374151;
  line-height: 1.6;
}

.contribute-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.contribute-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.contribute-button.primary {
  background: #3b82f6;
  color: white;
}

.contribute-button.primary:hover {
  background: #2563eb;
}

.contribute-button.secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.contribute-button.secondary:hover {
  background: #f9fafb;
}

.roadmap-section {
  margin-bottom: 2rem;
}

.roadmap-items {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.roadmap-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.roadmap-item:last-child {
  border-bottom: none;
}

.roadmap-icon {
  color: #10b981;
  flex-shrink: 0;
}

.roadmap-content {
  color: #374151;
  line-height: 1.5;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .dashboard-title {
    color: #f9fafb;
  }

  .dashboard-subtitle {
    color: #9ca3af;
  }

  .stat-card,
  .contributor-card,
  .support-channel,
  .roadmap-items {
    background: #1f2937;
    color: #f9fafb;
  }

  .stat-value,
  .contributor-name,
  .channel-title {
    color: #f9fafb;
  }

  .section-title {
    color: #f9fafb;
  }

  .section-description,
  .contributor-contributions,
  .channel-description {
    color: #9ca3af;
  }

  .contribute-ways {
    background: #374151;
  }

  .way-content,
  .roadmap-content {
    color: #e5e7eb;
  }

  .contribute-button.secondary {
    background: #374151;
    color: #e5e7eb;
    border-color: #4b5563;
  }

  .contribute-button.secondary:hover {
    background: #4b5563;
  }

  .roadmap-item {
    border-color: #374151;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .dashboard-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .contributors-grid {
    grid-template-columns: 1fr;
  }

  .support-channels {
    grid-template-columns: 1fr;
  }

  .contribute-actions {
    flex-direction: column;
  }

  .contribute-button {
    justify-content: center;
  }
}
</style>
