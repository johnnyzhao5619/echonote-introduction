<script setup lang="ts">
import OptimizedImage from './OptimizedImage.vue'
import type { ImageContext } from '@/config/app'

interface Props {
  src: string
  alt: string
  context?: ImageContext
  className?: string
  showPlaceholder?: boolean
}

withDefaults(defineProps<Props>(), {
  context: 'feature',
  className: '',
  showPlaceholder: true,
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
}>()

const handleLoad = (event: Event) => {
  emit('load', event)
}

const handleError = (event: Event) => {
  emit('error', event)
}
</script>

<template>
  <OptimizedImage
    :src="src"
    :alt="alt"
    :context="context"
    :class-name="className"
    :show-placeholder="showPlaceholder"
    loading="lazy"
    @load="handleLoad"
    @error="handleError"
  />
</template>
