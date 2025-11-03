<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from '@/composables/useI18n'
import Prism from 'prismjs'
import { TEST_IDS } from '@/constants/testIds'

// Import core languages
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'

// Import themes
import 'prismjs/themes/prism.css'
import 'prismjs/themes/prism-tomorrow.css'

interface Props {
  code: string
  language?: string
  filename?: string
  copyable?: boolean
  showLineNumbers?: boolean
  showLanguage?: boolean
  theme?: 'light' | 'dark' | 'auto'
  elevated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: 'text',
  filename: '',
  copyable: true,
  showLineNumbers: false,
  showLanguage: true,
  theme: 'auto',
  elevated: false,
})

const { t } = useI18n()

// State
const codeRef = ref<HTMLElement>()
const copySuccess = ref(false)
const isDarkMode = ref(false)

// Computed
const codeLines = computed(() => {
  return props.code.split('\n')
})

const themeClasses = computed(() => {
  const baseClasses = 'font-mono'

  if (props.theme === 'dark' || (props.theme === 'auto' && isDarkMode.value)) {
    return `${baseClasses} bg-gray-900 text-gray-100`
  }

  return `${baseClasses} bg-gray-50 text-gray-900`
})

const highlightedCode = computed(() => {
  try {
    // Check if language is supported
    const grammar = Prism.languages[props.language]
    if (grammar) {
      return Prism.highlight(props.code, grammar, props.language)
    }

    // Fallback to plain text
    return escapeHtml(props.code)
  } catch (error) {
    console.warn('Syntax highlighting failed:', error)
    return escapeHtml(props.code)
  }
})

// Methods
const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copySuccess.value = true

    // Reset success state after 2 seconds
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)

    // Announce to screen readers
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = t('common.copied')
    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  } catch (error) {
    console.error('Failed to copy code:', error)

    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = props.code
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand('copy')
      if (successful) {
        copySuccess.value = true
        setTimeout(() => {
          copySuccess.value = false
        }, 2000)
      }

      document.body.removeChild(textArea)
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
    }
  }
}

const detectDarkMode = () => {
  if (props.theme === 'auto') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDarkMode.value = mediaQuery.matches

    mediaQuery.addEventListener('change', e => {
      isDarkMode.value = e.matches
    })
  } else {
    isDarkMode.value = props.theme === 'dark'
  }
}

// Lifecycle
onMounted(() => {
  detectDarkMode()

  // Re-highlight code after component is mounted
  nextTick(() => {
    if (codeRef.value) {
      Prism.highlightElement(codeRef.value)
    }
  })
})
</script>

<template>
  <div
    class="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700"
    :class="{ 'shadow-lg': elevated }"
    :data-testid="TEST_IDS.CODE_BLOCK"
  >
    <!-- Header with filename and language -->
    <div
      v-if="filename || showLanguage"
      class="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center space-x-2">
        <div
          v-if="filename"
          class="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{ filename }}
        </div>
        <div
          v-if="showLanguage && language"
          class="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
        >
          {{ language }}
        </div>
      </div>

      <!-- Copy button -->
      <button
        v-if="copyable"
        type="button"
        class="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        :class="{ 'text-green-600 dark:text-green-400': copySuccess }"
        :aria-label="copySuccess ? t('common.copied') : t('common.copy')"
        :data-testid="TEST_IDS.COPY_BUTTON"
        @click="copyCode"
      >
        <svg
          v-if="!copySuccess"
          class="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <svg
          v-else
          class="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        {{ copySuccess ? t('common.copied') : t('common.copy') }}
      </button>
    </div>

    <!-- Code content -->
    <div class="relative">
      <pre
        class="overflow-x-auto p-4 text-sm leading-relaxed"
        :class="themeClasses"
      ><code
        ref="codeRef"
        :class="[`language-${language}`, themeClasses]"
        v-html="highlightedCode"
      ></code></pre>

      <!-- Line numbers (optional) -->
      <div
        v-if="showLineNumbers"
        class="absolute left-0 top-0 p-4 text-sm leading-relaxed text-gray-400 dark:text-gray-600 select-none pointer-events-none"
        aria-hidden="true"
      >
        <div
          v-for="(line, index) in codeLines"
          :key="index"
          class="min-h-[1.25rem]"
        >
          {{ index + 1 }}
        </div>
      </div>
    </div>

    <!-- Copy button overlay (mobile) -->
    <button
      v-if="copyable && !filename && !showLanguage"
      type="button"
      class="absolute top-2 right-2 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      :class="{
        'text-green-600 dark:text-green-400 border-green-200 dark:border-green-600': copySuccess,
      }"
      :aria-label="copySuccess ? t('common.copied') : t('common.copy')"
      @click="copyCode"
    >
      <svg
        v-if="!copySuccess"
        class="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      <svg
        v-else
        class="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* Custom scrollbar for code blocks */
pre::-webkit-scrollbar {
  height: 8px;
}

pre::-webkit-scrollbar-track {
  background-color: #f3f4f6;
}

pre::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 0.25rem;
}

pre::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

/* Line numbers styling */
.line-numbers-rows {
  position: absolute;
  left: 0;
  top: 0;
  padding: 1rem;
  color: #9ca3af;
  user-select: none;
  pointer-events: none;
}

/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  pre {
    font-size: 0.875rem;
  }

  .group:hover .group-hover\:opacity-100 {
    opacity: 1;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border-gray-200 {
    border-color: #111827;
  }

  .text-gray-500 {
    color: #111827;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-opacity,
  .transition-colors {
    transition: none;
  }
}
</style>
