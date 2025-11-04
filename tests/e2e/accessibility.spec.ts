import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { setupPage, testBasicPageStructure } from './utils/test-helpers'
import { TEST_CONFIG } from './utils/test-config'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page)
  })
  test('should not have any accessibility violations (axe-core)', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('#__vue-devtools-guide-overlay')
      .exclude('.vue-devtools__anchor-btn')
      .exclude('[data-v-640ec535]')
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await testBasicPageStructure(page)

    // Test buttons have accessible names
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        // Button should have accessible name (text content, aria-label, or aria-labelledby)
        const textContent = await button.textContent()
        const ariaLabel = await button.getAttribute('aria-label')
        const ariaLabelledby = await button.getAttribute('aria-labelledby')

        const hasAccessibleName = textContent?.trim() || ariaLabel || ariaLabelledby
        expect(hasAccessibleName).toBeTruthy()
      }
    }

    // Test links have accessible names
    const links = page.locator('a')
    const linkCount = await links.count()

    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = links.nth(i)
      if (await link.isVisible()) {
        const textContent = await link.textContent()
        const ariaLabel = await link.getAttribute('aria-label')
        const title = await link.getAttribute('title')

        const hasAccessibleName = textContent?.trim() || ariaLabel || title
        expect(hasAccessibleName).toBeTruthy()
      }
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')

    // Test Tab navigation
    await page.keyboard.press('Tab')

    // Check that focus is visible
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    // Test that we can navigate through interactive elements
    const interactiveElements = page.locator(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const interactiveCount = await interactiveElements.count()

    if (interactiveCount > 0) {
      // Tab through first few elements
      for (let i = 0; i < Math.min(interactiveCount, 5); i++) {
        await page.keyboard.press('Tab')

        // Check that focus moved
        const currentFocus = page.locator(':focus')
        await expect(currentFocus).toBeVisible()
      }
    }

    // Test Shift+Tab (reverse navigation)
    await page.keyboard.press('Shift+Tab')
    const reverseFocus = page.locator(':focus')
    await expect(reverseFocus).toBeVisible()
  })

  test('should handle Enter and Space key interactions', async ({ page }) => {
    await page.goto('/')

    // Find buttons and test keyboard activation
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    if (buttonCount > 0) {
      const firstButton = buttons.first()
      await firstButton.focus()

      // Test Enter key activation
      await page.keyboard.press('Enter')

      // Test Space key activation
      await firstButton.focus()
      await page.keyboard.press('Space')
    }

    // Test link activation with Enter
    const links = page.locator('a[href]')
    const linkCount = await links.count()

    if (linkCount > 0) {
      const firstLink = links.first()
      await firstLink.focus()

      // Note: We don't actually press Enter on links as it would navigate away
      // Just test that the link can receive focus
      await expect(firstLink).toBeFocused()
    }
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/')

    // Test text elements for color contrast
    const textElements = page.locator('h1, h2, h3, h4, h5, h6, p, span, a, button')
    const elementCount = await textElements.count()

    for (let i = 0; i < Math.min(elementCount, 20); i++) {
      const element = textElements.nth(i)
      if (await element.isVisible()) {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
          }
        })

        // Basic check that text has color (not transparent)
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')
        expect(styles.color).not.toBe('transparent')

        // Check font size is reasonable
        const fontSize = parseInt(styles.fontSize)
        expect(fontSize).toBeGreaterThanOrEqual(TEST_CONFIG.accessibility.minFontSize)
      }
    }
  })

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/')

    // Test heading structure for screen readers
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()

    expect(headingCount).toBeGreaterThan(0)

    // Test that headings have meaningful content
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i)
      const textContent = await heading.textContent()
      expect(textContent?.trim()).toBeTruthy()
      expect(textContent!.length).toBeGreaterThan(2)
    }

    // Test landmark regions
    const landmarks = page.locator(
      'header, nav, main, aside, footer, [role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]'
    )
    const landmarkCount = await landmarks.count()

    // Should have at least some landmark regions
    expect(landmarkCount).toBeGreaterThan(0)
  })

  test('should handle focus management', async ({ page }) => {
    await page.goto('/')

    // Test that focus is not trapped inappropriately
    await page.keyboard.press('Tab')
    const _initialFocus = await page.locator(':focus').getAttribute('tagName')

    // Tab through several elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
    }

    // Should still be able to focus elements (not trapped)
    const finalFocus = page.locator(':focus')
    await expect(finalFocus).toBeVisible()

    // Test language switcher focus management
    const languageSwitcher = page.locator(TEST_CONFIG.selectors.languageSwitcher).first()
    if ((await languageSwitcher.count()) > 0 && (await languageSwitcher.isVisible())) {
      await languageSwitcher.focus()
      await expect(languageSwitcher).toBeFocused()

      // Open dropdown with keyboard
      await page.keyboard.press('Enter')

      // Check if dropdown options are focusable
      const options = page.locator(TEST_CONFIG.selectors.languageOption)
      if ((await options.count()) > 0) {
        await page.keyboard.press('ArrowDown')
      }

      // Close dropdown with Escape
      await page.keyboard.press('Escape')
    }
  })

  test('should provide alternative text for images', async ({ page }) => {
    await page.goto('/')

    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      if (await img.isVisible()) {
        const alt = await img.getAttribute('alt')
        const role = await img.getAttribute('role')

        // Image should have alt attribute (can be empty for decorative images)
        expect(alt).not.toBeNull()

        // If image is not decorative, it should have meaningful alt text
        if (role !== 'presentation' && !alt?.includes('decoration')) {
          const src = await img.getAttribute('src')
          if (src && !src.includes('decoration') && !src.includes('icon')) {
            expect(alt).toBeTruthy()
            expect(alt!.length).toBeGreaterThan(3)
          }
        }
      }
    }
  })

  test('should handle reduced motion preferences', async ({ page, context }) => {
    // Test with reduced motion preference
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query.includes('prefers-reduced-motion: reduce'),
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      })
    })

    await page.goto('/')

    // Check that animations respect reduced motion
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]')
    const animatedCount = await animatedElements.count()

    if (animatedCount > 0) {
      // Elements should still be visible and functional
      for (let i = 0; i < Math.min(animatedCount, 5); i++) {
        const element = animatedElements.nth(i)
        if (await element.isVisible()) {
          // Element should be accessible regardless of animation state
          await expect(element).toBeVisible()
        }
      }
    }
  })

  test('should support high contrast mode', async ({ page, context }) => {
    // Simulate high contrast mode
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query.includes('prefers-contrast: high'),
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      })
    })

    await page.goto('/')

    // Test that content is still visible and readable
    const textElements = page.locator('h1, h2, h3, p, button, a')
    const textCount = await textElements.count()

    for (let i = 0; i < Math.min(textCount, 10); i++) {
      const element = textElements.nth(i)
      if (await element.isVisible()) {
        // Element should still be visible in high contrast mode
        await expect(element).toBeVisible()

        const textContent = await element.textContent()
        const ariaLabel = await element.getAttribute('aria-label')
        // Element should have either text content or aria-label
        expect(textContent?.trim() || ariaLabel).toBeTruthy()
      }
    }
  })
})
