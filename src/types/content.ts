// Content data types for EchoNote introduction page

export interface ProjectMetadata {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  version: string;
}

export interface CTAButton {
  text: string;
  href: string;
  variant: 'primary' | 'secondary';
  external?: boolean;
}

export interface HeroContent {
  title: string;
  tagline: string;
  description: string;
  features: string[];
  ctaButtons: CTAButton[];
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  highlights: string[];
  demoImage?: string;
  codeExample?: CodeExample;
}

export interface CodeExample {
  language: string;
  code: string;
  filename?: string;
}

export interface InstallationStep {
  id: string;
  title: string;
  description: string;
  commands: string[];
  platform?: 'windows' | 'macos' | 'linux' | 'all';
}

export interface SystemRequirement {
  category: string;
  items: string[];
}

export interface TechStackItem {
  name: string;
  description: string;
  icon: string;
  category: 'frontend' | 'backend' | 'database' | 'tools';
}

export interface ProjectContent {
  metadata: ProjectMetadata;
  hero: HeroContent;
  features: FeatureItem[];
  quickStart: {
    installation: InstallationStep[];
    requirements: SystemRequirement[];
  };
  technical: {
    techStack: TechStackItem[];
  };
}
