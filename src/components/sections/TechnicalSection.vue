<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useGitHubApi } from '@/composables/useGitHubApi'
import { getBadgeColor } from '@/utils/common'
import { APP_CONFIG } from '@/config/app'

interface Props {
  showArchitecture?: boolean
  showTechStack?: boolean
  showPerformance?: boolean
  showQualityBadges?: boolean
  repository?: string
}

const props = withDefaults(defineProps<Props>(), {
  showArchitecture: true,
  showTechStack: true,
  showPerformance: true,
  showQualityBadges: true,
  repository: 'echonote/echonote',
})

const { t } = useI18n()

// GitHub API integration
const { stats: githubStats, isLoading: githubLoading, fetchStats } = useGitHubApi(props.repository)

// State
const activeArchitectureComponent = ref<string | null>(null)
const selectedTechCategory = ref<'core' | 'ai' | 'integration' | 'development'>('core')

// Architecture components
const architectureComponents = computed(() => [
  {
    id: 'speech-engine',
    title: 'Speech Recognition Engine',
    description: 'Advanced local speech processing using OpenAI Whisper models',
    icon: '🎤',
    technologies: ['OpenAI Whisper', 'PyTorch', 'NumPy'],
    features: [
      'Multi-language support',
      'Real-time processing',
      'Noise reduction',
      'Speaker diarization',
    ],
    position: { x: 20, y: 20 },
  },
  {
    id: 'nlp-processor',
    title: 'Natural Language Processing',
    description: 'Intelligent text analysis and event extraction',
    icon: '🧠',
    technologies: ['spaCy', 'NLTK', 'dateutil'],
    features: [
      'Named entity recognition',
      'Date/time extraction',
      'Intent classification',
      'Context understanding',
    ],
    position: { x: 60, y: 20 },
  },
  {
    id: 'calendar-integration',
    title: 'Calendar Integration Layer',
    description: 'Seamless integration with calendar applications',
    icon: '📅',
    technologies: ['CalDAV', 'Exchange API', 'Google Calendar API'],
    features: [
      'Multi-calendar support',
      'Event creation/modification',
      'Conflict detection',
      'Sync management',
    ],
    position: { x: 20, y: 60 },
  },
  {
    id: 'storage-system',
    title: 'Local Storage System',
    description: 'Secure local data management and encryption',
    icon: '💾',
    technologies: ['SQLite', 'SQLAlchemy', 'Cryptography'],
    features: ['Encrypted storage', 'Data versioning', 'Backup/restore', 'Privacy protection'],
    position: { x: 60, y: 60 },
  },
  {
    id: 'ui-framework',
    title: 'User Interface Framework',
    description: 'Cross-platform desktop application interface',
    icon: '🖥️',
    technologies: ['PyQt6', 'QML', 'Qt Designer'],
    features: [
      'Native look & feel',
      'Responsive design',
      'Accessibility support',
      'Theme customization',
    ],
    position: { x: 40, y: 40 },
  },
])

// Technology stack categories
const techStackCategories = computed(() => ({
  core: {
    title: 'Core Technologies',
    icon: '⚙️',
    items: [
      {
        name: 'Python',
        version: '3.8+',
        description: 'Main programming language for application logic',
        icon: '🐍',
        usage: 'Core application development',
        links: {
          official: 'https://python.org',
          docs: 'https://docs.python.org',
        },
      },
      {
        name: 'PyQt6',
        version: '6.4+',
        description: 'Cross-platform GUI toolkit for desktop applications',
        icon: '🖼️',
        usage: 'User interface framework',
        links: {
          official: 'https://www.qt.io/qt-for-python',
          docs: 'https://doc.qt.io/qtforpython/',
        },
      },
      {
        name: 'SQLite',
        version: '3.35+',
        description: 'Lightweight embedded database for local storage',
        icon: '🗄️',
        usage: 'Local data persistence',
        links: {
          official: 'https://sqlite.org',
          docs: 'https://sqlite.org/docs.html',
        },
      },
    ],
  },
  ai: {
    title: 'AI & Machine Learning',
    icon: '🤖',
    items: [
      {
        name: 'OpenAI Whisper',
        version: 'Latest',
        description: 'State-of-the-art speech recognition model',
        icon: '🎯',
        usage: 'Speech-to-text conversion',
        links: {
          official: 'https://openai.com/research/whisper',
          github: 'https://github.com/openai/whisper',
        },
      },
      {
        name: 'spaCy',
        version: '3.4+',
        description: 'Industrial-strength natural language processing',
        icon: '📝',
        usage: 'Text analysis and NLP tasks',
        links: {
          official: 'https://spacy.io',
          docs: 'https://spacy.io/usage',
        },
      },
      {
        name: 'PyTorch',
        version: '1.12+',
        description: 'Deep learning framework for AI model execution',
        icon: '🔥',
        usage: 'Neural network inference',
        links: {
          official: 'https://pytorch.org',
          docs: 'https://pytorch.org/docs',
        },
      },
    ],
  },
  integration: {
    title: 'Integration & APIs',
    icon: '🔗',
    items: [
      {
        name: 'CalDAV',
        version: 'RFC 4791',
        description: 'Calendar access protocol for calendar integration',
        icon: '📆',
        usage: 'Calendar synchronization',
        links: {
          spec: 'https://tools.ietf.org/html/rfc4791',
          docs: 'https://caldav.org',
        },
      },
      {
        name: 'Requests',
        version: '2.28+',
        description: 'HTTP library for API communications',
        icon: '🌐',
        usage: 'External API integration',
        links: {
          official: 'https://requests.readthedocs.io',
          docs: 'https://requests.readthedocs.io/en/latest/',
        },
      },
      {
        name: 'Cryptography',
        version: '3.4+',
        description: 'Cryptographic recipes and primitives',
        icon: '🔐',
        usage: 'Data encryption and security',
        links: {
          official: 'https://cryptography.io',
          docs: 'https://cryptography.io/en/latest/',
        },
      },
    ],
  },
  development: {
    title: 'Development Tools',
    icon: '🛠️',
    items: [
      {
        name: 'pytest',
        version: '7.0+',
        description: 'Testing framework for Python applications',
        icon: '🧪',
        usage: 'Unit and integration testing',
        links: {
          official: 'https://pytest.org',
          docs: 'https://docs.pytest.org',
        },
      },
      {
        name: 'Black',
        version: '22.0+',
        description: 'Code formatter for consistent Python style',
        icon: '⚫',
        usage: 'Code formatting',
        links: {
          official: 'https://black.readthedocs.io',
          github: 'https://github.com/psf/black',
        },
      },
      {
        name: 'mypy',
        version: '0.991+',
        description: 'Static type checker for Python',
        icon: '🔍',
        usage: 'Type checking and validation',
        links: {
          official: 'https://mypy.readthedocs.io',
          docs: 'https://mypy.readthedocs.io/en/stable/',
        },
      },
    ],
  },
}))

// Performance metrics
const performanceMetrics = computed(() => [
  {
    category: 'Speech Recognition',
    metrics: [
      {
        name: 'Real-time Factor',
        value: APP_CONFIG.performance.speechRecognition.realTimeFactor,
        description: 'Processing speed relative to audio length',
      },
      {
        name: 'Accuracy',
        value: APP_CONFIG.performance.speechRecognition.accuracy,
        description: 'Word-level transcription accuracy',
      },
      {
        name: 'Latency',
        value: APP_CONFIG.performance.speechRecognition.latency,
        description: 'Time from speech end to text output',
      },
      {
        name: 'Languages',
        value: APP_CONFIG.performance.speechRecognition.languages,
        description: 'Supported languages and dialects',
      },
    ],
  },
  {
    category: 'Application Performance',
    metrics: [
      {
        name: 'Startup Time',
        value: APP_CONFIG.performance.application.startupTime,
        description: 'Time to fully load application',
      },
      {
        name: 'Memory Usage',
        value: APP_CONFIG.performance.application.memoryUsage,
        description: 'RAM consumption during operation',
      },
      {
        name: 'CPU Usage',
        value: APP_CONFIG.performance.application.cpuUsage,
        description: 'Processor utilization during transcription',
      },
      {
        name: 'Storage',
        value: APP_CONFIG.performance.application.storage,
        description: 'Disk space required for installation',
      },
    ],
  },
  {
    category: 'Data Processing',
    metrics: [
      {
        name: 'Event Extraction',
        value: APP_CONFIG.performance.dataProcessing.eventExtraction,
        description: 'Accuracy of calendar event detection',
      },
      {
        name: 'Processing Speed',
        value: APP_CONFIG.performance.dataProcessing.processingSpeed,
        description: 'Text processing throughput',
      },
      {
        name: 'Batch Size',
        value: APP_CONFIG.performance.dataProcessing.batchSize,
        description: 'Maximum audio file size supported',
      },
      {
        name: 'Concurrent Tasks',
        value: APP_CONFIG.performance.dataProcessing.concurrentTasks,
        description: 'Simultaneous processing capabilities',
      },
    ],
  },
])

// Quality badges and metrics
const qualityBadges = computed(() => [
  {
    name: 'Build Status',
    status: 'passing',
    color: 'green',
    url: `https://github.com/${props.repository}/actions`,
    description: 'Continuous integration status',
  },
  {
    name: 'Test Coverage',
    status: '85%',
    color: 'green',
    url: `https://codecov.io/gh/${props.repository}`,
    description: 'Code coverage percentage',
  },
  {
    name: 'Code Quality',
    status: 'A',
    color: 'green',
    url: `https://codeclimate.com/github/${props.repository}`,
    description: 'Code maintainability score',
  },
  {
    name: 'Security',
    status: 'No Issues',
    color: 'green',
    url: `https://snyk.io/test/github/${props.repository}`,
    description: 'Security vulnerability scan',
  },
  {
    name: 'Dependencies',
    status: 'Up to Date',
    color: 'green',
    url: `https://dependabot.com`,
    description: 'Dependency update status',
  },
  {
    name: 'License',
    status: 'Apache 2.0',
    color: 'blue',
    url: `https://github.com/${props.repository}/blob/main/LICENSE`,
    description: 'Open source license',
  },
])

// Developer resources
const developerResources = computed(() => [
  {
    title: 'API Documentation',
    description: 'Complete API reference and integration guides',
    icon: '📚',
    href: `https://github.com/${props.repository}/wiki/API-Documentation`,
    type: 'documentation',
  },
  {
    title: 'Developer Guide',
    description: 'Setup instructions and development workflow',
    icon: '👨‍💻',
    href: `https://github.com/${props.repository}/wiki/Developer-Guide`,
    type: 'guide',
  },
  {
    title: 'Architecture Overview',
    description: 'System design and component interactions',
    icon: '🏗️',
    href: `https://github.com/${props.repository}/wiki/Architecture`,
    type: 'architecture',
  },
  {
    title: 'Contributing Guidelines',
    description: 'How to contribute code, documentation, and translations',
    icon: '🤝',
    href: `https://github.com/${props.repository}/blob/main/CONTRIBUTING.md`,
    type: 'contributing',
  },
  {
    title: 'Plugin Development',
    description: 'Create custom plugins and extensions',
    icon: '🔌',
    href: `https://github.com/${props.repository}/wiki/Plugin-Development`,
    type: 'plugin',
  },
  {
    title: 'Testing Guide',
    description: 'Testing strategies and test suite documentation',
    icon: '🧪',
    href: `https://github.com/${props.repository}/wiki/Testing`,
    type: 'testing',
  },
])

// Methods
const selectArchitectureComponent = (componentId: string) => {
  activeArchitectureComponent.value =
    activeArchitectureComponent.value === componentId ? null : componentId
}

const selectTechCategory = (category: 'core' | 'ai' | 'integration' | 'development') => {
  selectedTechCategory.value = category
}

// Lifecycle
onMounted(() => {
  if (props.showQualityBadges) {
    fetchStats()
  }
})
</script>

<template>
  <section
    id="technical"
    class="py-20 px-4 sm:px-6 lg:px-8 bg-white"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {{ t('technical.title') }}
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ t('technical.subtitle') }}
        </p>
      </div>

      <!-- Architecture Overview -->
      <div
        v-if="showArchitecture"
        class="mb-20"
      >
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          {{ t('technical.architecture.title') }}
        </h3>
        <p class="text-gray-600 text-center mb-12 max-w-4xl mx-auto">
          {{ t('technical.architecture.description') }}
        </p>

        <!-- Interactive Architecture Diagram -->
        <div class="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
          <div class="relative h-96 md:h-80">
            <!-- Architecture Components -->
            <div
              v-for="component in architectureComponents"
              :key="component.id"
              class="absolute cursor-pointer transform transition-all duration-300 hover:scale-105"
              :style="`left: ${component.position.x}%; top: ${component.position.y}%;`"
              @click="selectArchitectureComponent(component.id)"
            >
              <div
                class="bg-white rounded-xl p-4 shadow-lg border-2 transition-all duration-300 min-w-32 text-center"
                :class="{
                  'border-blue-500 ring-2 ring-blue-200':
                    activeArchitectureComponent === component.id,
                  'border-gray-200 hover:border-blue-300':
                    activeArchitectureComponent !== component.id,
                }"
              >
                <div class="text-2xl mb-2">{{ component.icon }}</div>
                <h4 class="text-sm font-semibold text-gray-900 leading-tight">
                  {{ component.title }}
                </h4>
              </div>
            </div>

            <!-- Connection Lines -->
            <svg
              class="absolute inset-0 w-full h-full pointer-events-none"
              style="z-index: 1"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#6b7280"
                  />
                </marker>
              </defs>
              <!-- Example connections -->
              <line
                x1="30%"
                y1="35%"
                x2="50%"
                y2="45%"
                stroke="#6b7280"
                stroke-width="2"
                marker-end="url(#arrowhead)"
                stroke-dasharray="5,5"
              />
              <line
                x1="70%"
                y1="35%"
                x2="50%"
                y2="45%"
                stroke="#6b7280"
                stroke-width="2"
                marker-end="url(#arrowhead)"
                stroke-dasharray="5,5"
              />
              <line
                x1="30%"
                y1="75%"
                x2="50%"
                y2="55%"
                stroke="#6b7280"
                stroke-width="2"
                marker-end="url(#arrowhead)"
                stroke-dasharray="5,5"
              />
              <line
                x1="70%"
                y1="75%"
                x2="50%"
                y2="55%"
                stroke="#6b7280"
                stroke-width="2"
                marker-end="url(#arrowhead)"
                stroke-dasharray="5,5"
              />
            </svg>
          </div>
        </div>

        <!-- Component Details -->
        <Transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 transform -translate-y-4"
          enter-to-class="opacity-100 transform translate-y-0"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 transform translate-y-0"
          leave-to-class="opacity-0 transform -translate-y-4"
        >
          <div
            v-if="activeArchitectureComponent"
            class="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div
              v-for="component in architectureComponents.filter(
                c => c.id === activeArchitectureComponent
              )"
              :key="component.id"
              class="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <div class="flex items-center mb-4">
                  <span class="text-3xl mr-3">{{ component.icon }}</span>
                  <h4 class="text-xl font-bold text-gray-900">{{ component.title }}</h4>
                </div>
                <p class="text-gray-600 mb-4">{{ component.description }}</p>
                <div class="space-y-2">
                  <h5 class="font-semibold text-gray-900">Key Features:</h5>
                  <ul class="space-y-1">
                    <li
                      v-for="feature in component.features"
                      :key="feature"
                      class="flex items-center text-sm text-gray-700"
                    >
                      <svg
                        class="w-4 h-4 text-green-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      {{ feature }}
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <h5 class="font-semibold text-gray-900 mb-3">Technologies Used:</h5>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tech in component.technologies"
                    :key="tech"
                    class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {{ tech }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Technology Stack -->
      <div
        v-if="showTechStack"
        class="mb-20"
      >
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          {{ t('technical.techStack.title') }}
        </h3>
        <p class="text-gray-600 text-center mb-12">
          {{ t('technical.techStack.subtitle') }}
        </p>

        <!-- Category Tabs -->
        <div class="flex justify-center mb-8">
          <div class="inline-flex bg-gray-100 rounded-xl p-1">
            <button
              v-for="(category, key) in techStackCategories"
              :key="key"
              @click="selectTechCategory(key as 'core' | 'ai' | 'integration' | 'development')"
              class="flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :class="{
                'bg-white text-blue-600 shadow-sm': selectedTechCategory === key,
                'text-gray-600 hover:text-gray-900': selectedTechCategory !== key,
              }"
            >
              <span class="mr-2">{{ category.icon }}</span>
              {{ category.title }}
            </button>
          </div>
        </div>

        <!-- Technology Items -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="item in techStackCategories[selectedTechCategory].items"
            :key="item.name"
            class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
          >
            <div class="flex items-center mb-4">
              <span class="text-2xl mr-3">{{ item.icon }}</span>
              <div>
                <h4 class="text-lg font-semibold text-gray-900">{{ item.name }}</h4>
                <p class="text-sm text-blue-600">{{ item.version }}</p>
              </div>
            </div>
            <p class="text-gray-600 mb-3 text-sm">{{ item.description }}</p>
            <p class="text-xs text-gray-500 mb-4">{{ item.usage }}</p>
            <div class="flex flex-wrap gap-2">
              <a
                v-for="(url, linkType) in item.links"
                :key="linkType"
                :href="url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
              >
                {{ linkType }}
                <svg
                  class="ml-1 w-3 h-3"
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

      <!-- Performance Metrics -->
      <div
        v-if="showPerformance"
        class="mb-20"
      >
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          {{ t('technical.performance.title') }}
        </h3>
        <p class="text-gray-600 text-center mb-12">
          {{ t('technical.performance.subtitle') }}
        </p>

        <div class="space-y-8">
          <div
            v-for="category in performanceMetrics"
            :key="category.category"
            class="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <h4 class="text-xl font-semibold text-gray-900 mb-6">{{ category.category }}</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                v-for="metric in category.metrics"
                :key="metric.name"
                class="text-center p-4 bg-gray-50 rounded-lg"
              >
                <div class="text-2xl font-bold text-blue-600 mb-2">{{ metric.value }}</div>
                <div class="text-sm font-medium text-gray-900 mb-1">{{ metric.name }}</div>
                <div class="text-xs text-gray-600">{{ metric.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quality Badges -->
      <div
        v-if="showQualityBadges"
        class="mb-20"
      >
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Code Quality & Status</h3>
        <p class="text-gray-600 text-center mb-8">Real-time project health and quality metrics</p>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <a
            v-for="badge in qualityBadges"
            :key="badge.name"
            :href="badge.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group text-center p-4 bg-white rounded-lg border-2 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="getBadgeColor(badge.color)"
            :title="badge.description"
          >
            <div class="text-sm font-medium mb-1">{{ badge.name }}</div>
            <div class="text-xs font-bold">{{ badge.status }}</div>
          </a>
        </div>

        <!-- GitHub Stats Integration -->
        <div
          v-if="githubStats && !githubLoading"
          class="mt-8 text-center"
        >
          <div
            class="inline-flex items-center space-x-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ githubStats.stars }}</div>
              <div class="text-sm text-gray-600">Stars</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ githubStats.forks }}</div>
              <div class="text-sm text-gray-600">Forks</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ githubStats.contributors }}</div>
              <div class="text-sm text-gray-600">Contributors</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ githubStats.releases }}</div>
              <div class="text-sm text-gray-600">Releases</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Developer Resources -->
      <div class="mb-12">
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Developer Resources</h3>
        <p class="text-gray-600 text-center mb-8">
          Comprehensive documentation and guides for developers
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            v-for="resource in developerResources"
            :key="resource.title"
            :href="resource.href"
            target="_blank"
            rel="noopener noreferrer"
            class="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div class="flex items-center mb-4">
              <span class="text-2xl mr-3">{{ resource.icon }}</span>
              <h4
                class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
              >
                {{ resource.title }}
              </h4>
            </div>
            <p class="text-gray-600 text-sm mb-4">{{ resource.description }}</p>
            <div class="flex items-center text-blue-600 text-sm font-medium">
              Read more
              <svg
                class="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1"
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
            </div>
          </a>
        </div>
      </div>

      <!-- Technical CTA -->
      <div class="text-center">
        <div
          class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white"
        >
          <h3 class="text-2xl md:text-3xl font-bold mb-4">Ready to Dive Deeper?</h3>
          <p class="text-lg mb-8 opacity-90">
            Explore the technical documentation and start contributing to EchoNote
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              :href="`https://github.com/${repository}/wiki`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
            >
              <span class="mr-2">📚</span>
              View Documentation
            </a>
            <a
              :href="`https://github.com/${repository}`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
            >
              <span class="mr-2">💻</span>
              View Source Code
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Architecture diagram styling */
.architecture-component {
  transition: all 0.3s ease;
}

.architecture-component:hover {
  transform: scale(1.05);
}

/* Badge color transitions */
.transition-all {
  transition-property: all;
}

/* Custom focus styles */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .grid-cols-6 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .architecture-diagram {
    height: 300px;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-colors,
  .transition-transform {
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

  .bg-gray-50 {
    background-color: #f0f0f0;
  }
}

/* Print styles */
@media print {
  .bg-gradient-to-r,
  .bg-gradient-to-br {
    background: #333 !important;
    color: white !important;
  }

  .shadow-lg,
  .shadow-md,
  .shadow-sm {
    box-shadow: none !important;
    border: 1px solid #000 !important;
  }

  .interactive-elements {
    display: none !important;
  }
}
</style>
