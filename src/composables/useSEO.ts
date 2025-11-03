import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { APP_CONFIG } from '@/config/app'

export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
}

export function useSEO(config: SEOConfig = {}) {
  const { locale, t } = useI18n()

  // Get base URL from environment or default
  const baseUrl = import.meta.env.VITE_BASE_URL || 'https://echonote.github.io'

  // Compute SEO metadata based on current locale and config
  const seoData = computed(() => {
    const currentLocale = locale.value
    const title = config.title || t('meta.title')
    const description = config.description || t('meta.description')
    const keywords = config.keywords || t('meta.keywords')
    const author = t('meta.author')

    // Generate alternate language URLs
    const alternateUrls = ['en', 'zh-CN', 'zh-TW', 'fr'].map((lang: string) => ({
      locale: lang,
      url: `${baseUrl}${config.url || ''}${lang !== 'en' ? `?lang=${lang}` : ''}`,
    }))

    return {
      title,
      description,
      keywords,
      author,
      locale: currentLocale,
      url: `${baseUrl}${config.url || ''}`,
      image: config.image || `${baseUrl}/images/social/echonote-og-${currentLocale}.png`,
      alternateUrls,
      siteName: APP_CONFIG.app.name,
    }
  })

  // Apply head metadata
  useHead(() => {
    const data = seoData.value

    return {
      title: data.title,
      meta: [
        // Basic meta tags
        { name: 'description', content: data.description },
        { name: 'keywords', content: data.keywords },
        { name: 'author', content: data.author },
        { name: 'robots', content: 'index, follow' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },

        // Open Graph meta tags
        { property: 'og:title', content: data.title },
        { property: 'og:description', content: data.description },
        { property: 'og:image', content: data.image },
        { property: 'og:url', content: data.url },
        { property: 'og:type', content: config.type || 'website' },
        { property: 'og:site_name', content: data.siteName },
        { property: 'og:locale', content: data.locale },

        // Twitter Card meta tags
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: data.title },
        { name: 'twitter:description', content: data.description },
        { name: 'twitter:image', content: data.image },
        { name: 'twitter:image:alt', content: `${data.siteName} - ${data.title}` },
        { name: 'twitter:site', content: '@echonote_app' },
        { name: 'twitter:creator', content: '@echonote_app' },

        // LinkedIn specific meta tags
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: `${data.siteName} - ${data.title}` },

        // Additional Open Graph tags for better social sharing
        { property: 'og:locale:alternate', content: 'zh_CN' },
        { property: 'og:locale:alternate', content: 'zh_TW' },
        { property: 'og:locale:alternate', content: 'fr_FR' },

        // Additional meta tags
        { name: 'theme-color', content: '#3B82F6' },
        { name: 'msapplication-TileColor', content: '#3B82F6' },
        { name: 'application-name', content: data.siteName },
        { name: 'apple-mobile-web-app-title', content: data.siteName },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      ],
      link: [
        // Canonical URL
        { rel: 'canonical', href: data.url },

        // Alternate language versions
        ...data.alternateUrls.map((alt: { locale: string; url: string }) => ({
          rel: 'alternate',
          hreflang: alt.locale,
          href: alt.url,
        })),

        // Favicon and app icons
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      htmlAttrs: {
        lang: data.locale,
      },
    }
  })

  return {
    seoData: seoData.value,
  }
}
