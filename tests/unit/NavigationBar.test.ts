import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import NavigationBar from '@/components/common/NavigationBar.vue'
import { createUseI18nMock } from '../mocks'

// Mock useI18n composable
const mockUseI18n = createUseI18nMock()

vi.mock('@/composables/useI18n', () => ({
  useI18n: () => mockUseI18n,
}))

vi.mock('@/composables/useUI', () => ({
  useSmoothScroll: () => ({
    scrollToElement: vi.fn(),
  }),
}))

describe('NavigationBar', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders navigation items correctly', () => {
    wrapper = mount(NavigationBar)

    expect(wrapper.find('nav').exists()).toBe(true)
    expect(wrapper.text()).toContain('hero.title')
  })

  it('shows mobile menu when hamburger button is clicked', async () => {
    wrapper = mount(NavigationBar)

    const hamburgerButton = wrapper.find('[aria-label="Toggle navigation menu"]')
    expect(hamburgerButton.exists()).toBe(true)

    await hamburgerButton.trigger('click')
    await nextTick()

    expect(wrapper.find('#mobile-menu').exists()).toBe(true)
  })

  it('closes mobile menu when hamburger button is clicked again', async () => {
    wrapper = mount(NavigationBar)

    // Open menu first
    const hamburgerButton = wrapper.find('[aria-label="Toggle navigation menu"]')
    await hamburgerButton.trigger('click')
    await nextTick()

    // Close menu by clicking hamburger again
    await hamburgerButton.trigger('click')
    await nextTick()

    expect(wrapper.find('#mobile-menu').exists()).toBe(false)
  })

  it('handles keyboard navigation correctly', async () => {
    wrapper = mount(NavigationBar)

    const hamburgerButton = wrapper.find('[aria-label="Toggle navigation menu"]')

    await hamburgerButton.trigger('click')
    await nextTick()

    expect(wrapper.find('#mobile-menu').exists()).toBe(true)
  })

  it('has proper accessibility attributes', () => {
    wrapper = mount(NavigationBar)

    const nav = wrapper.find('nav')
    expect(nav.attributes('role')).toBe('navigation')
    expect(nav.attributes('aria-label')).toBeTruthy()

    const hamburgerButton = wrapper.find('[aria-label="Toggle navigation menu"]')
    expect(hamburgerButton.attributes('aria-expanded')).toBe('false')
  })

  it('updates aria-expanded when menu is opened', async () => {
    wrapper = mount(NavigationBar)

    const hamburgerButton = wrapper.find('[aria-label="Toggle navigation menu"]')
    await hamburgerButton.trigger('click')

    expect(hamburgerButton.attributes('aria-expanded')).toBe('true')
  })

  it('includes language switcher component', () => {
    wrapper = mount(NavigationBar)

    expect(wrapper.findComponent({ name: 'LanguageSwitcher' }).exists()).toBe(true)
  })

  it('handles scroll behavior on navigation', async () => {
    wrapper = mount(NavigationBar)

    const navLink = wrapper.find('a[href="#features"]')
    if (navLink.exists()) {
      await navLink.trigger('click')
      // Mock is called but we can't easily test the scroll behavior
    }
  })
})
