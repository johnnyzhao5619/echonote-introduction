export interface ProjectStats {
  stars: number
  forks: number
  watchers: number
  contributors: number
  openIssues: number
  language: string
  license: string
  lastUpdated: string
  description: string
}

export interface ProjectInfo {
  version: string
  releaseDate: string
  releaseNotes: string
  downloadUrl: string
  stats: ProjectStats
  lastSync: string
  error?: string
}

export interface GitHubRelease {
  tag_name: string
  name: string
  body: string
  published_at: string
  html_url: string
  assets: Array<{
    name: string
    download_count: number
    browser_download_url: string
  }>
}

export interface GitHubRepository {
  name: string
  full_name: string
  description: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  language: string
  license: {
    name: string
    spdx_id: string
  } | null
  updated_at: string
  created_at: string
}
