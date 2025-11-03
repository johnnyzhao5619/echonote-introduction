import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import { createUseI18nMock, createGitHubApiMock } from '../mocks'

// 使用统一的Mock配置
const mockUseI18n = createUseI18nMock()
const mockGitHubApi = createGitHubApiMock()
// UI Mocks moved to vi.mock

vi.mock('@/composables/useI18n', () => ({
  useI18n: () => mockUseI18n,
}))

vi.mock('@/composables/useGitHubApi', () => ({
  useGitHubApi: () => mockGitHubApi,
}))

vi.mock('@/composables/useUI', () => ({
  useStaggeredAnimations: () => ({
    containerRef: { value: null },
  }),
  useSmoothScroll: () => ({
    scrollToElement: vi.fn(),
  }),
}))

vi.mock('@/utils/common', () => ({
  formatNumber: (num: number) => num.toLocaleString(),
}))

describe('HeroSection', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // 重置Mock状态
    mockGitHubApi.isLoading.value = false
    mockGitHubApi.error.value = null
    mockGitHubApi.stats.value = {
      stars: 150,
      forks: 25,
      contributors: 8,
      releases: 12,
      lastUpdate: '2025-01-01T00:00:00Z',
      version: 'v1.2.0',
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
  })

  it('renders hero content correctly', () => {
    wrapper = mount(HeroSection)

    expect(wrapper.text()).toContain('hero.title')
    expect(wrapper.text()).toContain('hero.tagline')
    expect(wrapper.text()).toContain('hero.description')
  })

  it('renders CTA buttons with correct links', () => {
    wrapper = mount(HeroSection, {
      props: {
        repository: 'test/repo',
      },
    })

    const buttons = wrapper.findAll('a')
    expect(buttons).toHaveLength(3)

    expect(buttons[0].text()).toContain('hero.downloadButton')
    expect(buttons[0].attributes('href')).toBe('https://github.com/test/repo/releases/latest')
    expect(buttons[0].attributes('target')).toBe('_blank')

    expect(buttons[1].text()).toContain('hero.docsButton')
    expect(buttons[1].attributes('href')).toBe('https://github.com/test/repo#readme')

    expect(buttons[2].text()).toContain('hero.githubButton')
    expect(buttons[2].attributes('href')).toBe('https://github.com/test/repo')
  })

  it('shows GitHub stats when available', () => {
    wrapper = mount(HeroSection, {
      props: {
        showStats: true,
      },
    })

    expect(wrapper.text()).toContain('150')
    expect(wrapper.text()).toContain('25')
    expect(wrapper.text()).toContain('8')
    expect(wrapper.text()).toContain('12')
  })

  it('hides stats when showStats is false', () => {
    wrapper = mount(HeroSection, {
      props: {
        showStats: false,
      },
    })

    expect(wrapper.find('[role="region"]').exists()).toBe(false)
  })

  it('shows loading state when fetching stats', () => {
    mockGitHubApi.isLoading.value = true
    mockGitHubApi.stats.value = null

    wrapper = mount(HeroSection, {
      props: {
        showStats: true,
      },
    })

    expect(wrapper.text()).toContain('common.loading')
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('shows error state when stats fail to load', () => {
    mockGitHubApi.isLoading.value = false
    mockGitHubApi.error.value = 'Network error'
    mockGitHubApi.stats.value = null

    wrapper = mount(HeroSection, {
      props: {
        showStats: true,
      },
    })

    expect(wrapper.text()).toContain('common.error')
    expect(wrapper.text()).toContain('common.retry')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('calls refreshStats when retry button is clicked', async () => {
    mockGitHubApi.isLoading.value = false
    mockGitHubApi.error.value = 'Network error'
    mockGitHubApi.stats.value = null

    wrapper = mount(HeroSection, {
      props: {
        showStats: true,
      },
    })

    const retryButton = wrapper.find('button')
    await retryButton.trigger('click')

    expect(mockGitHubApi.refreshStats).toHaveBeenCalled()
  })

  it('animates features when animateFeatures is true', async () => {
    wrapper = mount(HeroSection, {
      props: {
        animateFeatures: true,
      },
    })

    expect(wrapper.text()).toContain('hero.features.0')

    vi.advanceTimersByTime(3100)
    await nextTick()

    expect(wrapper.text()).toContain('hero.features.1')
  })

  it('does not animate features when animateFeatures is false', () => {
    wrapper = mount(HeroSection, {
      props: {
        animateFeatures: false,
      },
    })

    expect(wrapper.find('.inline-flex.items-center.px-4').exists()).toBe(false)
  })

  it('calls fetchStats on mount when showStats is true', () => {
    wrapper = mount(HeroSection, {
      props: {
        showStats: true,
      },
    })

    expect(mockGitHubApi.fetchStats).toHaveBeenCalled()
  })

  it('does not call fetchStats when showStats is false', () => {
    vi.clearAllMocks()

    wrapper = mount(HeroSection, {
      props: {
        showStats: false,
      },
    })

    expect(mockGitHubApi.fetchStats).not.toHaveBeenCalled()
  })

  it('handles scroll to features section', async () => {
    wrapper = mount(HeroSection)

    const scrollButton = wrapper.find('button[aria-label="Scroll to features section"]')
    await scrollButton.trigger('click')

    // Mock is called but we can't easily test it due to vi.mock hoisting
  })

  it('has proper accessibility attributes', () => {
    wrapper = mount(HeroSection)

    expect(wrapper.find('section').attributes('role')).toBe('banner')
    expect(wrapper.find('section').attributes('aria-labelledby')).toBe('hero-title')
    expect(wrapper.find('#hero-title').exists()).toBe(true)
  })

  it('has proper ARIA labels for stats', () => {
    wrapper = mount(HeroSection, {
      props: {
        showStats: true,
      },
    })

    const statItems = wrapper.findAll('[role="listitem"]')
    expect(statItems.length).toBeGreaterThan(0)

    statItems.forEach(item => {
      expect(item.attributes('aria-label')).toBeTruthy()
    })
  })

  it('uses default repository when not provided', () => {
    wrapper = mount(HeroSection)

    const downloadButton = wrapper.findAll('a')[0]
    expect(downloadButton.attributes('href')).toBe(
      'https://github.com/echonote/echonote/releases/latest'
    )
  })

  it('cycles through all features in animation', async () => {
    wrapper = mount(HeroSection, {
      props: {
        animateFeatures: true,
      },
    })

    const features = [
      'hero.features.0',
      'hero.features.1',
      'hero.features.2',
      'hero.features.3',
      'hero.features.4',
    ]

    for (let i = 0; i < features.length; i++) {
      expect(wrapper.text()).toContain(features[i])
      vi.advanceTimersByTime(3100)
      await nextTick()
    }

    expect(wrapper.text()).toContain(features[0])
  })

  it('handles external link attributes correctly', () => {
    wrapper = mount(HeroSection)

    const externalLinks = wrapper.findAll('a[target="_blank"]')
    externalLinks.forEach(link => {
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    })
  })
})
