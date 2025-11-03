/**
 * 测试ID常量 - 集中管理所有data-testid，避免硬编码和重复
 */
export const TEST_IDS = {
  // Navigation
  LANGUAGE_SWITCHER: 'language-switcher',
  LANGUAGE_OPTION: 'language-option',
  MOBILE_MENU_BUTTON: 'mobile-menu-button',
  MOBILE_MENU: 'mobile-menu',

  // Sections
  HERO_SECTION: 'hero-section',
  FEATURES_SECTION: 'features-section',
  QUICKSTART_SECTION: 'quickstart-section',
  TECHNICAL_SECTION: 'technical-section',
  COMMUNITY_SECTION: 'community-section',

  // Components
  FEATURE_CARD: 'feature-card',
  CODE_BLOCK: 'code-block',
  COPY_BUTTON: 'copy-button',
  STATS_DISPLAY: 'stats-display',
  STAT_ITEM: 'stat-item',

  // CTA Buttons
  DOWNLOAD_BUTTON: 'download-button',
  DOCS_BUTTON: 'docs-button',
  GITHUB_BUTTON: 'github-button',
} as const

/**
 * 生成CTA按钮的测试ID
 */
export function getCtaButtonTestId(buttonText: string): string {
  const text = buttonText.toLowerCase()

  if (text.includes('download')) return TEST_IDS.DOWNLOAD_BUTTON
  if (text.includes('docs') || text.includes('documentation')) return TEST_IDS.DOCS_BUTTON
  if (text.includes('github')) return TEST_IDS.GITHUB_BUTTON

  return `cta-button-${text.replace(/\s+/g, '-')}`
}
