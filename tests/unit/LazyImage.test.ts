import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LazyImage from '@/components/common/LazyImage.vue'
import { createUseI18nMock } from '../mocks'

// Mock the composables
vi.mock('@/composables/useI18n', () => ({
  useI18n: () => createUseI18nMock(),
}))

// Mock the constants
vi.mock('@/config/constants', () => ({
  APP_CONFIG: {
    images: {
      contexts: {
        feature: {
          sizes: '(max-width: 768px) 100vw, 50vw',
          aspectRatio: '16/9',
        },
        hero: {
          sizes: '100vw',
          aspectRatio: '21/9',
        },
      },
      formats: ['webp', 'avif'],
      sizes: [400, 800, 1200, 1600],
    },
  },
}))

// Mock IntersectionObserver for this test
global.IntersectionObserver = vi.fn(function (_callback, _options) {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }
})

describe('LazyImage', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders OptimizedImage with correct props', () => {
    wrapper = mount(LazyImage, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
        context: 'feature',
        className: 'custom-class',
        showPlaceholder: true,
      },
    })

    const optimizedImage = wrapper.findComponent({ name: 'OptimizedImage' })
    expect(optimizedImage.exists()).toBe(true)
    expect(optimizedImage.props('src')).toBe('/test-image.jpg')
    expect(optimizedImage.props('alt')).toBe('Test image')
    expect(optimizedImage.props('context')).toBe('feature')
    expect(optimizedImage.props('className')).toBe('custom-class')
    expect(optimizedImage.props('showPlaceholder')).toBe(true)
    expect(optimizedImage.props('loading')).toBe('lazy')
  })

  it('emits load event when OptimizedImage loads', async () => {
    wrapper = mount(LazyImage, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
      },
    })

    const optimizedImage = wrapper.findComponent({ name: 'OptimizedImage' })
    const mockEvent = new Event('load')

    await optimizedImage.vm.$emit('load', mockEvent)

    expect(wrapper.emitted('load')).toBeTruthy()
    expect(wrapper.emitted('load')[0][0]).toBe(mockEvent)
  })

  it('emits error event when OptimizedImage fails to load', async () => {
    wrapper = mount(LazyImage, {
      props: {
        src: '/invalid-image.jpg',
        alt: 'Invalid image',
      },
    })

    const optimizedImage = wrapper.findComponent({ name: 'OptimizedImage' })
    const mockEvent = new Event('error')

    await optimizedImage.vm.$emit('error', mockEvent)

    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('error')[0][0]).toBe(mockEvent)
  })

  it('uses default props correctly', () => {
    wrapper = mount(LazyImage, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
      },
    })

    const optimizedImage = wrapper.findComponent({ name: 'OptimizedImage' })
    expect(optimizedImage.props('context')).toBe('feature')
    expect(optimizedImage.props('className')).toBe('')
    expect(optimizedImage.props('showPlaceholder')).toBe(true)
  })

  it('passes through custom context', () => {
    wrapper = mount(LazyImage, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
        context: 'hero',
      },
    })

    const optimizedImage = wrapper.findComponent({ name: 'OptimizedImage' })
    expect(optimizedImage.props('context')).toBe('hero')
  })

  it('passes through custom className', () => {
    wrapper = mount(LazyImage, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
        className: 'rounded-lg shadow-md',
      },
    })

    const optimizedImage = wrapper.findComponent({ name: 'OptimizedImage' })
    expect(optimizedImage.props('className')).toBe('rounded-lg shadow-md')
  })

  it('can disable placeholder', () => {
    wrapper = mount(LazyImage, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
        showPlaceholder: false,
      },
    })

    const optimizedImage = wrapper.findComponent({ name: 'OptimizedImage' })
    expect(optimizedImage.props('showPlaceholder')).toBe(false)
  })
})
