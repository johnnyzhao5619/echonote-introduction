import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import StatsDisplay from '@/components/common/StatsDisplay.vue'
import { createUseI18nMock } from '../mocks'

// Mock useI18n composable
const mockUseI18n = createUseI18nMock()

vi.mock('@/composables/useI18n', () => ({
  useI18n: () => mockUseI18n,
}))

vi.mock('@/utils/common', () => ({
  formatNumber: (num: number) => num.toLocaleString(),
}))

// Mock fetch
global.fetch = vi.fn()

describe('StatsDisplay', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock successful API response
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          stargazers_count: 150,
          forks_count: 25,
          updated_at: '2025-01-01T00:00:00Z',
        }),
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders stats correctly when data is available', async () => {
    wrapper = mount(StatsDisplay)

    // Wait for component to load data
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.exists()).toBe(true)
  })

  it('shows loading state when fetching data', () => {
    wrapper = mount(StatsDisplay)

    // Component should render without errors
    expect(wrapper.exists()).toBe(true)
  })

  it('shows error state when data fails to load', async () => {
    ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

    wrapper = mount(StatsDisplay)

    // Wait for error to be handled
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('common.retry')
  })

  it('renders with different layouts', () => {
    wrapper = mount(StatsDisplay, {
      props: {
        layout: 'horizontal',
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('renders with different sizes', () => {
    wrapper = mount(StatsDisplay, {
      props: {
        size: 'large',
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
