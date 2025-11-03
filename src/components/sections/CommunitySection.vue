<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useGitHubApi } from '@/composables/useGitHubApi'
import { formatNumber, getStatusColor, getPriorityColor, getDifficultyColor } from '@/utils/common'
import { APP_CONFIG } from '@/config/app'

interface Props {
  showContributors?: boolean
  showSupport?: boolean
  showRoadmap?: boolean
  showStats?: boolean
  repository?: string
}

const props = withDefaults(defineProps<Props>(), {
  showContributors: true,
  showSupport: true,
  showRoadmap: true,
  showStats: true,
  repository: 'echonote/echonote',
})

const { t } = useI18n()

// GitHub API integration
const {
  stats: githubStats,
  contributors,
  isLoading: githubLoading,
  error: githubError,
  fetchStats,
  fetchContributors,
} = useGitHubApi(props.repository)

// State
// const selectedSupportChannel = ref<string | null>(null) // Reserved for future use
const showAllContributors = ref(false)

// Support channels
const supportChannels = computed(() => [
  {
    id: 'github-issues',
    title: 'GitHub Issues',
    description: t('community.support.channels.github'),
    icon: '🐛',
    href: `https://github.com/${props.repository}/issues`,
    color: 'bg-red-50 border-red-200 text-red-800',
    stats: { open: 12, closed: 156 },
    responseTime: '< 24 hours',
  },
  {
    id: 'discussions',
    title: 'GitHub Discussions',
    description: t('community.support.channels.discussions'),
    icon: '💬',
    href: `https://github.com/${props.repository}/discussions`,
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    stats: { active: 45, answered: 89 },
    responseTime: '< 12 hours',
  },
  {
    id: 'documentation',
    title: 'Documentation',
    description: t('community.support.channels.docs'),
    icon: '📚',
    href: `https://github.com/${props.repository}/wiki`,
    color: 'bg-green-50 border-green-200 text-green-800',
    stats: { pages: 25, updated: 'Weekly' },
    responseTime: 'Self-service',
  },
  {
    id: 'email',
    title: 'Email Support',
    description: t('community.support.channels.email'),
    icon: '📧',
    href: 'mailto:support@echonote.dev',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    stats: { response: '< 48h', priority: 'High' },
    responseTime: '< 48 hours',
  },
])

// Contribution ways
const contributionWays = computed(() => [
  {
    title: 'Code Contributions',
    description: 'Submit bug fixes, new features, and improvements',
    icon: '💻',
    difficulty: 'Intermediate',
    timeCommitment: '2-10 hours',
    skills: ['Python', 'PyQt', 'Git'],
    href: `https://github.com/${props.repository}/blob/main/CONTRIBUTING.md#code-contributions`,
    examples: [
      'Fix reported bugs',
      'Implement new features',
      'Optimize performance',
      'Add unit tests',
    ],
  },
  {
    title: 'Documentation',
    description: 'Improve guides, tutorials, and API documentation',
    icon: '📝',
    difficulty: 'Beginner',
    timeCommitment: '1-5 hours',
    skills: ['Writing', 'Markdown', 'Technical Communication'],
    href: `https://github.com/${props.repository}/blob/main/CONTRIBUTING.md#documentation`,
    examples: ['Write user guides', 'Create tutorials', 'Update API docs', 'Fix typos and errors'],
  },
  {
    title: 'Translation',
    description: 'Help translate EchoNote into different languages',
    icon: '🌍',
    difficulty: 'Beginner',
    timeCommitment: '2-8 hours',
    skills: ['Language Skills', 'Cultural Awareness'],
    href: `https://github.com/${props.repository}/blob/main/CONTRIBUTING.md#translations`,
    examples: [
      'Translate UI text',
      'Localize documentation',
      'Review translations',
      'Add new languages',
    ],
  },
  {
    title: 'Testing & QA',
    description: 'Test new features and report issues',
    icon: '🧪',
    difficulty: 'Beginner',
    timeCommitment: '1-4 hours',
    skills: ['Attention to Detail', 'Bug Reporting'],
    href: `https://github.com/${props.repository}/blob/main/CONTRIBUTING.md#testing`,
    examples: ['Test beta releases', 'Report bugs', 'Verify fixes', 'Performance testing'],
  },
  {
    title: 'Design & UX',
    description: 'Improve user interface and user experience',
    icon: '🎨',
    difficulty: 'Intermediate',
    timeCommitment: '3-12 hours',
    skills: ['UI/UX Design', 'Figma', 'User Research'],
    href: `https://github.com/${props.repository}/blob/main/CONTRIBUTING.md#design`,
    examples: ['Design new features', 'Improve accessibility', 'Create mockups', 'User research'],
  },
  {
    title: 'Community Support',
    description: 'Help other users and build the community',
    icon: '🤝',
    difficulty: 'Beginner',
    timeCommitment: '1-3 hours',
    skills: ['Communication', 'Problem Solving'],
    href: `https://github.com/${props.repository}/discussions`,
    examples: ['Answer questions', 'Help troubleshoot', 'Share experiences', 'Welcome newcomers'],
  },
])

// Development roadmap
const roadmapItems = computed(() => [
  {
    phase: 'Current (v1.2)',
    status: 'in-progress',
    items: [
      { title: 'Multi-language speech recognition', status: 'completed', priority: 'high' },
      { title: 'Advanced calendar integrations', status: 'in-progress', priority: 'high' },
      { title: 'Performance optimizations', status: 'in-progress', priority: 'medium' },
      { title: 'Bug fixes and stability', status: 'ongoing', priority: 'high' },
    ],
  },
  {
    phase: 'Next Release (v1.3)',
    status: 'planned',
    items: [
      { title: 'Plugin system architecture', status: 'planned', priority: 'high' },
      { title: 'Custom vocabulary support', status: 'planned', priority: 'medium' },
      { title: 'Batch processing features', status: 'planned', priority: 'medium' },
      { title: 'Enhanced accessibility', status: 'planned', priority: 'high' },
    ],
  },
  {
    phase: 'Future (v2.0)',
    status: 'research',
    items: [
      { title: 'Mobile companion app', status: 'research', priority: 'medium' },
      { title: 'Cloud sync (optional)', status: 'research', priority: 'low' },
      { title: 'AI-powered insights', status: 'research', priority: 'medium' },
      { title: 'Team collaboration features', status: 'research', priority: 'low' },
    ],
  },
])

// Community stats
const communityStats = computed(() => [
  {
    label: 'Active Contributors',
    value: contributors.value?.length || 0,
    icon: '👥',
    description: 'Regular code contributors',
  },
  {
    label: 'GitHub Stars',
    value: githubStats.value?.stars || 0,
    icon: '⭐',
    description: 'Community appreciation',
  },
  {
    label: 'Total Downloads',
    value: APP_CONFIG.communityStats.totalDownloads,
    icon: '⬇️',
    description: 'Across all platforms',
  },
  {
    label: 'Languages Supported',
    value: APP_CONFIG.communityStats.languagesSupported,
    icon: '🌍',
    description: 'Speech recognition languages',
  },
  {
    label: 'Issues Resolved',
    value: APP_CONFIG.communityStats.issuesResolved,
    icon: '✅',
    description: 'Community-reported issues',
  },
  {
    label: 'Documentation Pages',
    value: APP_CONFIG.communityStats.documentationPages,
    icon: '📚',
    description: 'Comprehensive guides',
  },
])

// Social links
const socialLinks = computed(() => [
  {
    name: 'GitHub',
    icon: '🐙',
    href: APP_CONFIG.github.repoUrl,
    description: 'Source code and issues',
    followers: githubStats.value?.stars || 0,
  },
  {
    name: 'Twitter',
    icon: '🐦',
    href: APP_CONFIG.links.social.twitter,
    description: 'Updates and announcements',
    followers: APP_CONFIG.communityStats.socialFollowers.twitter,
  },
  {
    name: 'Discord',
    icon: '💬',
    href: APP_CONFIG.links.social.discord,
    description: 'Real-time community chat',
    followers: APP_CONFIG.communityStats.socialFollowers.discord,
  },
  {
    name: 'Reddit',
    icon: '🤖',
    href: APP_CONFIG.links.social.reddit,
    description: 'Community discussions',
    followers: APP_CONFIG.communityStats.socialFollowers.reddit,
  },
])

// Methods (unused but kept for future functionality)
// const selectSupportChannel = (channelId: string) => {
//   selectedSupportChannel.value =
//     selectedSupportChannel.value === channelId ? null : channelId
// }

const toggleContributors = () => {
  showAllContributors.value = !showAllContributors.value
}

// Lifecycle
onMounted(() => {
  if (props.showStats || props.showContributors) {
    fetchStats()
  }
  if (props.showContributors) {
    fetchContributors()
  }
})
</script>

<template>
  <section
    id="community"
    class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {{ t('community.title') }}
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ t('community.subtitle') }}
        </p>
      </div>

      <!-- Community Stats -->
      <div
        v-if="showStats"
        class="mb-16"
      >
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div
            v-for="stat in communityStats"
            :key="stat.label"
            class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-all duration-300"
          >
            <div class="text-3xl mb-2">{{ stat.icon }}</div>
            <div class="text-2xl font-bold text-gray-900 mb-1">
              {{ typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value }}
            </div>
            <div class="text-sm font-medium text-gray-900 mb-1">{{ stat.label }}</div>
            <div class="text-xs text-gray-600">{{ stat.description }}</div>
          </div>
        </div>
      </div>

      <!-- Contributors Section -->
      <div
        v-if="showContributors"
        class="mb-16"
      >
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          {{ t('community.contributors.title') }}
        </h3>
        <p class="text-gray-600 text-center mb-8">
          {{ t('community.contributors.description') }}
        </p>

        <div
          v-if="githubLoading"
          class="flex justify-center items-center py-12"
        >
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Loading contributors...</span>
        </div>

        <div
          v-else-if="contributors && contributors.length > 0"
          class="text-center"
        >
          <!-- Contributors Grid -->
          <div class="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4 mb-8">
            <a
              v-for="contributor in showAllContributors ? contributors : contributors.slice(0, 24)"
              :key="contributor.login"
              :href="contributor.html_url"
              target="_blank"
              rel="noopener noreferrer"
              class="group relative"
              :title="`${contributor.login} - ${contributor.contributions} contributions`"
            >
              <img
                :src="contributor.avatar_url"
                :alt="contributor.login"
                class="w-12 h-12 rounded-full border-2 border-gray-200 group-hover:border-blue-500 transition-all duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <div
                class="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
              >
                {{ contributor.contributions > 99 ? '99+' : contributor.contributions }}
              </div>
            </a>
          </div>

          <!-- Show More/Less Button -->
          <button
            v-if="contributors.length > 24"
            @click="toggleContributors"
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {{ showAllContributors ? 'Show Less' : `Show All ${contributors.length} Contributors` }}
            <svg
              class="ml-2 w-4 h-4 transition-transform"
              :class="{ 'rotate-180': showAllContributors }"
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

        <div
          v-else-if="githubError"
          class="text-center py-8"
        >
          <p class="text-gray-500 mb-4">Unable to load contributors</p>
          <button
            @click="fetchContributors"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Support Channels -->
      <div
        v-if="showSupport"
        class="mb-16"
      >
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          {{ t('community.support.title') }}
        </h3>
        <p class="text-gray-600 text-center mb-8">
          {{ t('community.support.description') }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            v-for="channel in supportChannels"
            :key="channel.id"
            :href="channel.href"
            target="_blank"
            rel="noopener noreferrer"
            class="group bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="channel.color"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center">
                <span class="text-2xl mr-3">{{ channel.icon }}</span>
                <h4 class="text-lg font-semibold">{{ channel.title }}</h4>
              </div>
              <span class="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                {{ channel.responseTime }}
              </span>
            </div>
            <p class="text-sm mb-4 opacity-90">{{ channel.description }}</p>
            <div class="flex items-center justify-between text-xs">
              <div class="flex space-x-4">
                <span
                  v-for="(value, key) in channel.stats"
                  :key="key"
                >
                  <strong>{{ value }}</strong> {{ key }}
                </span>
              </div>
              <svg
                class="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
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
            </div>
          </a>
        </div>
      </div>

      <!-- How to Contribute -->
      <div class="mb-16">
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          {{ t('community.contribute.title') }}
        </h3>
        <p class="text-gray-600 text-center mb-8">
          {{ t('community.contribute.description') }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="way in contributionWays"
            :key="way.title"
            class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
          >
            <div class="flex items-center mb-4">
              <span class="text-2xl mr-3">{{ way.icon }}</span>
              <h4 class="text-lg font-semibold text-gray-900">{{ way.title }}</h4>
            </div>
            <p class="text-gray-600 text-sm mb-4">{{ way.description }}</p>

            <!-- Metadata -->
            <div class="space-y-2 mb-4">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">Difficulty:</span>
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getDifficultyColor(way.difficulty)"
                >
                  {{ way.difficulty }}
                </span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">Time:</span>
                <span class="text-gray-700">{{ way.timeCommitment }}</span>
              </div>
            </div>

            <!-- Skills -->
            <div class="mb-4">
              <p class="text-xs text-gray-500 mb-2">Skills needed:</p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="skill in way.skills"
                  :key="skill"
                  class="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {{ skill }}
                </span>
              </div>
            </div>

            <!-- Examples -->
            <div class="mb-4">
              <p class="text-xs text-gray-500 mb-2">Examples:</p>
              <ul class="space-y-1">
                <li
                  v-for="example in way.examples.slice(0, 2)"
                  :key="example"
                  class="flex items-start text-xs text-gray-700"
                >
                  <svg
                    class="flex-shrink-0 w-3 h-3 text-green-500 mt-0.5 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ example }}
                </li>
              </ul>
            </div>

            <!-- Action -->
            <a
              :href="way.href"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
            >
              Get Started
              <svg
                class="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Development Roadmap -->
      <div
        v-if="showRoadmap"
        class="mb-16"
      >
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          {{ t('community.roadmap.title') }}
        </h3>
        <p class="text-gray-600 text-center mb-8">
          {{ t('community.roadmap.description') }}
        </p>

        <div class="space-y-8">
          <div
            v-for="phase in roadmapItems"
            :key="phase.phase"
            class="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div class="flex items-center mb-6">
              <h4 class="text-xl font-semibold text-gray-900 mr-4">{{ phase.phase }}</h4>
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="getStatusColor(phase.status)"
              >
                {{ phase.status.replace('-', ' ') }}
              </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="item in phase.items"
                :key="item.title"
                class="flex items-start p-4 bg-gray-50 rounded-lg border-l-4"
                :class="getPriorityColor(item.priority)"
              >
                <div class="flex-1">
                  <h5 class="font-medium text-gray-900 mb-1">{{ item.title }}</h5>
                  <div class="flex items-center space-x-2">
                    <span
                      class="px-2 py-1 rounded text-xs font-medium"
                      :class="getStatusColor(item.status)"
                    >
                      {{ item.status.replace('-', ' ') }}
                    </span>
                    <span class="text-xs text-gray-500">{{ item.priority }} priority</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Social Links -->
      <div class="mb-12">
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Connect With Us</h3>
        <p class="text-gray-600 text-center mb-8">
          Follow EchoNote on social media for updates and community discussions
        </p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <a
            v-for="social in socialLinks"
            :key="social.name"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            class="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-300 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div class="text-3xl mb-3">{{ social.icon }}</div>
            <h4
              class="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors"
            >
              {{ social.name }}
            </h4>
            <p class="text-sm text-gray-600 mb-2">{{ social.description }}</p>
            <div class="text-sm font-medium text-blue-600">
              {{
                typeof social.followers === 'number'
                  ? formatNumber(social.followers)
                  : social.followers
              }}
              followers
            </div>
          </a>
        </div>
      </div>

      <!-- Community CTA -->
      <div class="text-center">
        <div
          class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white"
        >
          <h3 class="text-2xl md:text-3xl font-bold mb-4">Join the EchoNote Community</h3>
          <p class="text-lg mb-8 opacity-90">
            Be part of building the future of privacy-first voice transcription
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              :href="`https://github.com/${repository}`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            >
              <span class="mr-2">⭐</span>
              Star on GitHub
            </a>
            <a
              :href="`https://github.com/${repository}/blob/main/CONTRIBUTING.md`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            >
              <span class="mr-2">🤝</span>
              Start Contributing
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Contributor avatar hover effects */
.group:hover img {
  transform: scale(1.1);
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
}

/* Custom focus styles */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Responsive grid adjustments */
@media (max-width: 768px) {
  .grid-cols-12 {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .grid-cols-8 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-colors,
  .transition-transform {
    transition: none;
  }

  .group:hover img {
    transform: none;
  }

  .hover\:scale-110:hover {
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

  .bg-gray-50 {
    background-color: #f0f0f0;
  }
}

/* Print styles */
@media print {
  .bg-gradient-to-r {
    background: #333 !important;
    color: white !important;
  }

  .shadow-lg,
  .shadow-md,
  .shadow-sm {
    box-shadow: none !important;
    border: 1px solid #000 !important;
  }

  .hover\:shadow-md:hover {
    box-shadow: none !important;
  }
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
