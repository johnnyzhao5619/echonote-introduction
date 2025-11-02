// GitHub API types

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string
  created_at: string
  updated_at: string
  pushed_at: string
  license: {
    key: string
    name: string
    spdx_id: string
  }
}

export interface GitHubRelease {
  id: number
  tag_name: string
  name: string
  body: string
  published_at: string
  html_url: string
  assets: GitHubAsset[]
}

export interface GitHubAsset {
  id: number
  name: string
  download_count: number
  browser_download_url: string
}

export interface GitHubContributor {
  id: number
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

export interface GitHubStats {
  stars: number
  forks: number
  contributors: number
  releases: number
  lastUpdate: string
  version: string
}
