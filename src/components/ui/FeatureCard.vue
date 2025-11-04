<script setup lang="ts">
import { computed } from 'vue'
import LazyImage from '@/components/common/LazyImage.vue'
import { TEST_IDS } from '@/constants/testIds'

interface ImageConfig {
  src: string
  alt?: string
  width?: number
  height?: number
  overlay?: boolean
}

interface ActionConfig {
  text: string
  href?: string
  external?: boolean
  showArrow?: boolean
  onClick?: () => void
}

interface Props {
  title: string
  description: string
  icon?: string | object
  image?: ImageConfig
  highlights?: string[]
  action?: ActionConfig
  layout?: 'vertical' | 'horizontal' | 'grid'
  variant?: 'default' | 'featured' | 'compact'
  clickable?: boolean
  fullHeight?: boolean
  showDecoration?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  image: undefined,
  highlights: () => [],
  action: undefined,
  layout: 'vertical',
  variant: 'default',
  clickable: false,
  fullHeight: false,
  showDecoration: true,
})

const emit = defineEmits<{
  click: [event: Event]
  actionClick: [event: Event]
  imageError: [event: Event]
}>()

// Computed classes
const layoutClasses = computed(() => {
  switch (props.layout) {
    case 'horizontal':
      return 'flex flex-row'
    case 'grid':
      return 'grid grid-cols-1 md:grid-cols-2 gap-4'
    default:
      return 'flex flex-col'
  }
})

const contentClasses = computed(() => {
  const base =
    props.layout === 'horizontal' ? 'flex flex-row items-start space-x-4' : 'flex flex-col h-full'

  switch (props.variant) {
    case 'featured':
      return `${base} p-8`
    case 'compact':
      return `${base} p-4`
    default:
      return base
  }
})

const iconContainerClasses = computed(() => {
  if (props.layout === 'horizontal') {
    return 'flex-shrink-0'
  }
  return props.variant === 'compact' ? 'mb-2' : 'mb-4'
})

const iconClasses = computed(() => {
  switch (props.variant) {
    case 'featured':
      return 'w-16 h-16 text-3xl'
    case 'compact':
      return 'w-8 h-8 text-lg'
    default:
      return 'w-12 h-12 text-2xl'
  }
})

const imageContainerClasses = computed(() => {
  switch (props.variant) {
    case 'featured':
      return 'w-full h-48 md:h-56'
    case 'compact':
      return 'w-full h-32'
    default:
      return 'w-full h-40'
  }
})

const imageClasses = computed(() => {
  return props.layout === 'horizontal' ? 'aspect-square' : 'aspect-video'
})

const textContentClasses = computed(() => {
  return props.layout === 'horizontal' ? 'flex-1 min-w-0' : 'flex-1 flex flex-col'
})

const titleClasses = computed(() => {
  switch (props.variant) {
    case 'featured':
      return 'text-xl md:text-2xl font-bold mb-3'
    case 'compact':
      return 'text-base font-semibold mb-1'
    default:
      return 'text-lg font-semibold mb-2'
  }
})

const descriptionClasses = computed(() => {
  switch (props.variant) {
    case 'featured':
      return 'text-base text-gray-700 mb-6'
    case 'compact':
      return 'text-sm text-gray-600 mb-2'
    default:
      return 'text-gray-600 mb-4'
  }
})

const highlightsClasses = computed(() => {
  return props.variant === 'compact' ? 'mb-2' : 'mb-4'
})

const actionClasses = computed(() => {
  switch (props.variant) {
    case 'featured':
      return 'text-base font-semibold'
    case 'compact':
      return 'text-xs'
    default:
      return 'text-sm'
  }
})

// Methods
const handleClick = (event: Event) => {
  if (props.clickable) {
    emit('click', event)
  }
}

const handleActionClick = (event: Event) => {
  if (props.action?.onClick) {
    event.stopPropagation()
    props.action.onClick()
  }
  emit('actionClick', event)
}

const handleImageError = (event: Event) => {
  emit('imageError', event)

  // Hide the image container on error
  const target = event.target as HTMLImageElement
  const container = target.closest('.relative') as HTMLElement
  if (container) {
    container.style.display = 'none'
  }
}
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
    :class="[layoutClasses, { 'cursor-pointer': clickable && !action }, { 'h-full': fullHeight }]"
    :tabindex="clickable && !action ? 0 : undefined"
    :role="clickable && !action ? 'button' : undefined"
    :aria-label="clickable && !action ? `${title} - ${description}` : undefined"
    :data-testid="TEST_IDS.FEATURE_CARD"
    v-on="
      clickable && !action
        ? {
            click: handleClick,
            keydown: (e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (e.key === ' ') e.preventDefault()
                handleClick(e)
              }
            },
          }
        : {}
    "
  >
    <!-- Background decoration -->
    <div
      v-if="showDecoration"
      class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      aria-hidden="true"
    />

    <!-- Content container -->
    <div
      class="relative z-10 p-4 sm:p-6"
      :class="contentClasses"
    >
      <!-- Icon and image container -->
      <div
        v-if="icon || image"
        class="flex-shrink-0 mb-4"
        :class="iconContainerClasses"
      >
        <!-- Icon -->
        <div
          v-if="icon && !image"
          class="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300"
          :class="iconClasses"
          aria-hidden="true"
        >
          <component
            v-if="typeof icon === 'object'"
            :is="icon"
            class="w-6 h-6"
          />
          <span
            v-else
            class="text-xl sm:text-2xl"
            v-html="icon"
          />
        </div>

        <!-- Image -->
        <div
          v-if="image"
          class="relative overflow-hidden rounded-lg"
          :class="imageContainerClasses"
        >
          <LazyImage
            :src="image.src"
            :alt="image.alt || title"
            :width="image.width"
            :height="image.height"
            :class="`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${imageClasses}`"
            loading="lazy"
            decoding="async"
            @error="handleImageError"
          />

          <!-- Image overlay -->
          <div
            v-if="image.overlay"
            class="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-hidden="true"
          />
        </div>
      </div>

      <!-- Text content -->
      <div
        class="flex-1"
        :class="textContentClasses"
      >
        <!-- Title -->
        <h3
          class="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200"
          :class="titleClasses"
        >
          {{ title }}
        </h3>

        <!-- Description -->
        <p
          class="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed"
          :class="descriptionClasses"
        >
          {{ description }}
        </p>

        <!-- Highlights list -->
        <ul
          v-if="highlights && highlights.length > 0"
          class="space-y-1 sm:space-y-2 mb-3 sm:mb-4"
          :class="highlightsClasses"
        >
          <li
            v-for="(highlight, index) in highlights"
            :key="index"
            class="flex items-start text-xs sm:text-sm text-gray-700"
          >
            <svg
              class="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ highlight }}</span>
          </li>
        </ul>

        <!-- Action button or link -->
        <div
          v-if="action"
          class="mt-auto"
        >
          <component
            :is="action.href ? 'a' : 'button'"
            :href="action.href"
            :target="action.href && action.external ? '_blank' : undefined"
            :rel="action.href && action.external ? 'noopener noreferrer' : undefined"
            class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors duration-200"
            :class="actionClasses"
            @click="handleActionClick"
          >
            {{ action.text }}
            <svg
              v-if="action.showArrow !== false"
              class="ml-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </component>
        </div>
      </div>
    </div>

    <!-- Hover indicator -->
    <div
      v-if="clickable"
      class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
/* Custom focus styles for better accessibility */
[role='button']:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Smooth transitions for all interactive elements */
.group {
  transition-property: transform, box-shadow, border-color;
}

/* Enhanced hover effects for featured variant */
.group:hover {
  transform: translateY(-2px);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .group:hover {
    transform: none;
  }

  /* Reduce motion for mobile users */
  .transition-transform {
    transition: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border-gray-200 {
    border-color: #111827;
  }

  .text-gray-600 {
    color: #111827;
  }

  .bg-blue-100 {
    background-color: #dbeafe;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-transform,
  .transition-colors,
  .transition-opacity {
    transition: none;
  }

  .group:hover {
    transform: none;
  }
}

/* Print styles */
@media print {
  .group {
    box-shadow: none;
    border: 1px solid #000;
  }

  .absolute {
    display: none;
  }
}
</style>
