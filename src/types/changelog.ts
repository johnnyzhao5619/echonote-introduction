export interface ChangelogAsset {
  name: string
  downloadUrl: string
  downloadCount: number
  size: number
}

export interface ChangelogRelease {
  version: string
  date: string
  title: string
  body: string
  url: string
  prerelease: boolean
  assets: ChangelogAsset[]
}

export interface ChangelogData {
  lastUpdated: string
  releases: ChangelogRelease[]
}

export interface ParsedReleaseNotes {
  features: string[]
  bugFixes: string[]
  improvements: string[]
  breaking: string[]
  other: string[]
}
