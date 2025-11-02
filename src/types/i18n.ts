// Internationalization types

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface NavigationMessages {
  home: string;
  features: string;
  quickStart: string;
  technical: string;
  community: string;
  github: string;
}

export interface HeroMessages {
  title: string;
  tagline: string;
  description: string;
  downloadButton: string;
  docsButton: string;
  githubButton: string;
}

export interface FeatureMessages {
  title: string;
  subtitle: string;
  privacyTitle: string;
  privacyDescription: string;
  localTitle: string;
  localDescription: string;
  smartTitle: string;
  smartDescription: string;
}

export interface QuickStartMessages {
  title: string;
  subtitle: string;
  installationTitle: string;
  requirementsTitle: string;
  configurationTitle: string;
}

export interface TechnicalMessages {
  title: string;
  subtitle: string;
  architectureTitle: string;
  techStackTitle: string;
  performanceTitle: string;
}

export interface CommunityMessages {
  title: string;
  subtitle: string;
  contributorsTitle: string;
  supportTitle: string;
  roadmapTitle: string;
}

export interface FooterMessages {
  license: string;
  version: string;
  lastUpdated: string;
}

export interface CommonMessages {
  loading: string;
  error: string;
  retry: string;
  copy: string;
  copied: string;
  learnMore: string;
}

export interface I18nMessages {
  nav: NavigationMessages;
  hero: HeroMessages;
  features: FeatureMessages;
  quickStart: QuickStartMessages;
  technical: TechnicalMessages;
  community: CommunityMessages;
  footer: FooterMessages;
  common: CommonMessages;
}
