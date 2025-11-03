<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

// Props
interface Props {
  showInProduction?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showInProduction: false,
})

// Composables
const {
  currentLanguage,
  currentLanguageInfo,
  translationCompleteness,
  getMissingKeys,
  terminologyIssues,
  hasTranslationIssues,
} = useI18n()

// State
const showValidationInfo = ref(false)
const showDetails = ref(false)
const showFallbackNotification = ref(false)
const fallbackUsageCount = ref(0)

// Computed
const isDevelopment = computed(() => import.meta.env.DEV || props.showInProduction)

const missingKeys = computed(() => getMissingKeys.value || [])
const missingKeysCount = computed(() => missingKeys.value.length)

const currentTerminologyIssues = computed(() => {
  return terminologyIssues.value[currentLanguage.value] || []
})
const terminologyIssuesCount = computed(() => currentTerminologyIssues.value.length)

const hasIssues = computed(() => {
  return missingKeysCount.value > 0 || terminologyIssuesCount.value > 0
})

// Methods
const toggleValidationInfo = () => {
  showValidationInfo.value = !showValidationInfo.value
}

const dismissFallbackNotification = () => {
  showFallbackNotification.value = false
}

// Watch for translation fallback usage
const trackFallbackUsage = () => {
  // Listen for custom events from the translation system
  window.addEventListener('translation-fallback-used', () => {
    fallbackUsageCount.value++
    if (fallbackUsageCount.value > 0 && !showFallbackNotification.value) {
      showFallbackNotification.value = true
      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        showFallbackNotification.value = false
      }, 10000)
    }
  })
}

// Watch for language changes
watch(
  currentLanguage,
  () => {
    fallbackUsageCount.value = 0
    showFallbackNotification.value = false
    showDetails.value = false
  },
  { immediate: true }
)

// Watch for translation issues
watch(
  hasTranslationIssues,
  hasIssues => {
    if (hasIssues && isDevelopment.value) {
      showValidationInfo.value = true
    }
  },
  { immediate: true }
)

// Lifecycle
onMounted(() => {
  if (isDevelopment.value) {
    trackFallbackUsage()

    // Show validation info if there are issues
    if (hasIssues.value) {
      showValidationInfo.value = true
    }

    // Add keyboard shortcut to toggle validation info
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'T') {
        event.preventDefault()
        toggleValidationInfo()
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }
})
</script>

<template>
  <div
    v-if="showValidationInfo && isDevelopment"
    class="translation-validator"
  >
    <!-- Translation Status Indicator -->
    <div
      class="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-3 max-w-sm"
      :class="{
        'border-green-500': translationCompleteness >= 95,
        'border-yellow-500': translationCompleteness >= 80 && translationCompleteness < 95,
        'border-red-500': translationCompleteness < 80,
      }"
    >
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Translation Status</h4>
        <button
          @click="toggleValidationInfo"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div class="space-y-2">
        <!-- Current Language Info -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-300"
            >{{ currentLanguageInfo?.name || 'Unknown' }}:</span
          >
          <span
            class="font-medium"
            :class="{
              'text-green-600': translationCompleteness >= 95,
              'text-yellow-600': translationCompleteness >= 80 && translationCompleteness < 95,
              'text-red-600': translationCompleteness < 80,
            }"
          >
            {{ translationCompleteness }}%
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-300"
            :class="{
              'bg-green-500': translationCompleteness >= 95,
              'bg-yellow-500': translationCompleteness >= 80 && translationCompleteness < 95,
              'bg-red-500': translationCompleteness < 80,
            }"
            :style="{ width: `${translationCompleteness}%` }"
          />
        </div>

        <!-- Missing Keys Count -->
        <div
          v-if="missingKeysCount > 0"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          {{ missingKeysCount }} missing keys
        </div>

        <!-- Terminology Issues -->
        <div
          v-if="terminologyIssuesCount > 0"
          class="text-xs text-orange-500 dark:text-orange-400"
        >
          {{ terminologyIssuesCount }} terminology issues
        </div>

        <!-- Expand/Collapse Details -->
        <button
          v-if="hasIssues"
          @click="showDetails = !showDetails"
          class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {{ showDetails ? 'Hide Details' : 'Show Details' }}
        </button>
      </div>

      <!-- Detailed Issues -->
      <div
        v-if="showDetails && hasIssues"
        class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600"
      >
        <!-- Missing Keys -->
        <div
          v-if="missingKeys.length > 0"
          class="mb-3"
        >
          <h5 class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Missing Keys:</h5>
          <div class="max-h-32 overflow-y-auto">
            <div
              v-for="key in missingKeys.slice(0, 10)"
              :key="key"
              class="text-xs text-red-600 dark:text-red-400 font-mono"
            >
              {{ key }}
            </div>
            <div
              v-if="missingKeys.length > 10"
              class="text-xs text-gray-500 dark:text-gray-400"
            >
              ... and {{ missingKeys.length - 10 }} more
            </div>
          </div>
        </div>

        <!-- Terminology Issues -->
        <div v-if="currentTerminologyIssues.length > 0">
          <h5 class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Terminology Issues:
          </h5>
          <div class="max-h-32 overflow-y-auto">
            <div
              v-for="issue in currentTerminologyIssues.slice(0, 5)"
              :key="issue"
              class="text-xs text-orange-600 dark:text-orange-400"
            >
              {{ issue }}
            </div>
            <div
              v-if="currentTerminologyIssues.length > 5"
              class="text-xs text-gray-500 dark:text-gray-400"
            >
              ... and {{ currentTerminologyIssues.length - 5 }} more
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fallback Translation Notification -->
    <div
      v-if="showFallbackNotification"
      class="fixed top-4 right-4 z-50 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 max-w-sm"
    >
      <div class="flex items-start">
        <svg
          class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <div>
          <h4 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Translation Fallback
          </h4>
          <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            Some content is displayed in English due to missing translations.
          </p>
        </div>
        <button
          @click="dismissFallbackNotification"
          class="ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
        >
          <svg
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.translation-validator {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Ensure the validator appears above other elements */
.translation-validator > div {
  z-index: 9999;
}

/* Smooth transitions */
.translation-validator * {
  transition: all 0.2s ease-in-out;
}

/* Custom scrollbar for issue lists */
.translation-validator .overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.translation-validator .overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.translation-validator .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.translation-validator .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
