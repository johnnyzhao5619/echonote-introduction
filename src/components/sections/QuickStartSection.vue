<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import CodeBlock from '@/components/common/CodeBlock.vue'
import { APP_CONFIG } from '@/config/app'

interface Props {
  showSystemRequirements?: boolean
  showConfiguration?: boolean
  detectOS?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSystemRequirements: true,
  showConfiguration: true,
  detectOS: true,
})

const { t } = useI18n()

// State
const selectedPlatform = ref<'windows' | 'macos' | 'linux'>('windows')
const currentStep = ref(0)

// Platform detection
const detectPlatform = (): 'windows' | 'macos' | 'linux' => {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('mac')) return 'macos'
  if (userAgent.includes('linux')) return 'linux'
  return 'windows'
}

// Installation commands for different platforms
const installationCommands = computed(() => ({
  windows: {
    download: `# Download the latest Windows installer
curl -L -o echonote-setup.exe ${APP_CONFIG.downloads.windows}`,
    install: `# Run the installer
./echonote-setup.exe`,
    launch: `# Launch EchoNote
echonote`,
    alternative: `# Alternative: Install via winget
winget install EchoNote.EchoNote`,
  },
  macos: {
    download: `# Download the latest macOS installer
curl -L -o echonote.dmg ${APP_CONFIG.downloads.macos}`,
    install: `# Mount and install
hdiutil attach echonote.dmg
cp -R "/Volumes/EchoNote/EchoNote.app" /Applications/
hdiutil detach "/Volumes/EchoNote"`,
    launch: `# Launch EchoNote
open -a EchoNote`,
    alternative: `# Alternative: Install via Homebrew
brew install --cask echonote`,
  },
  linux: {
    download: `# Download the latest Linux package
wget ${APP_CONFIG.downloads.linux}`,
    install: `# Install the package (Ubuntu/Debian)
sudo dpkg -i echonote-linux-x64.deb
sudo apt-get install -f`,
    launch: `# Launch EchoNote
echonote`,
    alternative: `# Alternative: Install via snap
sudo snap install echonote`,
  },
}))

// Installation steps
const installationSteps = computed(() => [
  {
    id: 'download',
    title: t('quickStart.installation.steps.download'),
    description: 'Download the latest release for your platform',
    icon: '⬇️',
    command: installationCommands.value[selectedPlatform.value].download,
  },
  {
    id: 'install',
    title: t('quickStart.installation.steps.install'),
    description: 'Run the installer or extract the package',
    icon: '📦',
    command: installationCommands.value[selectedPlatform.value].install,
  },
  {
    id: 'launch',
    title: t('quickStart.installation.steps.launch'),
    description: 'Start the application',
    icon: '🚀',
    command: installationCommands.value[selectedPlatform.value].launch,
  },
  {
    id: 'configure',
    title: t('quickStart.installation.steps.configure'),
    description: 'Set up your preferences and start using EchoNote',
    icon: '⚙️',
    command: '# Configuration will be guided through the UI',
  },
])

// System requirements
const systemRequirements = computed(() => [
  {
    category: 'Operating System',
    windows: APP_CONFIG.systemRequirements.windows.os,
    macos: APP_CONFIG.systemRequirements.macos.os,
    linux: APP_CONFIG.systemRequirements.linux.os,
  },
  {
    category: 'Memory',
    windows: APP_CONFIG.systemRequirements.windows.memory,
    macos: APP_CONFIG.systemRequirements.macos.memory,
    linux: APP_CONFIG.systemRequirements.linux.memory,
  },
  {
    category: 'Storage',
    windows: APP_CONFIG.systemRequirements.windows.storage,
    macos: APP_CONFIG.systemRequirements.macos.storage,
    linux: APP_CONFIG.systemRequirements.linux.storage,
  },
  {
    category: 'Audio',
    windows: APP_CONFIG.systemRequirements.windows.audio,
    macos: APP_CONFIG.systemRequirements.macos.audio,
    linux: APP_CONFIG.systemRequirements.linux.audio,
  },
  {
    category: 'Additional',
    windows: APP_CONFIG.systemRequirements.windows.additional,
    macos: APP_CONFIG.systemRequirements.macos.additional,
    linux: APP_CONFIG.systemRequirements.linux.additional,
  },
])

// Configuration steps
const configurationSteps = computed(() => [
  {
    title: 'Microphone Setup',
    description: 'Configure your microphone for optimal voice recognition',
    icon: '🎤',
    details: [
      'Test microphone input levels',
      'Adjust noise cancellation settings',
      'Set up push-to-talk if preferred',
      'Configure voice activation threshold',
    ],
  },
  {
    title: 'Calendar Integration',
    description: 'Connect your calendar applications for smart scheduling',
    icon: '📅',
    details: [
      'Connect to Google Calendar, Outlook, or local calendar',
      'Set default calendar for new events',
      'Configure event creation preferences',
      'Set up notification preferences',
    ],
  },
  {
    title: 'Transcription Preferences',
    description: 'Customize transcription settings for your needs',
    icon: '📝',
    details: [
      'Select preferred language models',
      'Configure punctuation and formatting',
      'Set up custom vocabulary',
      'Adjust transcription accuracy vs speed',
    ],
  },
  {
    title: 'Privacy Settings',
    description: 'Configure privacy and data handling preferences',
    icon: '🔒',
    details: [
      'Review local data storage settings',
      'Configure automatic cleanup policies',
      'Set up backup preferences',
      'Review security settings',
    ],
  },
])

// Troubleshooting links
const troubleshootingLinks = computed(() => [
  {
    title: 'Installation Issues',
    description: 'Common installation problems and solutions',
    href: APP_CONFIG.links.support.troubleshooting,
    icon: '🔧',
  },
  {
    title: 'Audio Setup Guide',
    description: 'Microphone configuration and audio troubleshooting',
    href: APP_CONFIG.links.support.audioSetup,
    icon: '🎤',
  },
  {
    title: 'Performance Optimization',
    description: 'Tips for optimal performance on your system',
    href: APP_CONFIG.links.support.performance,
    icon: '⚡',
  },
  {
    title: 'FAQ',
    description: 'Frequently asked questions and answers',
    href: APP_CONFIG.links.support.faq,
    icon: '❓',
  },
])

// Methods
const selectPlatform = (platform: 'windows' | 'macos' | 'linux') => {
  selectedPlatform.value = platform
  currentStep.value = 0
}

const nextStep = () => {
  if (currentStep.value < installationSteps.value.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'windows':
      return '🪟'
    case 'macos':
      return '🍎'
    case 'linux':
      return '🐧'
    default:
      return '💻'
  }
}

// Lifecycle
onMounted(() => {
  if (props.detectOS) {
    selectedPlatform.value = detectPlatform()
  }
})
</script>

<template>
  <section
    id="quick-start"
    class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {{ t('quickStart.title') }}
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ t('quickStart.subtitle') }}
        </p>
      </div>

      <!-- Platform Selection -->
      <div class="mb-12">
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          {{ t('quickStart.installation.title') }}
        </h3>
        <p class="text-gray-600 text-center mb-8">
          {{ t('quickStart.installation.subtitle') }}
        </p>

        <!-- Platform Tabs -->
        <div class="flex justify-center mb-8">
          <div class="inline-flex bg-white rounded-xl p-1 shadow-lg border border-gray-200">
            <button
              v-for="platform in ['windows', 'macos', 'linux']"
              :key="platform"
              @click="selectPlatform(platform as 'windows' | 'macos' | 'linux')"
              class="flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :class="{
                'bg-blue-600 text-white shadow-md': selectedPlatform === platform,
                'text-gray-600 hover:text-gray-900 hover:bg-gray-50': selectedPlatform !== platform,
              }"
            >
              <span class="mr-2 text-lg">{{ getPlatformIcon(platform) }}</span>
              {{ t(`quickStart.installation.platforms.${platform}`) }}
            </button>
          </div>
        </div>

        <!-- Installation Steps -->
        <div class="max-w-4xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div
              v-for="(step, index) in installationSteps"
              :key="step.id"
              class="relative"
            >
              <!-- Step Card -->
              <div
                class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
                :class="{
                  'ring-2 ring-blue-500 border-blue-200': currentStep === index,
                  'opacity-50': currentStep < index,
                }"
              >
                <!-- Step Number -->
                <div class="flex items-center mb-4">
                  <div
                    class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-3"
                    :class="{
                      'bg-blue-600 text-white': currentStep >= index,
                      'bg-gray-200 text-gray-600': currentStep < index,
                    }"
                  >
                    {{ index + 1 }}
                  </div>
                  <span class="text-2xl">{{ step.icon }}</span>
                </div>

                <!-- Step Content -->
                <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ step.title }}</h4>
                <p class="text-sm text-gray-600 mb-4">{{ step.description }}</p>

                <!-- Command Block -->
                <div class="mt-4">
                  <CodeBlock
                    :code="step.command"
                    language="bash"
                    :filename="`step-${index + 1}.sh`"
                    copyable
                    compact
                  />
                </div>
              </div>

              <!-- Connection Line -->
              <div
                v-if="index < installationSteps.length - 1"
                class="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-300 transform -translate-y-1/2"
                :class="{ 'bg-blue-500': currentStep > index }"
              />
            </div>
          </div>

          <!-- Step Navigation -->
          <div class="flex justify-center space-x-4">
            <button
              @click="prevStep"
              :disabled="currentStep === 0"
              class="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>
            <button
              @click="nextStep"
              :disabled="currentStep === installationSteps.length - 1"
              class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Next
              <svg
                class="w-4 h-4 ml-2"
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
            </button>
          </div>

          <!-- Alternative Installation -->
          <div class="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h4 class="text-lg font-semibold text-blue-900 mb-2">Alternative Installation</h4>
            <CodeBlock
              :code="installationCommands[selectedPlatform].alternative"
              language="bash"
              filename="alternative-install.sh"
              copyable
              compact
            />
          </div>
        </div>
      </div>

      <!-- System Requirements -->
      <div
        v-if="showSystemRequirements"
        class="mb-12"
      >
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          {{ t('quickStart.requirements.title') }}
        </h3>
        <p class="text-gray-600 text-center mb-8">
          {{ t('quickStart.requirements.subtitle') }}
        </p>

        <div class="max-w-5xl mx-auto overflow-x-auto">
          <table class="w-full bg-white rounded-xl shadow-lg border border-gray-200">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Component</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  <span class="flex items-center justify-center"> 🪟 Windows </span>
                </th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  <span class="flex items-center justify-center"> 🍎 macOS </span>
                </th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  <span class="flex items-center justify-center"> 🐧 Linux </span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(req, index) in systemRequirements"
                :key="req.category"
                :class="{ 'bg-blue-50/50': index % 2 === 0 }"
              >
                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ req.category }}</td>
                <td class="px-6 py-4 text-sm text-center text-gray-700">{{ req.windows }}</td>
                <td class="px-6 py-4 text-sm text-center text-gray-700">{{ req.macos }}</td>
                <td class="px-6 py-4 text-sm text-center text-gray-700">{{ req.linux }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Configuration Guide -->
      <div
        v-if="showConfiguration"
        class="mb-12"
      >
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          {{ t('quickStart.configuration.title') }}
        </h3>
        <p class="text-gray-600 text-center mb-8">
          {{ t('quickStart.configuration.subtitle') }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div
            v-for="config in configurationSteps"
            :key="config.title"
            class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
          >
            <div class="flex items-center mb-4">
              <span class="text-3xl mr-4">{{ config.icon }}</span>
              <h4 class="text-xl font-semibold text-gray-900">{{ config.title }}</h4>
            </div>
            <p class="text-gray-600 mb-4">{{ config.description }}</p>
            <ul class="space-y-2">
              <li
                v-for="detail in config.details"
                :key="detail"
                class="flex items-start text-sm text-gray-700"
              >
                <svg
                  class="flex-shrink-0 w-4 h-4 text-green-500 mt-0.5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ detail }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Troubleshooting -->
      <div class="mb-12">
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Need Help?</h3>
        <p class="text-gray-600 text-center mb-8">
          Common issues and helpful resources to get you started
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <a
            v-for="link in troubleshootingLinks"
            :key="link.title"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            class="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div class="text-3xl mb-4">{{ link.icon }}</div>
            <h4
              class="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors"
            >
              {{ link.title }}
            </h4>
            <p class="text-sm text-gray-600">{{ link.description }}</p>
            <div class="mt-4 flex items-center text-blue-600 text-sm font-medium">
              Learn more
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

      <!-- Quick Start CTA -->
      <div class="text-center">
        <div class="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 md:p-12 text-white">
          <h3 class="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p class="text-lg mb-8 opacity-90">
            Download EchoNote now and experience privacy-first voice transcription
          </p>
          <a
            :href="APP_CONFIG.downloads[selectedPlatform]"
            class="inline-flex items-center px-8 py-4 bg-white text-green-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600"
          >
            <span class="mr-2">⬇️</span>
            Download for {{ t(`quickStart.installation.platforms.${selectedPlatform}`) }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Enhanced table styling */
table {
  border-collapse: separate;
  border-spacing: 0;
}

/* Smooth transitions for step navigation */
.transition-all {
  transition-property: all;
}

/* Custom focus styles for better accessibility */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Responsive table improvements */
@media (max-width: 768px) {
  table {
    font-size: 0.875rem;
  }

  th,
  td {
    padding: 0.75rem 0.5rem;
  }

  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-colors,
  .transition-transform {
    transition: none;
  }

  .group-hover\:translate-x-1:hover {
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
}
</style>
