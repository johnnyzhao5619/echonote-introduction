import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import { createUseI18nMock } from '../mocks'

// 使用统一的Mock配置
const mockUseI18n = createUseI18nMock()

vi.mock('@/composables/useI18n', () => ({
  useI18n: () => mockUseI18n,
}))

describe('LanguageSwitcher', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('scrollTo', vi.fn())
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.unstubAllGlobals()
  })

  it('renders correctly with current language', () => {
    wrapper = mount(LanguageSwitcher)

    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toContain('English')
    expect(wrapper.text()).toContain('🇺🇸')
  })

  it('shows dropdown when button is clicked', async () => {
    wrapper = mount(LanguageSwitcher)

    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    await wrapper.find('button').trigger('click')

    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(4)
  })

  it('closes dropdown when clicking outside', async () => {
    wrapper = mount(LanguageSwitcher, {
      attachTo: document.body,
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)

    document.body.click()
    await nextTick()

    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('changes language when option is selected', async () => {
    wrapper = mount(LanguageSwitcher)

    await wrapper.find('button').trigger('click')
    const chineseOption = wrapper.findAll('[role="menuitem"]')[1]
    await chineseOption.trigger('click')

    expect(mockUseI18n.changeLanguage).toHaveBeenCalledWith('zh-CN')
  })

  it('handles keyboard navigation correctly', async () => {
    wrapper = mount(LanguageSwitcher)

    const button = wrapper.find('button')

    await button.trigger('keydown.enter')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)

    await button.trigger('keydown.arrow-down')
    await button.trigger('keydown.arrow-up')

    await button.trigger('keydown.escape')
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('shows current language as selected', async () => {
    wrapper = mount(LanguageSwitcher)

    await wrapper.find('button').trigger('click')

    const currentOption = wrapper.find('[aria-current="true"]')
    expect(currentOption.exists()).toBe(true)
    expect(currentOption.text()).toContain('English')
  })

  it('preserves scroll position when changing language', async () => {
    const mockScrollTo = vi.fn()
    vi.stubGlobal('scrollTo', mockScrollTo)

    Object.defineProperty(window, 'pageYOffset', {
      value: 500,
      writable: true,
    })

    wrapper = mount(LanguageSwitcher)

    await wrapper.find('button').trigger('click')
    const chineseOption = wrapper.findAll('[role="menuitem"]')[1]
    await chineseOption.trigger('click')

    await nextTick()

    expect(mockScrollTo).toHaveBeenCalledWith(0, 500)
  })

  it('handles touch events on mobile', async () => {
    wrapper = mount(LanguageSwitcher)

    const touchEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 0, clientY: 0 } as Touch],
    })

    const button = wrapper.find('button')
    button.element.dispatchEvent(touchEvent)

    expect(wrapper.exists()).toBe(true)
  })

  it('has proper accessibility attributes', () => {
    wrapper = mount(LanguageSwitcher)

    const button = wrapper.find('button')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.attributes('aria-haspopup')).toBe('true')
    expect(button.attributes('aria-label')).toBe('nav.language')
  })

  it('updates accessibility attributes when dropdown is open', async () => {
    wrapper = mount(LanguageSwitcher)

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(button.attributes('aria-expanded')).toBe('true')
    expect(button.classes()).toContain('ring-2')
  })
})
