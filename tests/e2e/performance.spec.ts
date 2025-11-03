import { test, expect } from '@playwright/test'
import { setupPage, testPerformanceMetrics, testImageLoading } from './utils/test-helpers'
import { TEST_CONFIG } from './utils/test-config'

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page)
  })
  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    const performanceMetrics = await testPerformanceMetrics(page)
    const thresholds = TEST_CONFIG.performance.development

    // Test performance metrics against configured thresholds
    if (performanceMetrics.firstContentfulPaint) {
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(thresholds.firstContentfulPaint)
    }

    if (performanceMetrics.largestContentfulPaint) {
      expect(performanceMetrics.largestContentfulPaint).toBeLessThan(
        thresholds.largestContentfulPaint
      )
    }

    if (performanceMetrics.firstByte) {
      expect(performanceMetrics.firstByte).toBeLessThan(thresholds.firstByte)
    }

    if (performanceMetrics.domContentLoaded) {
      expect(performanceMetrics.domContentLoaded).toBeLessThan(thresholds.domContentLoaded)
    }
  })

  test('should load images efficiently', async ({ page }) => {
    await testImageLoading(page)
  })

  test('should have reasonable bundle size', async ({ page }) => {
    // Intercept network requests to measure resource sizes
    const resourceSizes: Record<string, number> = {}

    page.on('response', async response => {
      const url = response.url()
      const contentLength = response.headers()['content-length']

      if (contentLength) {
        resourceSizes[url] = parseInt(contentLength, 10)
      } else {
        // Try to get size from response body
        try {
          const buffer = await response.body()
          resourceSizes[url] = buffer.length
        } catch {
          // Ignore errors for resources we can't measure
        }
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Calculate total JavaScript bundle size
    let totalJSSize = 0
    let totalCSSSize = 0

    Object.entries(resourceSizes).forEach(([url, size]) => {
      if (url.includes('.js') && !url.includes('node_modules')) {
        totalJSSize += size
      }
      if (url.includes('.css')) {
        totalCSSSize += size
      }
    })

    // Test bundle sizes are reasonable
    const thresholds = TEST_CONFIG.performance.development

    // Test bundle sizes against configured thresholds
    if (totalJSSize > 0) {
      expect(totalJSSize).toBeLessThan(thresholds.jsBundle)
    }

    if (totalCSSSize > 0) {
      expect(totalCSSSize).toBeLessThan(thresholds.cssBundle)
    }
  })

  test('should handle slow network conditions', async ({ page, context }) => {
    // Simulate slow 3G network
    await context.route('**/*', async route => {
      // Add delay to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 100))
      await route.continue()
    })

    const startTime = Date.now()
    await page.goto('/')

    // Wait for critical content to be visible
    await expect(page.locator('h1')).toBeVisible()
    const loadTime = Date.now() - startTime

    // Page should still be usable within reasonable time even on slow network
    expect(loadTime).toBeLessThan(10000) // 10 seconds max
  })

  test('should not have memory leaks', async ({ page }) => {
    await page.goto('/')

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })

    // Perform some interactions that might cause memory leaks
    const languageSwitcher = page.locator('[data-testid="language-switcher"]')
    if (await languageSwitcher.isVisible()) {
      // Switch languages multiple times
      for (let i = 0; i < 3; i++) {
        await languageSwitcher.click()
        const options = page.locator('[data-testid="language-option"]')
        if ((await options.count()) > 0) {
          await options.first().click()
          await page.waitForTimeout(500)
        }
      }
    }

    // Scroll through sections multiple times
    const sections = [
      '[data-testid="features-section"]',
      '[data-testid="quickstart-section"]',
      '[data-testid="technical-section"]',
      '[data-testid="community-section"]',
    ]

    for (let round = 0; round < 2; round++) {
      for (const sectionSelector of sections) {
        const section = page.locator(sectionSelector)
        if (await section.isVisible()) {
          await section.scrollIntoViewIfNeeded()
          await page.waitForTimeout(200)
        }
      }
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if ('gc' in window) {
        ;(window as any).gc()
      }
    })

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })

    // Memory usage shouldn't increase dramatically
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory
      const increasePercentage = (memoryIncrease / initialMemory) * 100

      // Memory increase should be reasonable (< 50% increase)
      expect(increasePercentage).toBeLessThan(50)
    }
  })

  test('should handle concurrent users simulation', async ({ browser }) => {
    // Simulate multiple concurrent users
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ])

    const pages = await Promise.all(contexts.map(context => context.newPage()))

    // All users navigate to the site simultaneously
    const startTime = Date.now()
    await Promise.all(pages.map(page => page.goto('/')))

    // All users should be able to see the main content
    await Promise.all(pages.map(page => expect(page.locator('h1')).toBeVisible()))

    const loadTime = Date.now() - startTime

    // Site should handle concurrent users reasonably well
    expect(loadTime).toBeLessThan(5000) // 5 seconds max

    // Clean up
    await Promise.all(contexts.map(context => context.close()))
  })
})
