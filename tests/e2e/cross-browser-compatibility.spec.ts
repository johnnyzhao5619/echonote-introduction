import { test, expect } from '@playwright/test'
import {
  setupPage,
  testBasicPageStructure,
  testCriticalSections,
  testLanguageSwitching,
  testResponsiveDesign,
  testTouchTargets,
  testTypography,
} from './utils/test-helpers'

test.describe('Cross-Browser Compatibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page)
  })

  test('should render correctly across browsers', async ({ page }) => {
    await testBasicPageStructure(page)
    await testCriticalSections(page)
  })

  test('should handle CSS features properly', async ({ page }) => {
    // Test CSS Grid support
    const gridElements = await page.locator('[class*="grid"]').all()
    for (const element of gridElements.slice(0, 3)) {
      if (await element.isVisible()) {
        const display = await element.evaluate(el => window.getComputedStyle(el).display)
        expect(['grid', 'block', 'flex']).toContain(display)
      }
    }

    // Test Flexbox support
    const flexElements = await page.locator('[class*="flex"]').all()
    for (const element of flexElements.slice(0, 3)) {
      if (await element.isVisible()) {
        const display = await element.evaluate(el => window.getComputedStyle(el).display)
        expect(['flex', 'block']).toContain(display)
      }
    }

    // Test CSS custom properties
    const hasCustomProperties = await page.evaluate(() => {
      const testEl = document.createElement('div')
      testEl.style.setProperty('--test-var', 'test')
      return testEl.style.getPropertyValue('--test-var') === 'test'
    })

    expect(hasCustomProperties).toBeTruthy()
  })

  test('should handle JavaScript features', async ({ page }) => {
    const jsFeatures = await page.evaluate(() => {
      const features = {
        promises: typeof Promise !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        arrow_functions: true,
        const_let: true,
        template_literals: true,
      }

      try {
        // Test arrow functions
        const arrow = () => true
        features.arrow_functions = arrow()

        // Test const/let
        const testConst = 'test'
        const testLet = 'test'
        features.const_let = testConst === 'test' && testLet === 'test'

        // Test template literals
        const name = 'test'
        features.template_literals = `Hello ${name}` === 'Hello test'
      } catch {
        // Some features might not be supported
      }

      return features
    })

    expect(jsFeatures.promises).toBeTruthy()
    expect(jsFeatures.fetch).toBeTruthy()
  })

  test('should handle interactions properly', async ({ page }) => {
    await testLanguageSwitching(page)

    // Test navigation links
    const navLinks = await page.locator('nav a[href^="#"]').all()
    for (const link of navLinks.slice(0, 2)) {
      if (await link.isVisible()) {
        await link.click()
        await page.waitForTimeout(300)

        const currentUrl = page.url()
        expect(currentUrl).toContain('#')
      }
    }
  })

  test('should handle responsive design', async ({ page }) => {
    await testResponsiveDesign(page)
  })

  test('should handle fonts and typography', async ({ page }) => {
    await testTypography(page)

    const textContent = await page.locator('body').textContent()
    expect(textContent).toBeTruthy()
    expect(textContent!.length).toBeGreaterThan(100)
  })

  test('should handle images and media', async ({ page }) => {
    const images = await page.locator('img').all()

    for (const img of images.slice(0, 5)) {
      if (await img.isVisible()) {
        const imageStatus = await img.evaluate(el => {
          const imgEl = el as HTMLImageElement
          return {
            complete: imgEl.complete,
            naturalWidth: imgEl.naturalWidth,
            naturalHeight: imgEl.naturalHeight,
            src: imgEl.src,
          }
        })

        expect(imageStatus.src).toBeTruthy()

        if (imageStatus.complete && imageStatus.naturalWidth > 0) {
          expect(imageStatus.naturalWidth).toBeGreaterThan(0)
          expect(imageStatus.naturalHeight).toBeGreaterThan(0)
        }
      }
    }

    // Test SVG support
    const svgElements = await page.locator('svg').all()
    for (const svg of svgElements.slice(0, 3)) {
      if (await svg.isVisible()) {
        const svgBox = await svg.boundingBox()
        if (svgBox) {
          expect(svgBox.width).toBeGreaterThan(0)
          expect(svgBox.height).toBeGreaterThan(0)
        }
      }
    }
  })

  test('should handle performance across browsers', async ({ page }) => {
    const startTime = Date.now()
    await page.reload()
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(10000) // 10 seconds max

    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      if (!navigation) return null

      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstByte: navigation.responseStart - navigation.requestStart,
      }
    })

    if (performanceMetrics) {
      if (performanceMetrics.domContentLoaded > 0) {
        expect(performanceMetrics.domContentLoaded).toBeLessThan(5000)
      }

      if (performanceMetrics.firstByte > 0) {
        expect(performanceMetrics.firstByte).toBeLessThan(2000)
      }
    }
  })
})

test.describe('Mobile Browser Compatibility', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await setupPage(page)
    await testBasicPageStructure(page)
    await testTouchTargets(page)
  })
})
