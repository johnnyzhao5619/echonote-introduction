<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { formatNumber } from '@/utils/common'
import type { GitHubStats } from '@/types/github'

const props = withDefaults(defineProps<Props>(), {
  repository: 'echonote/echonote',
  showVersion: true,
  showLastUpdate: false,
  layout: 'grid',
  size: 'medium',
})

const { t } = useI18n()

// Props
interface Props {
  repository?: string
  showVersion?: boolean
  showLastUpdate?: boolean
  layout?: 'horizontal' | 'grid'
  size?: 'small' | 'medium' | 'large'
}

// State
const stats = ref<GitHubStats | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const animatedStats = ref({
  stars: 0,
  forks: 0,
  contributors: 0,
  releases: 0,
})

// Computed
const githubApiUrl = computed(() => `https://api.github.com/repos/${props.repository}`)

const containerClasses = computed(() => {
  const base = 'transition-all duration-300'
  const layouts = {
    horizontal: 'flex flex-wrap justify-center gap-4',
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-4',
  }
  return `${base} ${layouts[props.layout]}`
})

const cardClasses = computed(() => {
  const base =
    'bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center'
  const sizes = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  }
  return `${base} ${sizes[props.size]}`
})

const numberClasses = computed(() => {
  const sizes = {
    small: 'text-xl font-bold',
    medium: 'text-2xl md:text-3xl font-bold',
    large: 'text-3xl md:text-4xl font-bold',
  }
  return `${sizes[props.size]} text-gray-900 mb-1`
})

const iconClasses = computed(() => {
  const sizes = {
    small: 'text-xl mb-1',
    medium: 'text-3xl mb-2',
    large: 'text-4xl mb-3',
  }
  return sizes[props.size]
})

// Methods
const fetchStats = async (): Promise<void> => {
  isLoading.value = true
  error.value = null

  try {
    // Check cache first
    const cached = getCachedStats()
    if (cached) {
      stats.value = cached
      animateNumbers(cached)
      isLoading.value = false
      return
    }

    // Fetch data from GitHub API
    const [repoResponse, contributorsResponse, releasesResponse] = await Promise.all([
      fetch(githubApiUrl.value),
      fetch(`${githubApiUrl.value}/contributors`),
      fetch(`${githubApiUrl.value}/releases`),
    ])

    if (!repoResponse.ok) {
      throw new Error(`GitHub API error: ${repoResponse.status}`)
    }

    const repoData = await repoResponse.json()
    const contributorsData = contributorsResponse.ok ? await contributorsResponse.json() : []
    const releasesData = releasesResponse.ok ? await releasesResponse.json() : []

    const newStats: GitHubStats = {
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      contributors: Array.isArray(contributorsData) ? contributorsData.length : 0,
      releases: Array.isArray(releasesData) ? releasesData.length : 0,
      lastUpdate: repoData.updated_at || new Date().toISOString(),
      version: releasesData[0]?.tag_name || '1.0.0',
    }

    stats.value = newStats
    setCachedStats(newStats)
    animateNumbers(newStats)
  } catch (err) {
    console.warn('Failed to fetch GitHub stats:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load stats'

    // Use fallback stats
    const fallbackStats: GitHubStats = {
      stars: 0,
      forks: 0,
      contributors: 0,
      releases: 0,
      lastUpdate: new Date().toISOString(),
      version: '1.0.0',
    }

    stats.value = fallbackStats
    animatedStats.value = {
      stars: 0,
      forks: 0,
      contributors: 0,
      releases: 0,
    }
  } finally {
    isLoading.value = false
  }
}

const getCachedStats = (): GitHubStats | null => {
  try {
    const cacheKey = `echonote-stats-${props.repository.replace('/', '-')}`
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()
    const cacheAge = now - timestamp
    const maxAge = 10 * 60 * 1000 // 10 minutes

    if (cacheAge < maxAge) {
      return data
    }
  } catch (error) {
    console.warn('Failed to read cached stats:', error)
  }
  return null
}

const setCachedStats = (statsData: GitHubStats): void => {
  try {
    const cacheKey = `echonote-stats-${props.repository.replace('/', '-')}`
    const cacheData = {
      data: statsData,
      timestamp: Date.now(),
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.warn('Failed to cache stats:', error)
  }
}

const animateNumbers = (targetStats: GitHubStats): void => {
  const duration = 2000 // 2 seconds
  const steps = 60
  const stepDuration = duration / steps

  const startValues = { ...animatedStats.value }
  const targetValues = {
    stars: targetStats.stars,
    forks: targetStats.forks,
    contributors: targetStats.contributors,
    releases: targetStats.releases,
  }

  let currentStep = 0

  const animate = () => {
    currentStep++
    const progress = Math.min(currentStep / steps, 1)

    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3)

    animatedStats.value = {
      stars: Math.round(startValues.stars + (targetValues.stars - startValues.stars) * easeOut),
      forks: Math.round(startValues.forks + (targetValues.forks - startValues.forks) * easeOut),
      contributors: Math.round(
        startValues.contributors + (targetValues.contributors - startValues.contributors) * easeOut
      ),
      releases: Math.round(
        startValues.releases + (targetValues.releases - startValues.releases) * easeOut
      ),
    }

    if (currentStep < steps) {
      setTimeout(animate, stepDuration)
    }
  }

  animate()
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Unknown'
  }
}

const retry = (): void => {
  fetchStats()
}

// Lifecycle
onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="w-full">
    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="flex justify-center items-center py-8"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">{{ t('common.loading') }}</span>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="text-center py-8"
    >
      <div class="text-gray-500 mb-4">
        <svg
          class="w-12 h-12 mx-auto mb-2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>{{ error }}</p>
      </div>
      <button
        @click="retry"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg
          class="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ t('common.retry') }}
      </button>
    </div>

    <!-- Stats display -->
    <div
      v-else-if="stats"
      class="space-y-6"
    >
      <!-- Main stats -->
      <div :class="containerClasses">
        <div
          v-for="(stat, key) in {
            stars: { label: t('hero.stats.stars'), value: animatedStats.stars, icon: '⭐' },
            forks: { label: t('hero.stats.forks'), value: animatedStats.forks, icon: '🍴' },
            contributors: {
              label: t('hero.stats.contributors'),
              value: animatedStats.contributors,
              icon: '👥',
            },
            releases: {
              label: t('hero.stats.releases'),
              value: animatedStats.releases,
              icon: '🚀',
            },
          }"
          :key="key"
          :class="cardClasses"
        >
          <div :class="iconClasses">{{ stat.icon }}</div>
          <div :class="numberClasses">
            {{ formatNumber(stat.value) }}
          </div>
          <div class="text-sm text-gray-600 font-medium">
            {{ stat.label }}
          </div>
        </div>
      </div>

      <!-- Additional info -->
      <div
        v-if="props.showVersion || props.showLastUpdate"
        class="flex flex-wrap justify-center gap-4 text-sm text-gray-600"
      >
        <div
          v-if="props.showVersion && stats.version"
          class="flex items-center"
        >
          <span class="mr-1">🏷️</span>
          {{ t('footer.version') }}: {{ stats.version }}
        </div>
        <div
          v-if="props.showLastUpdate && stats.lastUpdate"
          class="flex items-center"
        >
          <span class="mr-1">📅</span>
          {{ t('footer.lastUpdated') }}: {{ formatDate(stats.lastUpdate) }}
        </div>
      </div>
    </div>
  </div>
</template>
