import './assets/main.css'
import './styles/accessibility-fixes.css'

import { createApp } from 'vue'
import { createUnhead } from '@unhead/vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { initPerformanceMonitoring, registerServiceWorker } from './utils/performance'

// Performance optimizations using centralized resource hints
const initPerformanceOptimizations = () => {
  // Use centralized configuration from constants
  const externalDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.github.com',
  ]

  const dnsPrefetchDomains = ['https://github.com', 'https://raw.githubusercontent.com']

  // Preconnect to external domains
  externalDomains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    document.head.appendChild(link)
  })

  // DNS prefetch for additional domains
  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    document.head.appendChild(link)
  })

  // Optimize font loading with font-display: swap
  const fontLink = document.createElement('link')
  fontLink.rel = 'stylesheet'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  fontLink.media = 'print'
  fontLink.onload = () => {
    fontLink.media = 'all'
  }
  document.head.appendChild(fontLink)

  // Add fallback for font loading
  const noscriptFallback = document.createElement('noscript')
  const fallbackLink = document.createElement('link')
  fallbackLink.rel = 'stylesheet'
  fallbackLink.href =
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  noscriptFallback.appendChild(fallbackLink)
  document.head.appendChild(noscriptFallback)
}

// Initialize performance optimizations
initPerformanceOptimizations()

const app = createApp(App)
const head = createUnhead()

app.use(router)
app.use(i18n)

// Install head plugin properly
app.config.globalProperties.$head = head
app.provide('usehead', head)

// Error handling for better user experience
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)

  // In production, you might want to send errors to a logging service
  if (import.meta.env.PROD) {
    // Example: Send to error tracking service
    // errorTrackingService.captureException(err, { extra: { info } })
  }
}

// Initialize performance monitoring in production
if (import.meta.env.PROD) {
  initPerformanceMonitoring()
  registerServiceWorker()
}

app.mount('#app')
