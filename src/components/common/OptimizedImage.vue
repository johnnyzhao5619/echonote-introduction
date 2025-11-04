<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { APP_CONFIG, type ImageContext } from '@/config/app'

// Props - Simplified interface following first principles
interface Props {
  src: string
  alt?: string
  context?: ImageContext
  width?: number
  height?: number
  className?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
  showPlaceholder?: boolean
  showErrorState?: boolean
  showLoadingText?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  context: 'feature',
  width: undefined,
  height: undefined,
  className: '',
  loading: 'lazy',
  decoding: 'async',
  showPlaceholder: true,
  showErrorState: true,
  showLoadingText: false,
})

// Composables
const { t, currentLanguage } = useI18n()

// State
const imageRef = ref<HTMLImageElement>()
const isLoading = ref(true)
const isLoaded = ref(false)
const hasError = ref(false)
const loadStartTime = ref(0)

// Computed
const contextConfig = computed(() => APP_CONFIG.images.contexts[props.context])

const altText = computed(() => {
  if (props.alt) return props.alt

  // Generate alt text based on context and current language
  const baseName = props.src.split('/').pop()?.split('.')[0] || 'image'
  return generateAltText(props.context, baseName, currentLanguage.value)
})

const loadingText = computed(() => t('common.loading'))
const errorText = computed(() => t('common.error'))
const imageSizes = computed(() => contextConfig.value.sizes)

// Generate responsive image sources using centralized configuration
const basePath = computed(() => {
  const pathParts = props.src.split('.')
  return pathParts.slice(0, -1).join('.')
})

const modernFormats = computed(() => {
  const formats = []

  // AVIF - best compression
  if (APP_CONFIG.images.formats.includes('avif')) {
    formats.push({
      type: 'image/avif',
      srcSet: APP_CONFIG.images.sizes
        .map(size => `${basePath.value}-${size}w.avif ${size}w`)
        .join(', '),
    })
  }

  // WebP - good compression and wide support
  if (APP_CONFIG.images.formats.includes('webp')) {
    formats.push({
      type: 'image/webp',
      srcSet: APP_CONFIG.images.sizes
        .map(size => `${basePath.value}-${size}w.webp ${size}w`)
        .join(', '),
    })
  }

  return formats
})

const fallbackSrc = computed(() => `${basePath.value}-800w.jpg`)

const fallbackSrcSet = computed(() =>
  APP_CONFIG.images.sizes.map(size => `${basePath.value}-${size}w.jpg ${size}w`).join(', ')
)

const imageStyle = computed(() => {
  const style: Record<string, string> = {
    objectFit: 'cover',
    width: '100%',
    height: 'auto',
  }

  if (contextConfig.value.aspectRatio) {
    style.aspectRatio = contextConfig.value.aspectRatio
  }

  if (props.width) {
    style.maxWidth = `${props.width}px`
  }

  if (props.height) {
    style.maxHeight = `${props.height}px`
  }

  return style
})

const placeholderStyle = computed(() => {
  const style: Record<string, string> = {
    width: '100%',
    height: 'auto',
  }

  if (contextConfig.value.aspectRatio) {
    style.aspectRatio = contextConfig.value.aspectRatio
  }

  return style
})

// Generate alt text helper
const generateAltText = (context: string, description: string, locale: string): string => {
  const templates = {
    en: {
      screenshot: `Screenshot of ${description}`,
      feature: `${description} feature illustration`,
      hero: `${description} hero image`,
      social: `${description} social media preview`,
      icon: `${description} icon`,
    },
    'zh-CN': {
      screenshot: `${description}的截图`,
      feature: `${description}功能说明图`,
      hero: `${description}主页图片`,
      social: `${description}社交媒体预览图`,
      icon: `${description}图标`,
    },
    'zh-TW': {
      screenshot: `${description}的截圖`,
      feature: `${description}功能說明圖`,
      hero: `${description}主頁圖片`,
      social: `${description}社交媒體預覽圖`,
      icon: `${description}圖標`,
    },
    fr: {
      screenshot: `Capture d'écran de ${description}`,
      feature: `Illustration de la fonctionnalité ${description}`,
      hero: `Image héro de ${description}`,
      social: `Aperçu sur les réseaux sociaux de ${description}`,
      icon: `Icône ${description}`,
    },
  }

  const localeTemplates = templates[locale as keyof typeof templates] || templates.en
  return localeTemplates[context as keyof typeof localeTemplates] || description
}

// Methods
const handleLoadStart = () => {
  isLoading.value = true
  isLoaded.value = false
  hasError.value = false
  loadStartTime.value = performance.now()
}

const handleLoad = () => {
  isLoading.value = false
  isLoaded.value = true
  hasError.value = false

  // Track performance
  const loadTime = performance.now() - loadStartTime.value

  // Dispatch custom event for performance monitoring
  window.dispatchEvent(
    new CustomEvent('image-loaded', {
      detail: {
        src: props.src,
        loadTime,
        context: props.context,
      },
    })
  )
}

const handleError = () => {
  isLoading.value = false
  isLoaded.value = false
  hasError.value = true

  // Dispatch custom event for error tracking
  window.dispatchEvent(
    new CustomEvent('image-error', {
      detail: {
        src: props.src,
        context: props.context,
      },
    })
  )
}

// Intersection Observer for lazy loading optimization
let observer: IntersectionObserver | null = null

const setupIntersectionObserver = () => {
  if (!('IntersectionObserver' in window) || !imageRef.value) return

  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Image is about to be visible, we can preload it
          const img = entry.target as HTMLImageElement

          // Dispatch event for analytics
          window.dispatchEvent(
            new CustomEvent('image-in-viewport', {
              detail: {
                src: props.src,
                context: props.context,
              },
            })
          )

          observer?.unobserve(img)
        }
      })
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  )

  observer.observe(imageRef.value)
}

// Lifecycle
onMounted(() => {
  if (props.loading === 'lazy') {
    setupIntersectionObserver()
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

// Watch for src changes
watch(
  () => props.src,
  () => {
    isLoading.value = true
    isLoaded.value = false
    hasError.value = false
  }
)
</script>

<template>
  <picture
    class="optimized-image"
    :class="[
      {
        loading: isLoading,
        loaded: isLoaded,
        error: hasError,
      },
      className,
    ]"
  >
    <!-- Modern formats for better compression -->
    <source
      v-for="format in modernFormats"
      :key="format.type"
      :srcset="format.srcSet"
      :sizes="imageSizes"
      :type="format.type"
    />

    <!-- Fallback image -->
    <img
      ref="imageRef"
      :src="fallbackSrc"
      :srcset="fallbackSrcSet"
      :sizes="imageSizes"
      :alt="altText"
      :loading="loading"
      :decoding="decoding"
      :width="width"
      :height="height"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
      @loadstart="handleLoadStart"
    />

    <!-- Loading placeholder -->
    <div
      v-if="showPlaceholder && isLoading"
      class="image-placeholder"
      :style="placeholderStyle"
    >
      <div class="placeholder-content">
        <svg
          class="placeholder-icon"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clip-rule="evenodd"
          />
        </svg>
        <span
          v-if="showLoadingText"
          class="placeholder-text"
        >
          {{ loadingText }}
        </span>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-if="hasError && showErrorState"
      class="image-error"
      :style="placeholderStyle"
    >
      <div class="error-content">
        <svg
          class="error-icon"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="error-text">{{ errorText }}</span>
      </div>
    </div>
  </picture>
</template>

<style scoped>
.optimized-image {
  position: relative;
  display: block;
  overflow: hidden;
}

.optimized-image img {
  transition: opacity 0.3s ease-in-out;
}

.optimized-image.loading img {
  opacity: 0;
}

.optimized-image.loaded img {
  opacity: 1;
}

.optimized-image.error img {
  opacity: 0;
}

.image-placeholder,
.image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.placeholder-content,
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.placeholder-icon,
.error-icon {
  width: 2rem;
  height: 2rem;
  opacity: 0.5;
}

.placeholder-text,
.error-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.error-content {
  color: #ef4444;
}

/* Loading animation */
.image-placeholder {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .image-placeholder,
  .image-error {
    background-color: #374151;
    border-color: #4b5563;
  }

  .placeholder-content,
  .error-content {
    color: #9ca3af;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .placeholder-icon,
  .error-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .placeholder-text,
  .error-text {
    font-size: 0.75rem;
  }
}
</style>
