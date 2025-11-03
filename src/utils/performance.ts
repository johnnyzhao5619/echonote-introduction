/**
 * Performance optimization utilities
 */

// Critical resource hints
export const addResourceHints = () => {
  // Preconnect to external domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.github.com',
  ]

  preconnectDomains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })

  // DNS prefetch for additional domains
  const dnsPrefetchDomains = ['https://github.com', 'https://raw.githubusercontent.com']

  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    document.head.appendChild(link)
  })
}

// Optimize font loading
export const optimizeFontLoading = () => {
  // Use font-display: swap for better performance
  const style = document.createElement('style')
  style.textContent = `
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2') format('woff2');
    }
  `
  document.head.appendChild(style)
}

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    { href: '/images/hero/hero-mockup.svg', as: 'image' },
    { href: '/images/features/feature-privacy.svg', as: 'image' },
  ]

  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.href
    link.as = resource.as
    document.head.appendChild(link)
  })
}

// Lazy load non-critical resources
export const lazyLoadResources = () => {
  // Intersection Observer for lazy loading
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
            observer.unobserve(img)
          }
        }
      })
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  )

  // Observe all images with data-src
  document.querySelectorAll('img[data-src]').forEach(img => {
    observer.observe(img)
  })
}

// Performance monitoring
export const initPerformanceMonitoring = () => {
  if ('performance' in window) {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        }
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as any
          console.log('FID:', fidEntry.processingStart - entry.startTime)
        }
        if (entry.entryType === 'layout-shift') {
          if (!(entry as any).hadRecentInput) {
            console.log('CLS:', (entry as any).value)
          }
        }
      })
    })

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
  }
}

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered:', registration)
    } catch (error) {
      console.log('SW registration failed:', error)
    }
  }
}

// Bundle size optimization
export const optimizeBundleSize = () => {
  // Remove unused CSS
  if (import.meta.env.PROD) {
    // This would be handled by build tools like PurgeCSS
    console.log('Bundle optimization enabled in production')
  }
}
