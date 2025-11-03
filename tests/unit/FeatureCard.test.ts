import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FeatureCard from '@/components/ui/FeatureCard.vue'

// Mock LazyImage component
vi.mock('@/components/common/LazyImage.vue', () => ({
  default: {
    name: 'LazyImage',
    props: ['src', 'alt', 'width', 'height', 'class', 'loading', 'decoding'],
    emits: ['error'],
    template: '<img :src="src" :alt="alt" :class="class" @error="$emit(\'error\', $event)" />',
  },
}))

describe('FeatureCard', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders basic card with title and description', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'This is a test feature description',
      },
    })

    expect(wrapper.text()).toContain('Test Feature')
    expect(wrapper.text()).toContain('This is a test feature description')
  })

  it('renders icon when provided', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        icon: '🚀',
      },
    })

    expect(wrapper.html()).toContain('🚀')
  })

  it('renders highlights list when provided', () => {
    const highlights = ['Feature 1', 'Feature 2', 'Feature 3']
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        highlights,
      },
    })

    highlights.forEach(highlight => {
      expect(wrapper.text()).toContain(highlight)
    })

    // Should have checkmark icons
    expect(wrapper.findAll('svg')).toHaveLength(highlights.length)
  })

  it('renders action button when provided', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        action: {
          text: 'Learn More',
          href: '/learn-more',
        },
      },
    })

    const actionLink = wrapper.find('a')
    expect(actionLink.exists()).toBe(true)
    expect(actionLink.text()).toContain('Learn More')
    expect(actionLink.attributes('href')).toBe('/learn-more')
  })

  it('renders action as button when no href provided', () => {
    const mockOnClick = vi.fn()
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        action: {
          text: 'Click Me',
          onClick: mockOnClick,
        },
      },
    })

    const actionButton = wrapper.find('button')
    expect(actionButton.exists()).toBe(true)
    expect(actionButton.text()).toContain('Click Me')
  })

  it('applies horizontal layout classes', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        layout: 'horizontal',
      },
    })

    expect(wrapper.classes()).toContain('flex-row')
  })

  it('applies grid layout classes', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        layout: 'grid',
      },
    })

    expect(wrapper.classes()).toContain('grid')
    expect(wrapper.classes()).toContain('grid-cols-1')
  })

  it('applies featured variant classes', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        variant: 'featured',
      },
    })

    const content = wrapper.find('.p-8')
    expect(content.exists()).toBe(true)
  })

  it('applies compact variant classes', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        variant: 'compact',
      },
    })

    const content = wrapper.find('.p-4')
    expect(content.exists()).toBe(true)
  })

  it('emits click event when clickable and clicked', async () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        clickable: true,
      },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('handles keyboard interaction when clickable', async () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        clickable: true,
      },
    })

    await wrapper.trigger('keydown.enter')
    expect(wrapper.emitted('click')).toBeTruthy()

    await wrapper.trigger('keydown.space')
    expect(wrapper.emitted('click')).toHaveLength(2)
  })

  it('has proper accessibility attributes when clickable', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        clickable: true,
      },
    })

    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.attributes('aria-label')).toContain('Test Feature')
  })

  it('does not have interactive attributes when not clickable', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        clickable: false,
      },
    })

    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('emits actionClick event when action is clicked', async () => {
    const mockOnClick = vi.fn()
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        action: {
          text: 'Click Me',
          onClick: mockOnClick,
        },
      },
    })

    const actionButton = wrapper.find('button')
    await actionButton.trigger('click')

    expect(wrapper.emitted('actionClick')).toBeTruthy()
    expect(mockOnClick).toHaveBeenCalled()
  })

  it('opens external links in new tab', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        action: {
          text: 'External Link',
          href: 'https://example.com',
          external: true,
        },
      },
    })

    const actionLink = wrapper.find('a')
    expect(actionLink.attributes('target')).toBe('_blank')
    expect(actionLink.attributes('rel')).toBe('noopener noreferrer')
  })

  it('does not open internal links in new tab', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        action: {
          text: 'Internal Link',
          href: '/internal',
          external: false,
        },
      },
    })

    const actionLink = wrapper.find('a')
    expect(actionLink.attributes('target')).toBeUndefined()
    expect(actionLink.attributes('rel')).toBeUndefined()
  })

  it('shows decoration when showDecoration is true', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        showDecoration: true,
      },
    })

    const decoration = wrapper.find('.bg-gradient-to-br')
    expect(decoration.exists()).toBe(true)
  })

  it('hides decoration when showDecoration is false', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        showDecoration: false,
      },
    })

    const decoration = wrapper.find('.bg-gradient-to-br')
    expect(decoration.exists()).toBe(false)
  })

  it('applies full height when fullHeight is true', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        fullHeight: true,
      },
    })

    expect(wrapper.classes()).toContain('h-full')
  })

  it('shows hover indicator when clickable', () => {
    wrapper = mount(FeatureCard, {
      props: {
        title: 'Test Feature',
        description: 'Test description',
        clickable: true,
      },
    })

    const hoverIndicator = wrapper.find('.bg-gradient-to-r')
    expect(hoverIndicator.exists()).toBe(true)
  })
})
