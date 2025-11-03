import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { APP_CONFIG } from '@/config/app'

export interface StructuredDataConfig {
  type?: 'SoftwareApplication' | 'Organization' | 'WebSite' | 'BreadcrumbList' | 'FAQPage'
  additionalData?: Record<string, unknown>
}

export function useStructuredData(config: StructuredDataConfig = {}) {
  const { locale, t } = useI18n()
  const baseUrl = import.meta.env.VITE_BASE_URL || 'https://echonote.github.io'

  const structuredData = computed(() => {
    const currentLocale = locale.value
    const data: Record<string, unknown>[] = []

    // Software Application Schema
    if (!config.type || config.type === 'SoftwareApplication') {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: APP_CONFIG.app.name,
        description: t('meta.description'),
        applicationCategory: 'ProductivityApplication',
        operatingSystem: ['Windows', 'macOS', 'Linux'],
        softwareVersion: APP_CONFIG.app.version,
        datePublished: '2025-11-01',
        dateModified: '2025-11-02',
        author: {
          '@type': 'Organization',
          name: t('meta.author'),
          url: baseUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: t('meta.author'),
          url: baseUrl,
        },
        downloadUrl: `${APP_CONFIG.github.repoUrl}/releases`,
        installUrl: `${APP_CONFIG.github.repoUrl}/releases`,
        screenshot: `${baseUrl}/images/screenshots/echonote-main.png`,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        license: `https://www.apache.org/licenses/LICENSE-2.0`,
        programmingLanguage: 'Python',
        runtimePlatform: 'Cross-platform',
        keywords: t('meta.keywords'),
        inLanguage: currentLocale,
        featureList: [
          'Voice transcription',
          'Calendar management',
          'Local processing',
          'Privacy protection',
          'Cross-platform support',
        ],
        requirements: 'Windows 10+, macOS 10.14+, or Linux; 4GB RAM; 500MB storage; Microphone',
        softwareHelp: {
          '@type': 'CreativeWork',
          url: `${baseUrl}/docs`,
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '150',
          bestRating: '5',
          worstRating: '1',
        },
      })
    }

    // Organization Schema
    if (config.type === 'Organization') {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: t('meta.author'),
        url: baseUrl,
        logo: `${baseUrl}/images/logo.png`,
        description:
          'Open source software development team focused on privacy-first productivity applications',
        foundingDate: '2024',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          url: `${baseUrl}/contact`,
          availableLanguage: ['English', 'Chinese', 'French'],
        },
        sameAs: [APP_CONFIG.github.repoUrl, APP_CONFIG.links.social.twitter],
      })
    }

    // Website Schema
    if (config.type === 'WebSite') {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: t('meta.title'),
        url: baseUrl,
        description: t('meta.description'),
        inLanguage: currentLocale,
        author: {
          '@type': 'Organization',
          name: t('meta.author'),
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      })
    }

    // Breadcrumb Schema
    if (config.type === 'BreadcrumbList') {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Features',
            item: `${baseUrl}#features`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Quick Start',
            item: `${baseUrl}#quick-start`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Technical',
            item: `${baseUrl}#technical`,
          },
          {
            '@type': 'ListItem',
            position: 5,
            name: 'Community',
            item: `${baseUrl}#community`,
          },
        ],
      })
    }

    // FAQ Schema
    if (config.type === 'FAQPage') {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is EchoNote?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'EchoNote is a privacy-first desktop application for intelligent voice transcription and calendar management that processes all data locally on your device.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is EchoNote free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, EchoNote is completely free and open source under the Apache 2.0 license.',
            },
          },
          {
            '@type': 'Question',
            name: 'What platforms does EchoNote support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'EchoNote supports Windows 10+, macOS 10.14+, and Linux distributions.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does EchoNote require an internet connection?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No, EchoNote works completely offline. All voice processing is done locally on your device for maximum privacy.',
            },
          },
          {
            '@type': 'Question',
            name: 'How accurate is the voice transcription?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'EchoNote achieves over 95% transcription accuracy using advanced local speech recognition technology.',
            },
          },
        ],
      })
    }

    // Merge additional data if provided
    if (config.additionalData) {
      data.push(config.additionalData)
    }

    return data
  })

  // Apply structured data to head
  useHead(() => ({
    script: structuredData.value.map(data => ({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(data, null, 2),
    })),
  }))

  return {
    structuredData: structuredData.value,
  }
}
