<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import LanguageSwitcher from './LanguageSwitcher.vue'
import { APP_CONFIG } from '@/config/app'
import { TEST_IDS } from '@/constants/testIds'

const { t } = useI18n()

// State
const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)

// Configuration
const githubUrl = APP_CONFIG.github.repoUrl

const navigationItems = [
  { key: 'home', label: 'nav.home', href: '#home' },
  { key: 'features', label: 'nav.features', href: '#features' },
  { key: 'quickStart', label: 'nav.quickStart', href: '#quick-start' },
  { key: 'technical', label: 'nav.technical', href: '#technical' },
  { key: 'community', label: 'nav.community', href: '#community' },
]

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleMobileNavClick = (event: Event) => {
  scrollToSection(event)
  closeMobileMenu()
}

const scrollToSection = (event: Event) => {
  event.preventDefault()
  const target = event.target as HTMLAnchorElement
  const href = target.getAttribute('href')

  if (href && href.startsWith('#')) {
    const sectionId = href.substring(1)
    const element = document.getElementById(sectionId)

    if (element) {
      const navHeight = window.innerWidth < 640 ? 56 : 64 // Responsive nav height
      const elementPosition = element.offsetTop - navHeight

      // Enhanced smooth scrolling with easing
      const startPosition = window.pageYOffset
      const distance = elementPosition - startPosition
      const duration = Math.min(Math.abs(distance) / 2, 800) // Dynamic duration, max 800ms
      let start: number | null = null

      const step = (timestamp: number) => {
        if (!start) start = timestamp
        const progress = timestamp - start
        const percentage = Math.min(progress / duration, 1)

        // Easing function (ease-out-cubic)
        const easeOutCubic = 1 - Math.pow(1 - percentage, 3)

        window.scrollTo(0, startPosition + distance * easeOutCubic)

        if (progress < duration) {
          window.requestAnimationFrame(step)
        }
      }

      window.requestAnimationFrame(step)
    }
  }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  const nav = document.querySelector('nav')

  if (nav && !nav.contains(target) && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

const handleKeyboardNavigation = (event: KeyboardEvent) => {
  // Handle keyboard navigation for accessibility
  if (event.key === 'Tab') {
    // Let default tab behavior work
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    const target = event.target as HTMLElement
    if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
      event.preventDefault()
      scrollToSection(event)
      if (isMobileMenuOpen.value) {
        closeMobileMenu()
      }
    }
  }

  // Arrow key navigation for mobile menu
  if (isMobileMenuOpen.value && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    event.preventDefault()
    const menuItems = document.querySelectorAll('#mobile-menu a')
    const currentIndex = Array.from(menuItems).findIndex(item => item === document.activeElement)

    let nextIndex = currentIndex
    if (event.key === 'ArrowDown') {
      nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1
    }

    ;(menuItems[nextIndex] as HTMLElement).focus()
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscapeKey)
  document.addEventListener('keydown', handleKeyboardNavigation)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
  document.removeEventListener('keydown', handleKeyboardNavigation)
})
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all duration-300"
    :class="{ 'shadow-md': isScrolled }"
    role="navigation"
    aria-label="Main navigation"
  >
    <div class="container-responsive">
      <div class="flex items-center justify-between h-14 sm:h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center space-x-2 sm:space-x-3">
          <div class="flex-shrink-0">
            <img
              src="@/assets/logo.svg"
              alt="EchoNote Logo"
              class="h-6 w-6 sm:h-8 sm:w-8"
              width="32"
              height="32"
            />
          </div>
          <div class="text-lg sm:text-xl font-bold text-gray-900 truncate">
            {{ t('hero.title') }}
          </div>
        </div>

        <!-- Desktop Navigation -->
        <div
          class="hidden md:block"
          role="menubar"
        >
          <div class="ml-6 lg:ml-10 flex items-baseline space-x-4 lg:space-x-8">
            <a
              v-for="item in navigationItems"
              :key="item.key"
              :href="item.href"
              class="text-gray-700 hover:text-blue-600 active:text-blue-700 px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md touch-target relative overflow-hidden group"
              role="menuitem"
              :aria-label="t(item.label)"
              @click="scrollToSection"
            >
              <span class="relative z-10">{{ t(item.label) }}</span>
              <span
                class="absolute inset-0 bg-blue-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-md"
              ></span>
            </a>
          </div>
        </div>

        <!-- Desktop Language Switcher and GitHub -->
        <div class="hidden md:flex items-center space-x-4">
          <LanguageSwitcher />
          <a
            :href="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-700 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
            :aria-label="t('nav.github')"
          >
            <svg
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            id="mobile-menu-button"
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200 touch-target"
            :aria-expanded="isMobileMenuOpen"
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
            :data-testid="TEST_IDS.MOBILE_MENU_BUTTON"
            @click="toggleMobileMenu"
          >
            <svg
              class="h-6 w-6 transition-transform duration-200"
              :class="{ 'rotate-90': isMobileMenuOpen }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                v-if="!isMobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        id="mobile-menu"
        class="md:hidden bg-white border-t border-gray-200 shadow-lg"
        role="menu"
        aria-labelledby="mobile-menu-button"
        :data-testid="TEST_IDS.MOBILE_MENU"
      >
        <div class="px-2 pt-2 pb-3 space-y-1">
          <a
            v-for="item in navigationItems"
            :key="item.key"
            :href="item.href"
            class="text-gray-700 hover:text-blue-600 active:text-blue-700 hover:bg-gray-50 active:bg-gray-100 block px-4 py-3 text-base font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-target transform active:scale-95"
            role="menuitem"
            :aria-label="t(item.label)"
            @click="handleMobileNavClick"
          >
            {{ t(item.label) }}
          </a>
        </div>

        <!-- Mobile Language Switcher and GitHub -->
        <div class="px-2 pt-2 pb-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <LanguageSwitcher />
            </div>
            <a
              :href="githubUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="ml-4 text-gray-700 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
              :aria-label="t('nav.github')"
            >
              <svg
                class="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>
