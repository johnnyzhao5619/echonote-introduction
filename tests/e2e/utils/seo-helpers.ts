/**
 * SEO测试专用辅助函数
 * 集中管理SEO相关的测试逻辑
 */

import { Page, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

/**
 * SEO标签配置接口
 */
interface TagRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  format?: 'url' | 'email' | 'color'
  expectedValues?: string[]
}

/**
 * 测试基础HTML元数据
 */
export async function testBasicHtmlMetadata(page: Page): Promise<void> {
  // HTML语言属性
  const htmlElement = page.locator('html')
  await expect(htmlElement).toHaveAttribute('lang')

  const lang = await htmlElement.getAttribute('lang')
  expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/)

  // 标题标签
  const title = await page.title()
  expect(title).toBeTruthy()
  expect(title.length).toBeGreaterThan(TEST_CONFIG.SEO.TITLE.MIN_LENGTH)
  expect(title.length).toBeLessThan(TEST_CONFIG.SEO.TITLE.MAX_LENGTH)
  expect(title).toContain('EchoNote')

  // 元描述（可选）
  const metaDescription = page.locator('meta[name="description"]')
  if ((await metaDescription.count()) > 0) {
    const description = await metaDescription.getAttribute('content')
    expect(description).toBeTruthy()
    expect(description!.length).toBeGreaterThan(TEST_CONFIG.SEO.DESCRIPTION.MIN_LENGTH)
    expect(description!.length).toBeLessThan(TEST_CONFIG.SEO.DESCRIPTION.MAX_LENGTH)
  }

  // 视口元标签
  const metaViewport = page.locator('meta[name="viewport"]')
  await expect(metaViewport).toHaveCount(1)
  const viewport = await metaViewport.getAttribute('content')
  expect(viewport).toContain('width=device-width')
  expect(viewport).toContain('initial-scale=1')

  // 字符集
  const metaCharset = page.locator('meta[charset], meta[http-equiv="Content-Type"]')
  await expect(metaCharset.first()).toBeAttached()
}

/**
 * 测试Open Graph元数据
 */
export async function testOpenGraphMetadata(page: Page): Promise<void> {
  const ogTags: Record<string, TagRule> = {
    'og:title': { required: false, minLength: 10, maxLength: 60 },
    'og:description': { required: false, minLength: 50, maxLength: 160 },
    'og:image': { required: false, format: 'url' },
    'og:url': { required: false, format: 'url' },
    'og:type': { required: false, expectedValues: ['website', 'article'] },
    'og:site_name': { required: false },
    'og:locale': { required: false },
  }

  await testMetaTags(page, ogTags, 'property')
}

/**
 * 测试Twitter Card元数据
 */
export async function testTwitterCardMetadata(page: Page): Promise<void> {
  const twitterTags: Record<string, TagRule> = {
    'twitter:card': { required: false, expectedValues: ['summary', 'summary_large_image'] },
    'twitter:title': { required: false, maxLength: 70 },
    'twitter:description': { required: false, maxLength: 200 },
    'twitter:image': { required: false, format: 'url' },
    'twitter:site': { required: false },
    'twitter:creator': { required: false },
  }

  await testMetaTags(page, twitterTags, 'name')
}

/**
 * 通用元标签测试函数
 */
async function testMetaTags(
  page: Page,
  tags: Record<string, TagRule>,
  attribute: 'name' | 'property'
): Promise<void> {
  for (const [tagName, rules] of Object.entries(tags)) {
    const metaTag = page.locator(`meta[${attribute}="${tagName}"]`)
    const count = await metaTag.count()

    if (rules.required) {
      expect(count).toBeGreaterThan(0)
    }

    if (count > 0) {
      const content = await metaTag.getAttribute('content')
      expect(content).toBeTruthy()

      if (rules.minLength) {
        expect(content!.length).toBeGreaterThan(rules.minLength)
      }
      if (rules.maxLength) {
        expect(content!.length).toBeLessThan(rules.maxLength)
      }
      if (rules.format === 'url') {
        expect(content).toMatch(/^https?:\/\//)
      }
      if (rules.format === 'color') {
        expect(content).toMatch(/^#[0-9a-fA-F]{6}$/)
      }
      if (rules.expectedValues) {
        expect(rules.expectedValues).toContain(content)
      }
    }
  }
}

/**
 * 测试结构化数据 (JSON-LD)
 */
export async function testStructuredData(page: Page): Promise<void> {
  const jsonLdScripts = page.locator('script[type="application/ld+json"]')
  const scriptCount = await jsonLdScripts.count()

  if (scriptCount > 0) {
    for (let i = 0; i < scriptCount; i++) {
      const script = jsonLdScripts.nth(i)
      const jsonContent = await script.textContent()

      expect(jsonContent).toBeTruthy()

      // 验证JSON结构
      let parsedJson: any
      expect(() => {
        parsedJson = JSON.parse(jsonContent!)
      }).not.toThrow()

      // 验证Schema.org结构
      expect(parsedJson['@context']).toBeTruthy()
      expect(parsedJson['@context']).toContain('schema.org')
      expect(parsedJson['@type']).toBeTruthy()

      // 验证特定schema类型
      await validateSchemaType(parsedJson)
    }
  }
}

/**
 * 验证特定的Schema类型
 */
async function validateSchemaType(parsedJson: any): Promise<void> {
  const schemaType = parsedJson['@type']

  switch (schemaType) {
    case 'SoftwareApplication':
      expect(parsedJson.name).toBeTruthy()
      expect(parsedJson.description).toBeTruthy()
      expect(parsedJson.applicationCategory).toBeTruthy()

      if (parsedJson.offers) {
        expect(parsedJson.offers['@type']).toBe('Offer')
        expect(parsedJson.offers.price).toBeDefined()
      }

      if (parsedJson.author) {
        expect(parsedJson.author['@type']).toBeTruthy()
        expect(parsedJson.author.name).toBeTruthy()
      }
      break

    case 'Organization':
      expect(parsedJson.name).toBeTruthy()
      expect(parsedJson.url).toBeTruthy()
      break

    case 'WebSite':
      expect(parsedJson.name).toBeTruthy()
      expect(parsedJson.url).toBeTruthy()
      break
  }
}

/**
 * 测试标题结构
 */
export async function testHeadingStructure(page: Page): Promise<void> {
  // H1标签（应该只有一个）
  const h1Tags = page.locator('h1')
  await expect(h1Tags).toHaveCount(1)

  const h1Content = await h1Tags.textContent()
  expect(h1Content).toBeTruthy()
  expect(h1Content).toContain('EchoNote')
  expect(h1Content!.length).toBeGreaterThan(TEST_CONFIG.SEO.HEADING.MIN_LENGTH)
  expect(h1Content!.length).toBeLessThan(TEST_CONFIG.SEO.HEADING.MAX_LENGTH)

  // 标题层次结构
  const headings = page.locator('h1, h2, h3, h4, h5, h6')
  const headingCount = await headings.count()
  expect(headingCount).toBeGreaterThan(1)

  // 验证标题内容
  for (let i = 0; i < Math.min(headingCount, 10); i++) {
    const heading = headings.nth(i)
    const textContent = await heading.textContent()

    expect(textContent?.trim()).toBeTruthy()
    expect(textContent!.length).toBeGreaterThan(TEST_CONFIG.ACCESSIBILITY.MIN_HEADING_LENGTH)

    // 标题应该是描述性的
    expect(textContent).not.toMatch(/^(click|here|more|read)$/i)
  }

  // H2标签用于主要部分
  const h2Tags = page.locator('h2')
  const h2Count = await h2Tags.count()
  expect(h2Count).toBeGreaterThan(0)
}

/**
 * 测试图片的SEO友好性
 */
export async function testImageSeoFriendliness(page: Page): Promise<void> {
  const images = page.locator('img')
  const imageCount = await images.count()

  for (let i = 0; i < imageCount; i++) {
    const img = images.nth(i)
    if (await img.isVisible()) {
      const alt = await img.getAttribute('alt')
      const src = await img.getAttribute('src')

      // 所有图片都应该有alt属性
      expect(alt).not.toBeNull()

      // 内容图片应该有描述性的alt文本
      if (src && !src.includes('decoration') && !src.includes('icon')) {
        expect(alt).toBeTruthy()
        expect(alt!.length).toBeGreaterThan(3)

        // Alt文本应该是描述性的，不只是文件名
        expect(alt).not.toMatch(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
        expect(alt).not.toMatch(/^(image|img|picture|photo)\d*$/i)
      }
    }
  }
}

/**
 * 测试内部链接结构
 */
export async function testInternalLinkStructure(page: Page): Promise<void> {
  const internalLinks = page.locator('a[href^="#"], a[href^="/"], a[href*="echonote"]')
  const linkCount = await internalLinks.count()

  if (linkCount > 0) {
    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = internalLinks.nth(i)
      if (await link.isVisible()) {
        const href = await link.getAttribute('href')
        const textContent = await link.textContent()

        expect(href).toBeTruthy()
        expect(textContent?.trim()).toBeTruthy()

        // 链接文本应该是描述性的
        expect(textContent).not.toMatch(/^(click here|here|more|read more|link)$/i)
        expect(textContent!.length).toBeGreaterThan(2)
      }
    }
  }

  // 测试导航链接
  const navLinks = page.locator('nav a')
  const navLinkCount = await navLinks.count()

  for (let i = 0; i < navLinkCount; i++) {
    const navLink = navLinks.nth(i)
    if (await navLink.isVisible()) {
      const href = await navLink.getAttribute('href')
      const textContent = await navLink.textContent()

      expect(href).toBeTruthy()
      expect(textContent?.trim()).toBeTruthy()
    }
  }
}

/**
 * 测试robots.txt和sitemap
 */
export async function testRobotsAndSitemap(page: Page): Promise<void> {
  // 测试robots.txt
  const robotsResponse = await page.request.get('/robots.txt')
  expect(robotsResponse.status()).toBe(200)

  const robotsContent = await robotsResponse.text()
  expect(robotsContent).toBeTruthy()
  expect(robotsContent).toMatch(/User-agent:/i)

  // 测试sitemap.xml
  const sitemapResponse = await page.request.get('/sitemap.xml')
  expect(sitemapResponse.status()).toBe(200)

  const sitemapContent = await sitemapResponse.text()
  expect(sitemapContent).toBeTruthy()
  expect(sitemapContent).toContain('<?xml')
  expect(sitemapContent).toContain('<urlset')
  expect(sitemapContent).toContain('<url>')
  expect(sitemapContent).toContain('<loc>')
}

/**
 * 测试性能优化的元标签
 */
export async function testPerformanceOptimizedMetaTags(page: Page): Promise<void> {
  // DNS预取
  const dnsPrefetch = page.locator('link[rel="dns-prefetch"]')
  if ((await dnsPrefetch.count()) > 0) {
    for (let i = 0; i < (await dnsPrefetch.count()); i++) {
      const link = dnsPrefetch.nth(i)
      const href = await link.getAttribute('href')
      expect(href).toMatch(/^(\/\/|https?:\/\/)/)
    }
  }

  // 预连接
  const preconnect = page.locator('link[rel="preconnect"]')
  if ((await preconnect.count()) > 0) {
    for (let i = 0; i < (await preconnect.count()); i++) {
      const link = preconnect.nth(i)
      const href = await link.getAttribute('href')
      expect(href).toMatch(/^https?:\/\//)
    }
  }

  // 主题颜色
  const themeColor = page.locator('meta[name="theme-color"]')
  if ((await themeColor.count()) > 0) {
    const color = await themeColor.getAttribute('content')
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
  }

  // PWA清单
  const manifest = page.locator('link[rel="manifest"]')
  if ((await manifest.count()) > 0) {
    const href = await manifest.getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).toMatch(/\.json$/)
  }
}
