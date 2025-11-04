import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGitHubApi } from '@/composables/useGitHubApi'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('useGitHubApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with correct default values', () => {
    const { isLoading, error, stats, repoData, contributors, releases } = useGitHubApi()

    expect(isLoading.value).toBe(false)
    expect(error.value).toBe(null)
    expect(stats.value).toBe(null)
    expect(repoData.value).toBe(null)
    expect(contributors.value).toEqual([])
    expect(releases.value).toEqual([])
  })

  it('generates correct API URL', () => {
    const { apiUrl } = useGitHubApi('test/repo')
    expect(apiUrl.value).toBe('https://api.github.com/repos/test/repo')
  })

  it('generates correct cache key', () => {
    const { cacheKey } = useGitHubApi('test/repo')
    expect(cacheKey.value).toBe('github-test-repo')
  })

  it('fetches stats successfully', async () => {
    const mockRepoData = {
      stargazers_count: 100,
      forks_count: 20,
      updated_at: '2025-01-01T00:00:00Z',
    }

    const mockContributors = [
      { login: 'user1', contributions: 50 },
      { login: 'user2', contributions: 30 },
    ]

    const mockReleases = [{ tag_name: 'v1.2.0', published_at: '2025-01-01T00:00:00Z' }]

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRepoData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContributors),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReleases),
      })

    const { fetchStats, stats, isLoading } = useGitHubApi()

    expect(isLoading.value).toBe(false)

    const result = await fetchStats()

    expect(result).toEqual({
      stars: 100,
      forks: 20,
      contributors: 2,
      releases: 1,
      lastUpdate: '2025-01-01T00:00:00Z',
      version: 'v1.2.0',
    })

    expect(stats.value).toEqual(result)
    expect(isLoading.value).toBe(false)
  })

  it('uses cached data when available and fresh', async () => {
    const cachedData = {
      stars: 50,
      forks: 10,
      contributors: 1,
      releases: 1,
      lastUpdate: '2025-01-01T00:00:00Z',
      version: 'v1.0.0',
    }

    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({
        data: cachedData,
        timestamp: Date.now() - 5 * 60 * 1000, // 5 minutes ago
      })
    )

    const { fetchStats, stats } = useGitHubApi()

    const result = await fetchStats()

    expect(result).toEqual(cachedData)
    expect(stats.value).toEqual(cachedData)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('ignores stale cached data', async () => {
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({
        data: { stars: 50 },
        timestamp: Date.now() - 15 * 60 * 1000, // 15 minutes ago (stale)
      })
    )

    const mockRepoData = {
      stargazers_count: 100,
      forks_count: 20,
      updated_at: '2025-01-01T00:00:00Z',
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRepoData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

    const { fetchStats } = useGitHubApi()

    await fetchStats()

    expect(mockFetch).toHaveBeenCalled()
  })

  it('handles localStorage errors gracefully', async () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const mockRepoData = {
      stargazers_count: 100,
      forks_count: 20,
      updated_at: '2025-01-01T00:00:00Z',
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRepoData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

    const { fetchStats } = useGitHubApi()

    await fetchStats()

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to read cached data'),
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('refreshes stats by clearing cache', async () => {
    const { refreshStats } = useGitHubApi()

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            stargazers_count: 100,
            forks_count: 20,
            updated_at: '2025-01-01T00:00:00Z',
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

    await refreshStats()

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('github-johnnyzhao5619-echonote-stats')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('github-johnnyzhao5619-echonote-repo')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'github-johnnyzhao5619-echonote-contributors'
    )
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'github-johnnyzhao5619-echonote-releases'
    )
  })

  it('formats dates correctly', () => {
    const { formatDate } = useGitHubApi()

    // 测试有效日期格式化，允许时区差异
    const result = formatDate('2025-01-01T00:00:00Z')
    expect(result).toMatch(/\w{3} \d{1,2}, 202[45]/) // 允许时区差异
    expect(formatDate('invalid-date')).toMatch(/Unknown|Invalid Date/)
  })

  it('gets latest release correctly', () => {
    const { releases, getLatestRelease } = useGitHubApi()

    releases.value = [
      { tag_name: 'v1.2.0', published_at: '2025-01-01T00:00:00Z' },
      { tag_name: 'v1.1.0', published_at: '2024-12-01T00:00:00Z' },
    ]

    const latest = getLatestRelease()
    expect(latest?.tag_name).toBe('v1.2.0')
  })

  it('returns null when no releases available', () => {
    const { getLatestRelease } = useGitHubApi()

    const latest = getLatestRelease()
    expect(latest).toBe(null)
  })

  it('gets top contributors correctly', () => {
    const { contributors, getTopContributors } = useGitHubApi()

    contributors.value = [
      { login: 'user1', contributions: 10 },
      { login: 'user2', contributions: 50 },
      { login: 'user3', contributions: 30 },
    ]

    const top = getTopContributors(2)
    expect(top).toHaveLength(2)
    expect(top[0].login).toBe('user2')
    expect(top[1].login).toBe('user3')
  })

  it('handles empty contributors list', () => {
    const { getTopContributors } = useGitHubApi()

    const top = getTopContributors()
    expect(top).toEqual([])
  })
})
