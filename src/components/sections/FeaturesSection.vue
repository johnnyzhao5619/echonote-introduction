<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '@/composables/useI18n'
import FeatureCard from '@/components/ui/FeatureCard.vue'

interface Props {
  showComparison?: boolean
  showUseCases?: boolean
  animateOnScroll?: boolean
}

withDefaults(defineProps<Props>(), {
  showComparison: true,
  showUseCases: true,
  animateOnScroll: true,
})

const { t } = useI18n()

// State for animations and interactions
const activeFeature = ref<string | null>(null)
const comparisonVisible = ref(false)

// Core features data
const coreFeatures = computed(() => [
  {
    id: 'privacy',
    title: t('features.items.privacy.title'),
    description: t('features.items.privacy.description'),
    icon: '🔒',
    highlights: [
      t('features.items.privacy.highlights.0'),
      t('features.items.privacy.highlights.1'),
      t('features.items.privacy.highlights.2'),
      t('features.items.privacy.highlights.3'),
    ],
    image: {
      src: '/images/features/feature-privacy.svg',
      alt: 'Privacy Protection Illustration',
      overlay: true,
    },
    action: {
      text: t('common.learnMore'),
      href: '#privacy-details',
      showArrow: true,
    },
  },
  {
    id: 'local',
    title: t('features.items.local.title'),
    description: t('features.items.local.description'),
    icon: '⚡',
    highlights: [
      t('features.items.local.highlights.0'),
      t('features.items.local.highlights.1'),
      t('features.items.local.highlights.2'),
      t('features.items.local.highlights.3'),
    ],
    image: {
      src: '/images/features/feature-local-processing.svg',
      alt: 'Local Processing Illustration',
      overlay: true,
    },
    action: {
      text: t('common.learnMore'),
      href: '#local-details',
      showArrow: true,
    },
  },
  {
    id: 'smart',
    title: t('features.items.smart.title'),
    description: t('features.items.smart.description'),
    icon: '🧠',
    highlights: [
      t('features.items.smart.highlights.0'),
      t('features.items.smart.highlights.1'),
      t('features.items.smart.highlights.2'),
      t('features.items.smart.highlights.3'),
    ],
    image: {
      src: '/images/features/feature-smart-calendar.svg',
      alt: 'Smart Management Illustration',
      overlay: true,
    },
    action: {
      text: t('common.learnMore'),
      href: '#smart-details',
      showArrow: true,
    },
  },
  {
    id: 'crossPlatform',
    title: t('features.items.crossPlatform.title'),
    description: t('features.items.crossPlatform.description'),
    icon: '🌐',
    highlights: [
      t('features.items.crossPlatform.highlights.0'),
      t('features.items.crossPlatform.highlights.1'),
      t('features.items.crossPlatform.highlights.2'),
      t('features.items.crossPlatform.highlights.3'),
    ],
    image: {
      src: '/images/features/feature-cross-platform.svg',
      alt: 'Cross Platform Support Illustration',
      overlay: true,
    },
    action: {
      text: t('common.learnMore'),
      href: '#platform-details',
      showArrow: true,
    },
  },
])

// Use cases data
const useCases = computed(() => [
  {
    title: 'Meeting Notes & Transcription',
    description:
      'Perfect for professionals who need accurate meeting transcriptions and automatic calendar event creation.',
    icon: '💼',
    users: ['Business Professionals', 'Project Managers', 'Consultants'],
  },
  {
    title: 'Academic Research & Lectures',
    description:
      'Ideal for students and researchers who need to transcribe interviews, lectures, and research sessions.',
    icon: '🎓',
    users: ['Students', 'Researchers', 'Academics'],
  },
  {
    title: 'Content Creation',
    description:
      'Great for content creators who want to quickly convert voice recordings into written content.',
    icon: '🎤',
    users: ['Podcasters', 'Writers', 'Journalists'],
  },
  {
    title: 'Personal Productivity',
    description:
      'Excellent for individuals who prefer voice input for personal notes and task management.',
    icon: '📝',
    users: ['Busy Professionals', 'Personal Users', 'Accessibility Users'],
  },
])

// Comparison data
const comparisonFeatures = computed(() => [
  {
    feature: 'Privacy Protection',
    echonote: '✅ Complete local processing',
    competitors: '❌ Cloud-based processing',
  },
  {
    feature: 'Offline Functionality',
    echonote: '✅ Works completely offline',
    competitors: '❌ Requires internet connection',
  },
  {
    feature: 'Data Security',
    echonote: '✅ No data transmission',
    competitors: '⚠️ Data sent to servers',
  },
  {
    feature: 'Cost',
    echonote: '✅ Free and open source',
    competitors: '💰 Subscription required',
  },
  {
    feature: 'Customization',
    echonote: '✅ Fully customizable',
    competitors: '❌ Limited customization',
  },
])

// Methods
const handleFeatureClick = (featureId: string) => {
  activeFeature.value = activeFeature.value === featureId ? null : featureId
}

const toggleComparison = () => {
  comparisonVisible.value = !comparisonVisible.value
}
</script>

<template>
  <section
    id="features"
    class="py-12 sm:py-16 lg:py-20 bg-white"
  >
    <div class="container-responsive">
      <!-- Section Header -->
      <div class="text-center mb-12 sm:mb-16">
        <h2 class="text-responsive-lg font-bold text-gray-900 mb-3 sm:mb-4">
          {{ t('features.title') }}
        </h2>
        <p class="text-responsive-sm text-gray-600 max-w-3xl mx-auto">
          {{ t('features.subtitle') }}
        </p>
      </div>

      <!-- Core Features Grid -->
      <div class="grid-responsive-2 mb-16 sm:mb-20">
        <FeatureCard
          v-for="feature in coreFeatures"
          :key="feature.id"
          :title="feature.title"
          :description="feature.description"
          :icon="feature.icon"
          :highlights="feature.highlights"
          :image="feature.image"
          :action="feature.action"
          variant="featured"
          clickable
          @click="handleFeatureClick(feature.id)"
          class="transform transition-all duration-300 hover:scale-105"
        />
      </div>

      <!-- Privacy & Security Highlight -->
      <div
        class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 md:p-12 mb-16 sm:mb-20"
      >
        <div class="max-w-4xl mx-auto text-center">
          <div
            class="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4 sm:mb-6"
          >
            <span class="text-2xl sm:text-3xl">🛡️</span>
          </div>
          <h3 class="text-responsive-md font-bold text-gray-900 mb-3 sm:mb-4">
            Privacy-First Architecture
          </h3>
          <p class="text-responsive-sm text-gray-700 mb-6 leading-relaxed">
            Unlike cloud-based solutions, EchoNote processes everything locally on your device. Your
            voice data never leaves your computer, ensuring complete privacy and security for your
            sensitive information.
          </p>
          <div class="grid-responsive-3 mt-6 sm:mt-8">
            <div class="text-center">
              <div class="text-xl sm:text-2xl mb-1 sm:mb-2">🔒</div>
              <h4 class="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                Zero Data Collection
              </h4>
              <p class="text-xs sm:text-sm text-gray-600">
                No personal data is collected or transmitted
              </p>
            </div>
            <div class="text-center">
              <div class="text-xl sm:text-2xl mb-1 sm:mb-2">💾</div>
              <h4 class="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Local Storage</h4>
              <p class="text-xs sm:text-sm text-gray-600">
                All data stored encrypted on your device
              </p>
            </div>
            <div class="text-center">
              <div class="text-xl sm:text-2xl mb-1 sm:mb-2">🌐</div>
              <h4 class="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Offline First</h4>
              <p class="text-xs sm:text-sm text-gray-600">Works completely without internet</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Use Cases Section -->
      <div
        v-if="showUseCases"
        class="mb-16 sm:mb-20"
      >
        <div class="text-center mb-8 sm:mb-12">
          <h3 class="text-responsive-md font-bold text-gray-900 mb-3 sm:mb-4">
            Perfect For Your Workflow
          </h3>
          <p class="text-responsive-sm text-gray-600">
            Discover how EchoNote fits into different professional and personal scenarios
          </p>
        </div>

        <div class="grid-responsive-4">
          <div
            v-for="useCase in useCases"
            :key="useCase.title"
            class="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200"
          >
            <div class="text-2xl sm:text-3xl mb-3 sm:mb-4">{{ useCase.icon }}</div>
            <h4 class="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {{ useCase.title }}
            </h4>
            <p class="text-gray-600 mb-3 sm:mb-4 text-sm">{{ useCase.description }}</p>
            <div class="space-y-1">
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Ideal for:</p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="user in useCase.users"
                  :key="user"
                  class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {{ user }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comparison Table -->
      <div
        v-if="showComparison"
        class="mb-16 sm:mb-20"
      >
        <div class="text-center mb-6 sm:mb-8">
          <h3 class="text-responsive-md font-bold text-gray-900 mb-3 sm:mb-4">
            Why Choose EchoNote?
          </h3>
          <p class="text-responsive-sm text-gray-600 mb-4 sm:mb-6">
            See how EchoNote compares to other voice transcription solutions
          </p>
          <button
            @click="toggleComparison"
            class="btn-primary"
          >
            {{ comparisonVisible ? 'Hide' : 'Show' }} Comparison
            <svg
              class="ml-2 w-4 h-4 transition-transform"
              :class="{ 'rotate-180': comparisonVisible }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <Transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 transform -translate-y-4"
          enter-to-class="opacity-100 transform translate-y-0"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 transform translate-y-0"
          leave-to-class="opacity-0 transform -translate-y-4"
        >
          <div
            v-if="comparisonVisible"
            class="overflow-x-auto"
          >
            <table class="w-full bg-white rounded-xl shadow-lg border border-gray-200">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th class="px-6 py-4 text-center text-sm font-semibold text-blue-600">
                    EchoNote
                  </th>
                  <th class="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                    Other Solutions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="(item, index) in comparisonFeatures"
                  :key="item.feature"
                  :class="{ 'bg-blue-50/50': index % 2 === 0 }"
                >
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ item.feature }}</td>
                  <td class="px-6 py-4 text-sm text-center">{{ item.echonote }}</td>
                  <td class="px-6 py-4 text-sm text-center">{{ item.competitors }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Transition>
      </div>

      <!-- Call to Action -->
      <div class="text-center">
        <div
          class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 md:p-12 text-white"
        >
          <h3 class="text-responsive-md font-bold mb-3 sm:mb-4">
            Ready to Experience Privacy-First Voice Transcription?
          </h3>
          <p class="text-responsive-sm mb-6 sm:mb-8 opacity-90">
            Join thousands of users who trust EchoNote for their voice transcription needs
          </p>
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="https://github.com/johnnyzhao5619/EchoNote/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 touch-target"
            >
              <span class="mr-2">⬇️</span>
              Download Now
            </a>
            <a
              href="https://github.com/johnnyzhao5619/EchoNote"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 touch-target"
            >
              <span class="mr-2">⭐</span>
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Enhanced animations for feature cards */
.transform {
  transition-property: transform, box-shadow;
}

/* Smooth transitions for comparison table */
.transition-all {
  transition-property: all;
}

/* Custom focus styles */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Table responsive improvements */
@media (max-width: 768px) {
  table {
    font-size: 0.875rem;
  }

  th,
  td {
    padding: 0.75rem 0.5rem;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-colors,
  .transform {
    transition: none;
  }

  .hover\:scale-105:hover {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border-gray-200 {
    border-color: #000;
  }

  .text-gray-600 {
    color: #000;
  }

  .bg-blue-50 {
    background-color: #e0e7ff;
  }
}
</style>
