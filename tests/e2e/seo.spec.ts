import { test } from '@playwright/test'
import { setupPage } from './utils/test-helpers'
import {
  testBasicHtmlMetadata,
  testOpenGraphMetadata,
  testTwitterCardMetadata,
  testStructuredData,
  testHeadingStructure,
  testImageSeoFriendliness,
  testInternalLinkStructure,
  testRobotsAndSitemap,
  testPerformanceOptimizedMetaTags,
} from './utils/seo-helpers'

/**
 * SEO和元数据测试套件
 * 使用重构后的辅助函数，避免代码重复
 */
test.describe('SEO and Metadata Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page)
  })

  test('should have proper HTML structure and meta tags', async ({ page }) => {
    await testBasicHtmlMetadata(page)
  })

  test('should have proper Open Graph meta tags', async ({ page }) => {
    await testOpenGraphMetadata(page)
  })

  test('should have proper Twitter Card meta tags', async ({ page }) => {
    await testTwitterCardMetadata(page)
  })

  test('should have proper heading structure', async ({ page }) => {
    await testHeadingStructure(page)
  })

  test('should have structured data (JSON-LD)', async ({ page }) => {
    await testStructuredData(page)
  })

  test('should have accessible images with alt text', async ({ page }) => {
    await testImageSeoFriendliness(page)
  })

  test('should have proper internal linking structure', async ({ page }) => {
    await testInternalLinkStructure(page)
  })

  test('should have proper robots.txt and sitemap references', async ({ page }) => {
    await testRobotsAndSitemap(page)
  })

  test('should have performance-optimized meta tags', async ({ page }) => {
    await testPerformanceOptimizedMetaTags(page)
  })
})
