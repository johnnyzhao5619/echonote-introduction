/**
 * Utility functions for social media sharing with UTM tracking
 */

export interface SocialShareConfig {
  url: string
  title: string
  description: string
  hashtags?: string[]
  via?: string
}

/**
 * Generate UTM parameters for tracking social media traffic
 */
export function generateUTMParams(
  source: string,
  medium = 'social',
  campaign = 'echonote_introduction'
) {
  return {
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
    utm_content: 'social_share',
  }
}

/**
 * Add UTM parameters to a URL
 */
export function addUTMToUrl(
  baseUrl: string,
  source: string,
  medium?: string,
  campaign?: string
): string {
  const url = new URL(baseUrl)
  const params = generateUTMParams(source, medium, campaign)

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return url.toString()
}

/**
 * Generate Facebook share URL
 */
export function getFacebookShareUrl(config: SocialShareConfig): string {
  const trackedUrl = addUTMToUrl(config.url, 'facebook')
  const shareUrl = new URL('https://www.facebook.com/sharer/sharer.php')
  shareUrl.searchParams.set('u', trackedUrl)
  return shareUrl.toString()
}

/**
 * Generate Twitter share URL
 */
export function getTwitterShareUrl(config: SocialShareConfig): string {
  const trackedUrl = addUTMToUrl(config.url, 'twitter')
  const shareUrl = new URL('https://twitter.com/intent/tweet')

  shareUrl.searchParams.set('url', trackedUrl)
  shareUrl.searchParams.set('text', config.title)

  if (config.hashtags && config.hashtags.length > 0) {
    shareUrl.searchParams.set('hashtags', config.hashtags.join(','))
  }

  if (config.via) {
    shareUrl.searchParams.set('via', config.via)
  }

  return shareUrl.toString()
}

/**
 * Generate LinkedIn share URL
 */
export function getLinkedInShareUrl(config: SocialShareConfig): string {
  const trackedUrl = addUTMToUrl(config.url, 'linkedin')
  const shareUrl = new URL('https://www.linkedin.com/sharing/share-offsite/')
  shareUrl.searchParams.set('url', trackedUrl)
  return shareUrl.toString()
}

/**
 * Generate WhatsApp share URL
 */
export function getWhatsAppShareUrl(config: SocialShareConfig): string {
  const trackedUrl = addUTMToUrl(config.url, 'whatsapp')
  const shareUrl = new URL('https://wa.me/')
  shareUrl.searchParams.set('text', `${config.title} - ${trackedUrl}`)
  return shareUrl.toString()
}

/**
 * Generate Telegram share URL
 */
export function getTelegramShareUrl(config: SocialShareConfig): string {
  const trackedUrl = addUTMToUrl(config.url, 'telegram')
  const shareUrl = new URL('https://t.me/share/url')
  shareUrl.searchParams.set('url', trackedUrl)
  shareUrl.searchParams.set('text', config.title)
  return shareUrl.toString()
}

/**
 * Generate email share URL
 */
export function getEmailShareUrl(config: SocialShareConfig): string {
  const trackedUrl = addUTMToUrl(config.url, 'email', 'email')
  const subject = encodeURIComponent(config.title)
  const body = encodeURIComponent(`${config.description}\n\n${trackedUrl}`)
  return `mailto:?subject=${subject}&body=${body}`
}

/**
 * Copy URL to clipboard with UTM tracking
 */
export async function copyShareUrl(config: SocialShareConfig): Promise<boolean> {
  try {
    const trackedUrl = addUTMToUrl(config.url, 'clipboard', 'direct')
    await navigator.clipboard.writeText(trackedUrl)
    return true
  } catch (error) {
    console.error('Failed to copy URL to clipboard:', error)
    return false
  }
}

/**
 * Get all social sharing URLs for a given configuration
 */
export function getAllSocialShareUrls(config: SocialShareConfig) {
  return {
    facebook: getFacebookShareUrl(config),
    twitter: getTwitterShareUrl(config),
    linkedin: getLinkedInShareUrl(config),
    whatsapp: getWhatsAppShareUrl(config),
    telegram: getTelegramShareUrl(config),
    email: getEmailShareUrl(config),
  }
}
