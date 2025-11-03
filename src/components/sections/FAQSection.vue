<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Track which FAQs are open
const openFAQs = ref<number[]>([])

// Toggle FAQ open/closed state
const toggleFAQ = (index: number) => {
  const currentIndex = openFAQs.value.indexOf(index)
  if (currentIndex > -1) {
    openFAQs.value.splice(currentIndex, 1)
  } else {
    openFAQs.value.push(index)
  }
}

// FAQ data structure optimized for AI search engines
const faqs = computed(() => [
  {
    question: t('faq.items.whatIs.question'),
    answer: t('faq.items.whatIs.answer'),
    details: [
      t('faq.items.whatIs.details.0'),
      t('faq.items.whatIs.details.1'),
      t('faq.items.whatIs.details.2'),
      t('faq.items.whatIs.details.3'),
    ],
    links: [
      { text: t('faq.items.whatIs.links.features'), url: '#features' },
      { text: t('faq.items.whatIs.links.quickStart'), url: '#quick-start' },
    ],
  },
  {
    question: t('faq.items.free.question'),
    answer: t('faq.items.free.answer'),
    details: [
      t('faq.items.free.details.0'),
      t('faq.items.free.details.1'),
      t('faq.items.free.details.2'),
    ],
    links: [
      {
        text: t('faq.items.free.links.license'),
        url: 'https://www.apache.org/licenses/LICENSE-2.0',
      },
      { text: t('faq.items.free.links.source'), url: 'https://github.com/echonote/echonote' },
    ],
  },
  {
    question: t('faq.items.platforms.question'),
    answer: t('faq.items.platforms.answer'),
    details: [
      t('faq.items.platforms.details.0'),
      t('faq.items.platforms.details.1'),
      t('faq.items.platforms.details.2'),
      t('faq.items.platforms.details.3'),
    ],
    links: [
      {
        text: t('faq.items.platforms.links.download'),
        url: 'https://github.com/echonote/echonote/releases',
      },
      { text: t('faq.items.platforms.links.requirements'), url: '#quick-start' },
    ],
  },
  {
    question: t('faq.items.offline.question'),
    answer: t('faq.items.offline.answer'),
    details: [
      t('faq.items.offline.details.0'),
      t('faq.items.offline.details.1'),
      t('faq.items.offline.details.2'),
      t('faq.items.offline.details.3'),
    ],
    links: [
      { text: t('faq.items.offline.links.privacy'), url: '#features' },
      { text: t('faq.items.offline.links.technical'), url: '#technical' },
    ],
  },
  {
    question: t('faq.items.accuracy.question'),
    answer: t('faq.items.accuracy.answer'),
    details: [
      t('faq.items.accuracy.details.0'),
      t('faq.items.accuracy.details.1'),
      t('faq.items.accuracy.details.2'),
      t('faq.items.accuracy.details.3'),
    ],
    links: [
      { text: t('faq.items.accuracy.links.technical'), url: '#technical' },
      { text: t('faq.items.accuracy.links.performance'), url: '#technical' },
    ],
  },
  {
    question: t('faq.items.privacy.question'),
    answer: t('faq.items.privacy.answer'),
    details: [
      t('faq.items.privacy.details.0'),
      t('faq.items.privacy.details.1'),
      t('faq.items.privacy.details.2'),
      t('faq.items.privacy.details.3'),
    ],
    links: [
      { text: t('faq.items.privacy.links.features'), url: '#features' },
      { text: t('faq.items.privacy.links.security'), url: '/security' },
    ],
  },
  {
    question: t('faq.items.calendar.question'),
    answer: t('faq.items.calendar.answer'),
    details: [
      t('faq.items.calendar.details.0'),
      t('faq.items.calendar.details.1'),
      t('faq.items.calendar.details.2'),
      t('faq.items.calendar.details.3'),
    ],
    links: [
      { text: t('faq.items.calendar.links.setup'), url: '#quick-start' },
      { text: t('faq.items.calendar.links.features'), url: '#features' },
    ],
  },
  {
    question: t('faq.items.languages.question'),
    answer: t('faq.items.languages.answer'),
    details: [
      t('faq.items.languages.details.0'),
      t('faq.items.languages.details.1'),
      t('faq.items.languages.details.2'),
    ],
    links: [
      { text: t('faq.items.languages.links.roadmap'), url: '#community' },
      {
        text: t('faq.items.languages.links.contribute'),
        url: 'https://github.com/echonote/echonote/blob/main/CONTRIBUTING.md',
      },
    ],
  },
  {
    question: t('faq.items.support.question'),
    answer: t('faq.items.support.answer'),
    details: [
      t('faq.items.support.details.0'),
      t('faq.items.support.details.1'),
      t('faq.items.support.details.2'),
      t('faq.items.support.details.3'),
    ],
    links: [
      { text: t('faq.items.support.links.community'), url: '#community' },
      {
        text: t('faq.items.support.links.github'),
        url: 'https://github.com/echonote/echonote/issues',
      },
    ],
  },
  {
    question: t('faq.items.contribute.question'),
    answer: t('faq.items.contribute.answer'),
    details: [
      t('faq.items.contribute.details.0'),
      t('faq.items.contribute.details.1'),
      t('faq.items.contribute.details.2'),
      t('faq.items.contribute.details.3'),
    ],
    links: [
      {
        text: t('faq.items.contribute.links.guide'),
        url: 'https://github.com/echonote/echonote/blob/main/CONTRIBUTING.md',
      },
      { text: t('faq.items.contribute.links.community'), url: '#community' },
    ],
  },
])
</script>

<template>
  <section
    id="faq"
    class="py-16 bg-gray-50 dark:bg-gray-900"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          {{ t('faq.title') }}
        </h2>
        <p class="mt-4 text-xl text-gray-600 dark:text-gray-300">
          {{ t('faq.subtitle') }}
        </p>
      </div>

      <!-- FAQ Items -->
      <div class="max-w-4xl mx-auto">
        <div class="space-y-6">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <button
              @click="toggleFAQ(index)"
              class="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              :aria-expanded="openFAQs.includes(index)"
              :aria-controls="`faq-answer-${index}`"
            >
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ faq.question }}
                </h3>
                <svg
                  class="w-5 h-5 text-gray-500 transform transition-transform duration-200"
                  :class="{ 'rotate-180': openFAQs.includes(index) }"
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
              </div>
            </button>

            <div
              v-show="openFAQs.includes(index)"
              :id="`faq-answer-${index}`"
              class="px-6 pb-4"
            >
              <div class="prose prose-blue max-w-none dark:prose-invert">
                <p
                  class="text-gray-600 dark:text-gray-300"
                  v-html="faq.answer"
                ></p>

                <!-- Additional details for complex answers -->
                <div
                  v-if="faq.details"
                  class="mt-4"
                >
                  <ul class="list-disc list-inside space-y-2">
                    <li
                      v-for="detail in faq.details"
                      :key="detail"
                      class="text-gray-600 dark:text-gray-300"
                    >
                      {{ detail }}
                    </li>
                  </ul>
                </div>

                <!-- Related links -->
                <div
                  v-if="faq.links"
                  class="mt-4 flex flex-wrap gap-2"
                >
                  <a
                    v-for="link in faq.links"
                    :key="link.url"
                    :href="link.url"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ link.text }}
                    <svg
                      class="w-3 h-3 ml-1"
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact for more questions -->
      <div class="mt-12 text-center">
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          {{ t('faq.moreQuestions') }}
        </p>
        <div class="flex justify-center space-x-4">
          <a
            href="https://github.com/echonote/echonote/discussions"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('faq.askCommunity') }}
          </a>
          <a
            href="https://github.com/echonote/echonote/issues"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('faq.reportIssue') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Custom styles for FAQ section */
.prose ul {
  @apply mt-2;
}

.prose li {
  @apply text-sm;
}

/* Smooth transitions for FAQ expansion */
.faq-content {
  transition: max-height 0.3s ease-in-out;
}
</style>
