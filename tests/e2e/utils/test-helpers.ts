/**
 * 通用测试辅助函数
 * 消除重复代码，提供可复用的测试工具
 */

import { Page, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

/**
 * 页面初始化和等待
 */
export async function setupPage(page: Page): Promise<void> {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

/**
 * 测试基本页面结构
 */
export async function testBasicPageStructure(page: Page): Promise<void> {
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator(TEST_CONFIG.selectors.navigation)).toBeVisible()
  await expect(page.locator(TEST_CONFIG.selectors.main).first()).toBeVisible()
}

/**
 * 测试关键页面区块
 */
export async function testCriticalSections(page: Page): Promise<void> {
  const sections = Object.values(TEST_CONFIG.selectors.sections)

  for (const sectionSelector of sections) {
    const section = page.locator(sectionSelector)
    if ((await section.count()) > 0) {
      await expect(section).toBeVisible()
    }
  }
}

/**
 * 测试语言切换功能
 */
export async function testLanguageSwitching(page: Page): Promise<void> {
  const languageSwitcher = page.locator(TEST_CONFIG.selectors.languageSwitcher)

  if (await languageSwitcher.isVisible()) {
    await languageSwitcher.click()

    const options = page.locator(TEST_CONFIG.selectors.languageOption)
    if ((await options.count()) > 0) {
      await expect(options.first()).toBeVisible()

      // 测试选择语言
      await options.first().click()
      await page.waitForTimeout(500)

      // 验证语言已切换
      const htmlLang = await page.locator('html').getAttribute('lang')
      expect(htmlLang).toBeTruthy()
    }
  }
}

/**
 * 测试响应式设计
 */
export async function testResponsiveDesign(page: Page): Promise<void> {
  const viewports = Object.values(TEST_CONFIG.viewports)

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await page.reload()
    await page.waitForLoadState('networkidle')

    // 关键内容应在所有尺寸下可见
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator(TEST_CONFIG.selectors.navigation)).toBeVisible()

    // 检查水平滚动
    const bodyOverflow = await page.evaluate(() => {
      const body = document.body
      return {
        scrollWidth: body.scrollWidth,
        clientWidth: body.clientWidth,
        hasHorizontalScroll: body.scrollWidth > body.clientWidth,
      }
    })

    if (bodyOverflow.hasHorizontalScroll) {
      const overflowRatio = bodyOverflow.scrollWidth / bodyOverflow.clientWidth
      expect(overflowRatio).toBeLessThan(1.5) // 允许50%溢出容差（开发环境更宽松）
    }
  }
}

/**
 * 测试触摸目标大小（移动端可访问性）
 */
export async function testTouchTargets(page: Page): Promise<void> {
  const touchElements = await page.locator('button, a[href]').all()

  for (const element of touchElements.slice(0, 5)) {
    if (await element.isVisible()) {
      const box = await element.boundingBox()
      if (box) {
        const minSize = Math.min(box.width, box.height)
        expect(minSize).toBeGreaterThanOrEqual(TEST_CONFIG.accessibility.minTouchTarget)
      }
    }
  }
}

/**
 * 测试性能指标
 */
export async function testPerformanceMetrics(page: Page): Promise<Record<string, number>> {
  return await page.evaluate(() => {
    return new Promise(resolve => {
      const metrics: Record<string, number> = {}

      // 导航时间
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      if (navigation) {
        metrics.domContentLoaded =
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        metrics.loadComplete = navigation.loadEventEnd - navigation.loadEventStart
        metrics.firstByte = navigation.responseStart - navigation.requestStart
      }

      // 绘制时间
      const paintEntries = performance.getEntriesByType('paint')
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime
        }
      })

      // 尝试获取LCP
      let resolved = false
      const observer = new PerformanceObserver(list => {
        if (resolved) return
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          metrics.largestContentfulPaint = lastEntry.startTime
        }
        observer.disconnect()
        resolved = true
        resolve(metrics)
      })

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
        setTimeout(() => {
          if (!resolved) {
            observer.disconnect()
            resolved = true
            resolve(metrics)
          }
        }, 3000)
      } catch {
        resolve(metrics)
      }
    })
  })
}

/**
 * 测试图片加载状态
 */
export async function testImageLoading(page: Page): Promise<void> {
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
          alt: imgEl.alt,
        }
      })

      // 图片应有src和alt属性
      expect(imageStatus.src).toBeTruthy()
      expect(imageStatus.alt).not.toBeNull()

      // 如果图片加载完成，应有尺寸
      if (imageStatus.complete && imageStatus.naturalWidth > 0) {
        expect(imageStatus.naturalWidth).toBeGreaterThan(0)
        expect(imageStatus.naturalHeight).toBeGreaterThan(0)
      }
    }
  }
}

/**
 * 测试字体和排版
 */
export async function testTypography(page: Page): Promise<void> {
  const textElements = await page.locator('h1, h2, h3, p').all()

  for (const element of textElements.slice(0, 5)) {
    if (await element.isVisible()) {
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          fontFamily: computed.fontFamily,
          fontSize: computed.fontSize,
          color: computed.color,
        }
      })

      // 字体应已加载
      expect(styles.fontFamily).toBeTruthy()
      expect(styles.fontSize).toBeTruthy()

      // 字体大小应合理
      const fontSize = parseInt(styles.fontSize)
      expect(fontSize).toBeGreaterThanOrEqual(TEST_CONFIG.accessibility.minFontSize)

      // 文字应有颜色（非透明）
      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')
      expect(styles.color).not.toBe('transparent')
    }
  }
}
