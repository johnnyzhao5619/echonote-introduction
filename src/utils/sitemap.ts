// Sitemap generation utilities

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

interface SitemapConfig {
  baseUrl: string
  defaultChangefreq: SitemapUrl['changefreq']
  defaultPriority: number
}

import { APP_CONFIG } from '@/config/app'

const defaultConfig: SitemapConfig = {
  baseUrl: APP_CONFIG.deployment.baseUrl,
  defaultChangefreq: 'weekly',
  defaultPriority: 0.5,
}

// Define site structure
const siteUrls: SitemapUrl[] = [
  {
    loc: '/',
    changefreq: 'weekly',
    priority: 1.0,
  },
  {
    loc: '/#features',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    loc: '/#quick-start',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    loc: '/#technical',
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    loc: '/#community',
    changefreq: 'weekly',
    priority: 0.6,
  },
  {
    loc: '/about',
    changefreq: 'monthly',
    priority: 0.5,
  },
]

export function generateSitemap(config: Partial<SitemapConfig> = {}): string {
  const finalConfig = { ...defaultConfig, ...config }
  const currentDate = new Date().toISOString().split('T')[0]

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`

  siteUrls.forEach(url => {
    const fullUrl = `${finalConfig.baseUrl}${url.loc}`
    const changefreq = url.changefreq || finalConfig.defaultChangefreq
    const priority = url.priority || finalConfig.defaultPriority
    const lastmod = url.lastmod || currentDate

    sitemap += `
  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`

    // Add alternate language versions
    const languages = ['en', 'zh-CN', 'zh-TW', 'fr']
    languages.forEach(lang => {
      sitemap += `
    <xhtml:link rel="alternate" hreflang="${lang}" href="${fullUrl}?lang=${lang}" />`
    })

    sitemap += `
  </url>`
  })

  sitemap += `
</urlset>`

  return sitemap
}

export function generateRobotsTxt(config: Partial<SitemapConfig> = {}): string {
  const finalConfig = { ...defaultConfig, ...config }

  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${finalConfig.baseUrl}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1

# Disallow certain paths (if any)
# Disallow: /private/
# Disallow: /admin/

# Allow specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Block AI training bots (optional)
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /`
}

// SEO utilities
export function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'EchoNote',
    description:
      'Smart voice transcription and calendar management desktop application with privacy-first approach',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: ['Windows', 'macOS', 'Linux'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'EchoNote Team',
      url: `https://github.com/${APP_CONFIG.github.owner}`,
    },
    downloadUrl: APP_CONFIG.github.releasesUrl,
    softwareVersion: '1.2.0',
    datePublished: '2025-11-01',
    dateModified: new Date().toISOString().split('T')[0],
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
    programmingLanguage: 'Python',
    runtimePlatform: 'Cross-platform',
    keywords: [
      'voice transcription',
      'speech recognition',
      'calendar management',
      'privacy-first',
      'local processing',
      'desktop application',
      'open source',
    ],
    screenshot: `${APP_CONFIG.deployment.baseUrl}/images/screenshots/main-interface.png`,
    featureList: [
      'Voice-to-text transcription',
      'Calendar integration',
      'Local data processing',
      'Privacy protection',
      'Cross-platform support',
      'Open source',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
  }
}

export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Meta tag utilities
export function generateMetaTags(config: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: string
  locale?: string
}) {
  const baseUrl = APP_CONFIG.deployment.baseUrl
  const defaultImage = `${baseUrl}/images/social/echonote-social-preview.png`

  return {
    // Basic meta tags
    title: config.title,
    description: config.description,
    keywords: config.keywords?.join(', ') || '',

    // Open Graph
    'og:title': config.title,
    'og:description': config.description,
    'og:image': config.image || defaultImage,
    'og:url': config.url || baseUrl,
    'og:type': config.type || 'website',
    'og:locale': config.locale || 'en_US',
    'og:site_name': 'EchoNote',

    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:title': config.title,
    'twitter:description': config.description,
    'twitter:image': config.image || defaultImage,
    'twitter:site': '@echonote',
    'twitter:creator': '@echonote',

    // Additional meta tags
    'theme-color': '#667eea',
    'msapplication-TileColor': '#667eea',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'EchoNote',
  }
}
