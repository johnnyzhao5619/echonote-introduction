import { ref, computed } from 'vue'
import { APP_CONFIG } from '@/config/app'
import type {
  GitHubStats,
  GitHubRepository,
  GitHubContributor,
  GitHubRelease,
} from '@/types/github'

export function useGitHubApi(repository: string = APP_CONFIG.github.repository) {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const stats = ref<GitHubStats | null>(null)
  const repoData = ref<GitHubRepository | null>(null)
  const contributors = ref<GitHubContributor[]>([])
  const releases = ref<GitHubRelease[]>([])

  // Computed
  const apiUrl = computed(() => `${APP_CONFIG.github.apiBase}/repos/${repository}`)
  const cacheKey = computed(() => `github-${repository.replace('/', '-')}`)

  // Cache configuration from centralized config
  const CACHE_DURATION = APP_CONFIG.github.cacheTimeout
  const RATE_LIMIT_DELAY = APP_CONFIG.github.rateLimit.delay

  // Methods
  const getCachedData = <T>(key: string): T | null => {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const now = Date.now()
      const cacheAge = now - timestamp

      if (cacheAge < CACHE_DURATION) {
        return data
      }
    } catch (error) {
      console.warn(`Failed to read cached data for ${key}:`, error)
    }
    return null
  }

  const setCachedData = <T>(key: string, data: T): void => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
    } catch (error) {
      console.warn(`Failed to cache data for ${key}:`, error)
    }
  }

  const fetchWithRetry = async (
    url: string,
    retries = APP_CONFIG.github.rateLimit.maxRetries
  ): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url)

        if (response.status === 403) {
          // Rate limit exceeded
          const resetTime = response.headers.get('X-RateLimit-Reset')
          if (resetTime) {
            const resetDate = new Date(parseInt(resetTime) * 1000)
            const waitTime = resetDate.getTime() - Date.now()
            if (waitTime > 0 && waitTime < 60000) {
              // Wait max 1 minute
              await new Promise(resolve => setTimeout(resolve, waitTime))
              continue
            }
          }
        }

        if (response.ok || response.status === 404) {
          return response
        }

        if (i === retries - 1) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * (i + 1)))
      } catch (err) {
        if (i === retries - 1) {
          throw err
        }
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * (i + 1)))
      }
    }
    throw new Error('Max retries exceeded')
  }

  const fetchRepository = async (): Promise<GitHubRepository | null> => {
    try {
      // Check cache first
      const cached = getCachedData<GitHubRepository>(`${cacheKey.value}-repo`)
      if (cached) {
        repoData.value = cached
        return cached
      }

      const response = await fetchWithRetry(apiUrl.value)
      if (!response.ok) {
        throw new Error(`Failed to fetch repository: ${response.status}`)
      }

      const data = await response.json()
      repoData.value = data
      setCachedData(`${cacheKey.value}-repo`, data)
      return data
    } catch (err) {
      console.warn('Failed to fetch repository data:', err)
      return null
    }
  }

  const fetchContributors = async (): Promise<GitHubContributor[]> => {
    try {
      // Check cache first
      const cached = getCachedData<GitHubContributor[]>(`${cacheKey.value}-contributors`)
      if (cached) {
        contributors.value = cached
        return cached
      }

      const response = await fetchWithRetry(`${apiUrl.value}/contributors`)
      if (!response.ok) {
        return []
      }

      const data = await response.json()
      const contributorList = Array.isArray(data) ? data : []
      contributors.value = contributorList
      setCachedData(`${cacheKey.value}-contributors`, contributorList)
      return contributorList
    } catch (err) {
      console.warn('Failed to fetch contributors:', err)
      return []
    }
  }

  const fetchReleases = async (): Promise<GitHubRelease[]> => {
    try {
      // Check cache first
      const cached = getCachedData<GitHubRelease[]>(`${cacheKey.value}-releases`)
      if (cached) {
        releases.value = cached
        return cached
      }

      const response = await fetchWithRetry(`${apiUrl.value}/releases`)
      if (!response.ok) {
        return []
      }

      const data = await response.json()
      const releaseList = Array.isArray(data) ? data : []
      releases.value = releaseList
      setCachedData(`${cacheKey.value}-releases`, releaseList)
      return releaseList
    } catch (err) {
      console.warn('Failed to fetch releases:', err)
      return []
    }
  }

  const fetchStats = async (): Promise<GitHubStats | null> => {
    isLoading.value = true
    error.value = null

    try {
      // Check cache first
      const cached = getCachedData<GitHubStats>(`${cacheKey.value}-stats`)
      if (cached) {
        stats.value = cached
        isLoading.value = false
        return cached
      }

      // Fetch all data concurrently
      const [repo, contributorList, releaseList] = await Promise.all([
        fetchRepository(),
        fetchContributors(),
        fetchReleases(),
      ])

      if (!repo) {
        throw new Error('Failed to fetch repository data')
      }

      const statsData: GitHubStats = {
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        contributors: contributorList.length,
        releases: releaseList.length,
        lastUpdate: repo.updated_at || new Date().toISOString(),
        version: releaseList[0]?.tag_name || '1.0.0',
      }

      stats.value = statsData
      setCachedData(`${cacheKey.value}-stats`, statsData)
      return statsData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.warn('Failed to fetch GitHub stats:', err)
      error.value = errorMessage

      // Return fallback stats
      const fallbackStats: GitHubStats = {
        stars: 0,
        forks: 0,
        contributors: 0,
        releases: 0,
        lastUpdate: new Date().toISOString(),
        version: '1.0.0',
      }

      stats.value = fallbackStats
      return fallbackStats
    } finally {
      isLoading.value = false
    }
  }

  const refreshStats = async (): Promise<GitHubStats | null> => {
    // Clear cache and fetch fresh data
    try {
      localStorage.removeItem(`${cacheKey.value}-stats`)
      localStorage.removeItem(`${cacheKey.value}-repo`)
      localStorage.removeItem(`${cacheKey.value}-contributors`)
      localStorage.removeItem(`${cacheKey.value}-releases`)
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }

    return await fetchStats()
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

  const getLatestRelease = (): GitHubRelease | null => {
    return releases.value[0] || null
  }

  const getTopContributors = (limit = 10): GitHubContributor[] => {
    return contributors.value.sort((a, b) => b.contributions - a.contributions).slice(0, limit)
  }

  return {
    // State
    isLoading,
    error,
    stats,
    repoData,
    contributors,
    releases,

    // Methods
    fetchStats,
    refreshStats,
    fetchRepository,
    fetchContributors,
    fetchReleases,
    formatDate,
    getLatestRelease,
    getTopContributors,

    // Computed
    apiUrl,
    cacheKey,
  }
}
