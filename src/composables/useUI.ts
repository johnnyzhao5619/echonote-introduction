// 统一的UI相关composables
import { ref, onMounted, onUnmounted } from 'vue'

// 滚动动画相关
interface ScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  animationClass?: string
  delay?: number
}

export function useScrollAnimations(options: ScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    animationClass = 'animate-fade-in',
    delay = 0,
  } = options

  const isVisible = ref(false)
  const elementRef = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null
  let timeoutId: number | null = null

  const startAnimation = () => {
    if (elementRef.value && !isVisible.value) {
      isVisible.value = true

      if (delay > 0) {
        timeoutId = window.setTimeout(() => {
          elementRef.value?.classList.add(animationClass)
        }, delay)
      } else {
        elementRef.value.classList.add(animationClass)
      }
    }
  }

  const initObserver = () => {
    if (!elementRef.value) return

    observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAnimation()
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(elementRef.value)
  }

  onMounted(() => {
    if ('IntersectionObserver' in window) {
      initObserver()
    } else {
      startAnimation()
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return {
    elementRef,
    isVisible,
    startAnimation,
  }
}

export function useStaggeredAnimations(
  itemCount: number,
  options: ScrollAnimationOptions & { staggerDelay?: number } = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    animationClass = 'animate-slide-up',
    staggerDelay = 100,
  } = options

  const containerRef = ref<HTMLElement | null>(null)
  const visibleItems = ref<Set<number>>(new Set())
  let observer: IntersectionObserver | null = null

  const startStaggeredAnimation = () => {
    if (!containerRef.value) return

    const items = containerRef.value.querySelectorAll('[data-animate-item]')

    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add(animationClass)
        visibleItems.value.add(index)
      }, index * staggerDelay)
    })
  }

  const initObserver = () => {
    if (!containerRef.value) return

    observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startStaggeredAnimation()
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(containerRef.value)
  }

  onMounted(() => {
    if ('IntersectionObserver' in window) {
      initObserver()
    } else {
      startStaggeredAnimation()
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    containerRef,
    visibleItems,
    startStaggeredAnimation,
  }
}

// 平滑滚动
export function useSmoothScroll() {
  const scrollToElement = (
    target: string | HTMLElement,
    options: {
      offset?: number
      duration?: number
      easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
    } = {}
  ) => {
    const { offset = 0, duration = 800, easing = 'ease-out' } = options

    let element: HTMLElement | null = null

    if (typeof target === 'string') {
      element = document.querySelector(target)
    } else {
      element = target
    }

    if (!element) return

    const startPosition = window.pageYOffset
    const targetPosition = element.offsetTop - offset
    const distance = targetPosition - startPosition
    let start: number | null = null

    const easingFunctions = {
      linear: (t: number) => t,
      'ease-in': (t: number) => t * t,
      'ease-out': (t: number) => t * (2 - t),
      'ease-in-out': (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    }

    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = timestamp - start
      const percentage = Math.min(progress / duration, 1)
      const easedPercentage = easingFunctions[easing](percentage)

      window.scrollTo(0, startPosition + distance * easedPercentage)

      if (progress < duration) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }

  return {
    scrollToElement,
  }
}

// 懒加载图片
interface LazyLoadOptions {
  rootMargin?: string
  threshold?: number
  placeholder?: string
  errorImage?: string
}

export function useLazyImage(options: LazyLoadOptions = {}) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjhmOSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
    errorImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZlZjJmMiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjZWY0NDQ0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RXJyb3I8L3RleHQ+PC9zdmc+',
  } = options

  const imageRef = ref<HTMLImageElement | null>(null)
  const isLoaded = ref(false)
  const isError = ref(false)
  const isLoading = ref(true)
  const currentSrc = ref(placeholder)

  let observer: IntersectionObserver | null = null

  const loadImage = (src: string) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        currentSrc.value = src
        isLoaded.value = true
        isLoading.value = false
        resolve()
      }

      img.onerror = () => {
        currentSrc.value = errorImage
        isError.value = true
        isLoading.value = false
        reject(new Error('Failed to load image'))
      }

      img.src = src
    })
  }

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && imageRef.value) {
        const src = imageRef.value.dataset.src
        if (src && !isLoaded.value && !isError.value) {
          loadImage(src).catch(() => {
            // Error handling is done in loadImage
          })
          observer?.unobserve(entry.target)
        }
      }
    })
  }

  const initObserver = () => {
    if (!imageRef.value) return

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(handleIntersection, {
        rootMargin,
        threshold,
      })
      observer.observe(imageRef.value)
    } else {
      // Fallback for older browsers
      const src = imageRef.value.dataset.src
      if (src) {
        loadImage(src).catch(() => {
          // Error handling is done in loadImage
        })
      }
    }
  }

  onMounted(() => {
    initObserver()
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    imageRef,
    currentSrc,
    isLoaded,
    isError,
    isLoading,
    loadImage,
  }
}

// WebP支持检测
export function useWebPSupport() {
  const supportsWebP = ref(false)
  const isChecking = ref(true)

  const checkWebPSupport = (): Promise<boolean> => {
    return new Promise(resolve => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2)
      }
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }

  const init = async () => {
    try {
      supportsWebP.value = await checkWebPSupport()
    } catch {
      supportsWebP.value = false
    } finally {
      isChecking.value = false
    }
  }

  onMounted(() => {
    init()
  })

  const getOptimizedImageSrc = (baseSrc: string, fallbackSrc?: string) => {
    if (isChecking.value) return fallbackSrc || baseSrc

    if (supportsWebP.value && baseSrc.includes('.')) {
      const webpSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      return webpSrc
    }

    return fallbackSrc || baseSrc
  }

  return {
    supportsWebP,
    isChecking,
    getOptimizedImageSrc,
  }
}
