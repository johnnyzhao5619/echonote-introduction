import { ref, onMounted } from 'vue'
import { APP_CONFIG } from '@/config/app'

// 简化的性能监控 - 只关注核心Web Vitals
interface CoreWebVitals {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  cls?: number // Cumulative Layout Shift
}

const metrics = ref<CoreWebVitals>({})

export function usePerformance() {
  const isSupported = ref(false)

  const checkSupport = () => {
    isSupported.value = !!(
      window.performance &&
      typeof window.performance.getEntriesByType === 'function' &&
      window.PerformanceObserver
    )
  }

  const observeWebVitals = () => {
    if (!isSupported.value || !APP_CONFIG.features.performanceMonitoring) return

    try {
      // 观察 First Contentful Paint
      const fcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        if (fcpEntry) {
          metrics.value.fcp = fcpEntry.startTime
        }
      })
      fcpObserver.observe({ entryTypes: ['paint'] })

      // 观察 Largest Contentful Paint
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          metrics.value.lcp = lastEntry.startTime
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // 观察 Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          const layoutShiftEntry = entry as unknown as { hadRecentInput?: boolean; value: number }
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value
          }
        })
        metrics.value.cls = clsValue
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // 5秒后输出结果
      setTimeout(() => {
        if (APP_CONFIG.dev.showDevtools) {
          console.log('Core Web Vitals:', metrics.value)
        }
      }, 5000)
    } catch (error) {
      console.warn('Performance monitoring failed:', error)
    }
  }

  onMounted(() => {
    checkSupport()
    if (isSupported.value) {
      observeWebVitals()
    }
  })

  return {
    metrics,
    isSupported,
  }
}
