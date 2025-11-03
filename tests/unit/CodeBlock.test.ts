import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CodeBlock from '@/components/common/CodeBlock.vue'

// Mock useI18n composable
const mockUseI18n = {
  t: vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'common.copy': 'Copy',
      'common.copied': 'Copied!',
    }
    return translations[key] || key
  }),
}

vi.mock('@/composables/useI18n', () => ({
  useI18n: () => mockUseI18n,
}))

describe('CodeBlock', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders code content correctly', () => {
    const code = 'console.log("Hello World")'
    wrapper = mount(CodeBlock, {
      props: {
        code,
        language: 'javascript',
      },
    })

    expect(wrapper.find('code').exists()).toBe(true)
    expect(wrapper.find('pre').exists()).toBe(true)
    expect(wrapper.html()).toContain('Hello World')
  })

  it('shows filename when provided', () => {
    wrapper = mount(CodeBlock, {
      props: {
        code: 'test code',
        filename: 'test.js',
      },
    })

    expect(wrapper.text()).toContain('test.js')
  })

  it('shows language badge when showLanguage is true', () => {
    wrapper = mount(CodeBlock, {
      props: {
        code: 'test code',
        language: 'python',
        showLanguage: true,
      },
    })

    expect(wrapper.text()).toContain('python')
  })

  it('shows copy button when copyable is true', () => {
    wrapper = mount(CodeBlock, {
      props: {
        code: 'test code',
        copyable: true,
      },
    })

    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toContain('Copy')
  })

  it('hides copy button when copyable is false', () => {
    wrapper = mount(CodeBlock, {
      props: {
        code: 'test code',
        copyable: false,
      },
    })

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('copies code to clipboard when copy button is clicked', async () => {
    const code = 'console.log("test")'
    wrapper = mount(CodeBlock, {
      props: {
        code,
        copyable: true,
      },
    })

    const copyButton = wrapper.find('button')
    await copyButton.trigger('click')

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(code)
  })

  it('shows success state after copying', async () => {
    wrapper = mount(CodeBlock, {
      props: {
        code: 'test code',
        copyable: true,
      },
    })

    const copyButton = wrapper.find('button')
    await copyButton.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('Copied!')
  })

  it('resets success state after timeout', async () => {
    vi.useFakeTimers()

    wrapper = mount(CodeBlock, {
      props: {
        code: 'test code',
        copyable: true,
      },
    })

    const copyButton = wrapper.find('button')
    await copyButton.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('Copied!')

    vi.advanceTimersByTime(2100)
    await nextTick()

    expect(wrapper.text()).toContain('Copy')

    vi.useRealTimers()
  })

  it('falls back to execCommand when clipboard API fails', async () => {
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('Clipboard failed'))

    const code = 'test code'
    wrapper = mount(CodeBlock, {
      props: {
        code,
        copyable: true,
      },
    })

    const copyButton = wrapper.find('button')
    await copyButton.trigger('click')

    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })

  it('applies correct theme classes', () => {
    wrapper = mount(CodeBlock, {
      props: {
        code: 'test code',
        theme: 'dark',
      },
    })

    const pre = wrapper.find('pre')
    expect(pre.classes()).toContain('bg-gray-900')
    expect(pre.classes()).toContain('text-gray-100')
  })

  it('applies light theme classes', () => {
    wrapper = mount(CodeBlock, {
      props: {
        code: 'test code',
        theme: 'light',
      },
    })

    const pre = wrapper.find('pre')
    expect(pre.classes()).toContain('bg-gray-50')
    expect(pre.classes()).toContain('text-gray-900')
  })

  it('shows line numbers when enabled', () => {
    wrapper = mount(CodeBlock, {
      props: {
        code: 'line 1\nline 2\nline 3',
        showLineNumbers: true,
      },
    })

    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  it('handles syntax highlighting errors gracefully', () => {
    // Mock Prism to return safe fallback
    global.Prism.highlight = vi.fn().mockImplementation((code: string) => {
      return code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    })

    wrapper = mount(CodeBlock, {
      props: {
        code: 'test code',
        language: 'invalid',
      },
    })

    expect(wrapper.find('code').exists()).toBe(true)
  })

  it('escapes HTML in code content', () => {
    const code = '<script>alert("xss")</script>'
    wrapper = mount(CodeBlock, {
      props: {
        code,
        language: 'text',
      },
    })

    expect(wrapper.find('script').exists()).toBe(false)
    expect(wrapper.html()).toContain('&lt;script&gt;')
  })

  it('has proper accessibility attributes', () => {
    wrapper = mount(CodeBlock, {
      props: {
        code: 'test code',
        copyable: true,
      },
    })

    const copyButton = wrapper.find('button')
    expect(copyButton.attributes('aria-label')).toBe('Copy')
    expect(copyButton.attributes('type')).toBe('button')
  })

  it('announces copy success to screen readers', async () => {
    wrapper = mount(CodeBlock, {
      props: {
        code: 'test code',
        copyable: true,
      },
    })

    const copyButton = wrapper.find('button')
    await copyButton.trigger('click')

    const announcement = document.querySelector('[aria-live="polite"]')
    expect(announcement).toBeTruthy()
    expect(announcement?.textContent).toBe('Copied!')
  })
})
