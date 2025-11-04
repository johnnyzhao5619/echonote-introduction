<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useGitHubApi } from '@/composables/useGitHubApi'
import { useStaggeredAnimations, useSmoothScroll } from '@/composables/useUI'
import { formatNumber } from '@/utils/common'
import { getCtaButtonTestId, TEST_IDS } from '@/constants/testIds'

// Props
interface Props {
  showStats?: boolean
  animateFeatures?: boolean
  repository?: string
}

const props = withDefaults(defineProps<Props>(), {
  showStats: true,
  animateFeatures: true,
  repository: 'echonote/echonote',
})

const { t } = useI18n()

// GitHub API composable
const {
  stats: githubStats,
  isLoading,
  error,
  fetchStats,
  refreshStats,
} = useGitHubApi(props.repository)

// Scroll animations
const { containerRef: statsContainerRef } = useStaggeredAnimations(4, {
  animationClass: 'animate-slide-up',
  staggerDelay: 150,
})

const { scrollToElement } = useSmoothScroll()

// State
const currentFeatureIndex = ref(0)
let featureInterval: number | null = null

// Computed
const features = computed(() => [
  t('hero.features.0'),
  t('hero.features.1'),
  t('hero.features.2'),
  t('hero.features.3'),
  t('hero.features.4'),
])

const ctaButtons = computed(() => [
  {
    text: t('hero.downloadButton'),
    href: `https://github.com/${props.repository}/releases/latest`,
    variant: 'primary' as const,
    external: true,
    icon: '⬇️',
  },
  {
    text: t('hero.docsButton'),
    href: `https://github.com/${props.repository}#readme`,
    variant: 'secondary' as const,
    external: true,
    icon: '📚',
  },
  {
    text: t('hero.githubButton'),
    href: `https://github.com/${props.repository}`,
    variant: 'secondary' as const,
    external: true,
    icon: '⭐',
  },
])

const currentFeature = computed(() => {
  if (features.value.length === 0) return ''
  return features.value[currentFeatureIndex.value] || ''
})

// Methods
const startFeatureAnimation = (): void => {
  if (!props.animateFeatures || features.value.length <= 1) return

  if (featureInterval !== null) {
    window.clearInterval(featureInterval)
    featureInterval = null
  }

  featureInterval = window.setInterval(() => {
    currentFeatureIndex.value = (currentFeatureIndex.value + 1) % features.value.length
  }, 3000)
}

const retry = (): void => {
  refreshStats()
}

// Lifecycle
onMounted(() => {
  if (props.showStats) {
    fetchStats()
  }
  startFeatureAnimation()
})

onBeforeUnmount(() => {
  if (featureInterval !== null) {
    window.clearInterval(featureInterval)
    featureInterval = null
  }
})
</script>

<template>
  <section
    id="home"
    class="relative min-h-screen-small sm:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50"
    role="banner"
    aria-labelledby="hero-title"
  >
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
      ></div>
      <div
        class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"
      ></div>
      <div
        class="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"
      ></div>
    </div>

    <div class="relative z-10 container-responsive py-16 sm:py-20 lg:py-24">
      <div class="text-center">
        <!-- Main title -->
        <h1
          id="hero-title"
          class="text-responsive-xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight px-2"
        >
          <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {{ t('hero.title') }}
          </span>
        </h1>

        <!-- Tagline -->
        <p class="text-responsive-lg text-gray-700 mb-6 sm:mb-8 font-medium max-w-4xl mx-auto px-2">
          {{ t('hero.tagline') }}
        </p>

        <!-- Description -->
        <p
          class="text-responsive-sm text-gray-600 mb-8 sm:mb-12 max-w-5xl mx-auto leading-relaxed px-2"
        >
          {{ t('hero.description') }}
        </p>

        <!-- Animated feature highlight -->
        <div
          v-if="props.animateFeatures && features.length > 0"
          class="mb-8 sm:mb-12 px-2"
        >
          <div
            class="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 max-w-full"
          >
            <span class="text-lg sm:text-2xl mr-2 sm:mr-3 flex-shrink-0">✨</span>
            <Transition
              mode="out-in"
              enter-active-class="transition-all duration-500 ease-out"
              enter-from-class="opacity-0 transform translate-y-2"
              enter-to-class="opacity-100 transform translate-y-0"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="opacity-100 transform translate-y-0"
              leave-to-class="opacity-0 transform -translate-y-2"
            >
              <span
                :key="currentFeatureIndex"
                class="text-gray-800 font-medium text-sm sm:text-base text-center"
              >
                {{ currentFeature }}
              </span>
            </Transition>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div
          class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-2"
        >
          <a
            v-for="button in ctaButtons"
            :key="button.text"
            :href="button.href"
            :target="button.external ? '_blank' : undefined"
            :rel="button.external ? 'noopener noreferrer' : undefined"
            class="group inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 touch-target"
            :class="{
              'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl focus:ring-blue-500':
                button.variant === 'primary',
              'bg-white text-gray-800 border-2 border-gray-300 shadow-md hover:shadow-lg hover:border-gray-400 focus:ring-gray-500':
                button.variant === 'secondary',
            }"
            :data-testid="getCtaButtonTestId(button.text)"
          >
            <span class="mr-2">{{ button.icon }}</span>
            {{ button.text }}
            <svg
              v-if="button.external"
              class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>

        <!-- GitHub Stats -->
        <div
          v-if="props.showStats"
          class="max-w-4xl mx-auto px-2"
          role="region"
          aria-labelledby="stats-heading"
        >
          <h2
            id="stats-heading"
            class="sr-only"
          >
            Project Statistics
          </h2>

          <div
            v-if="isLoading"
            class="flex justify-center items-center py-6 sm:py-8"
            role="status"
            aria-live="polite"
          >
            <div
              class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"
              aria-hidden="true"
            ></div>
            <span class="ml-3 text-gray-600 text-sm sm:text-base">{{ t('common.loading') }}</span>
          </div>

          <div
            v-else-if="error"
            class="text-center py-6 sm:py-8"
            role="alert"
            aria-live="assertive"
          >
            <p class="text-gray-500 mb-4 text-sm sm:text-base">{{ t('common.error') }}</p>
            <button
              @click="retry"
              class="btn-primary"
              aria-describedby="retry-description"
            >
              {{ t('common.retry') }}
            </button>
            <div
              id="retry-description"
              class="sr-only"
            >
              Retry loading project statistics
            </div>
          </div>

          <div
            v-else-if="githubStats"
            ref="statsContainerRef"
            class="grid-responsive-4"
            role="list"
            aria-label="Project statistics"
            :data-testid="TEST_IDS.STATS_DISPLAY"
          >
            <div
              v-for="(stat, key) in {
                stars: { label: t('hero.stats.stars'), value: githubStats.stars, icon: '⭐' },
                forks: { label: t('hero.stats.forks'), value: githubStats.forks, icon: '🍴' },
                contributors: {
                  label: t('hero.stats.contributors'),
                  value: githubStats.contributors,
                  icon: '👥',
                },
                releases: {
                  label: t('hero.stats.releases'),
                  value: githubStats.releases,
                  icon: '🚀',
                },
              }"
              :key="key"
              data-animate-item
              class="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center opacity-0"
              role="listitem"
              :aria-label="`${stat.label}: ${formatNumber(stat.value)}`"
              :data-testid="TEST_IDS.STAT_ITEM"
            >
              <div
                class="text-2xl sm:text-3xl mb-1 sm:mb-2"
                aria-hidden="true"
              >
                {{ stat.icon }}
              </div>
              <div class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {{ formatNumber(stat.value) }}
              </div>
              <div class="text-xs sm:text-sm text-gray-600 font-medium">
                {{ stat.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
      <button
        @click="scrollToElement('#features')"
        class="p-2 rounded-full hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Scroll to features section"
      >
        <svg
          class="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
