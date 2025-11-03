<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from '@/composables/useI18n'
import type { SupportedLanguage } from '@/types/i18n'
import { TEST_IDS } from '@/constants/testIds'

const { t, currentLanguage, currentLanguageInfo, supportedLanguages, changeLanguage } = useI18n()

// State
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()
const optionRefs = ref<(HTMLElement | null)[]>([])
const focusedIndex = ref(-1)
const buttonId = `language-switcher-${Date.now()}`

// Computed
const currentLanguageIndex = computed(() => {
  return supportedLanguages.value.findIndex(lang => lang.code === currentLanguage.value)
})

// Methods
const setOptionRef = (el: HTMLElement | null, index: number) => {
  optionRefs.value[index] = el
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    focusedIndex.value = currentLanguageIndex.value
    nextTick(() => {
      focusOption(focusedIndex.value)
    })
  }
}

const closeDropdown = () => {
  isOpen.value = false
  focusedIndex.value = -1
}

const selectLanguage = async (langCode: SupportedLanguage) => {
  if (langCode !== currentLanguage.value) {
    // Store current scroll position
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop

    await changeLanguage(langCode)

    // Restore scroll position after language change
    nextTick(() => {
      window.scrollTo(0, scrollPosition)
    })
  }
  closeDropdown()
}

const focusOption = (index: number) => {
  if (index >= 0 && index < optionRefs.value.length) {
    const option = optionRefs.value[index]
    if (option) {
      option.focus()
    }
  }
}

const focusNextOption = () => {
  if (!isOpen.value) {
    toggleDropdown()
    return
  }

  focusedIndex.value = (focusedIndex.value + 1) % supportedLanguages.value.length
  focusOption(focusedIndex.value)
}

const focusPreviousOption = () => {
  if (!isOpen.value) {
    toggleDropdown()
    return
  }

  focusedIndex.value =
    focusedIndex.value <= 0 ? supportedLanguages.value.length - 1 : focusedIndex.value - 1
  focusOption(focusedIndex.value)
}

const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (dropdownRef.value && !dropdownRef.value.contains(target) && isOpen.value) {
    closeDropdown()
  }
}

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

// Touch support for mobile
const handleTouchStart = (event: TouchEvent) => {
  // Prevent default to avoid double-tap zoom on mobile
  if (event.target && (event.target as Element).closest('.language-switcher')) {
    event.preventDefault()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscapeKey)
  document.addEventListener('touchstart', handleTouchStart, { passive: false })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
  document.removeEventListener('touchstart', handleTouchStart)
})
</script>

<template>
  <div
    class="relative inline-block text-left"
    ref="dropdownRef"
    :data-testid="TEST_IDS.LANGUAGE_SWITCHER"
  >
    <div>
      <button
        type="button"
        class="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        :class="{ 'ring-2 ring-blue-500': isOpen }"
        :aria-expanded="isOpen"
        aria-haspopup="true"
        :aria-label="t('nav.language')"
        @click="toggleDropdown"
        @keydown.enter="toggleDropdown"
        @keydown.space.prevent="toggleDropdown"
        @keydown.escape="closeDropdown"
        @keydown.arrow-down.prevent="focusNextOption"
        @keydown.arrow-up.prevent="focusPreviousOption"
      >
        <span
          class="mr-2 text-lg"
          aria-hidden="true"
        >
          {{ currentLanguageInfo?.flag }}
        </span>
        <span class="mr-2">
          {{ currentLanguageInfo?.nativeName }}
        </span>
        <svg
          class="ml-2 -mr-1 h-4 w-4 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
        role="menu"
        aria-orientation="vertical"
        :aria-labelledby="buttonId"
      >
        <div
          class="py-1"
          role="none"
        >
          <button
            v-for="(language, index) in supportedLanguages"
            :key="language.code"
            type="button"
            class="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900 transition-colors duration-150"
            :class="{
              'bg-blue-50 text-blue-700': language.code === currentLanguage,
              'font-medium': language.code === currentLanguage,
            }"
            role="menuitem"
            :tabindex="isOpen ? 0 : -1"
            :aria-current="language.code === currentLanguage ? 'true' : 'false'"
            :ref="el => setOptionRef(el as HTMLElement | null, index)"
            :data-testid="TEST_IDS.LANGUAGE_OPTION"
            :data-lang="language.code"
            @click="selectLanguage(language.code)"
            @keydown.enter="selectLanguage(language.code)"
            @keydown.space.prevent="selectLanguage(language.code)"
            @keydown.escape="closeDropdown"
            @keydown.arrow-down.prevent="focusNextOption"
            @keydown.arrow-up.prevent="focusPreviousOption"
          >
            <span
              class="mr-3 text-lg"
              aria-hidden="true"
            >
              {{ language.flag }}
            </span>
            <div class="flex flex-col items-start">
              <span class="font-medium">{{ language.nativeName }}</span>
              <span class="text-xs text-gray-500">{{ language.name }}</span>
            </div>
            <svg
              v-if="language.code === currentLanguage"
              class="ml-auto h-4 w-4 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Additional mobile-specific styles */
@media (max-width: 768px) {
  .origin-top-right {
    transform-origin: top left;
    left: 0;
    right: auto;
  }
}

/* Focus styles for better accessibility */
button:focus-visible,
[role='menuitem']:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Smooth transitions for mobile touch */
@media (hover: none) and (pointer: coarse) {
  .group:hover {
    background-color: #f3f4f6;
  }

  .transition-colors {
    transition-duration: 0ms;
  }
}
</style>
