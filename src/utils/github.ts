import type { GitHubRepository, GitHubRelease } from '@/types/project-info'
import { APP_CONFIG } from '@/config/app'

const GITHUB_API_BASE = APP_CONFIG.github.apiBase
const MAIN_REPO = APP_CONFIG.github.fullRepo

export class GitHubAPI {
  private static async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'EchoNote-Introduction-Page',
          },
        })

        if (response.ok) {
          return response
        }

        if (response.status === 403) {
          // Rate limit exceeded
          const resetTime = response.headers.get('X-RateLimit-Reset')
          if (resetTime) {
            const resetDate = new Date(parseInt(resetTime) * 1000)
            const waitTime = resetDate.getTime() - Date.now()
            if (waitTime > 0 && waitTime < 60000) {
              // Wait max 1 minute
              await new Promise(resolve => setTimeout(resolve, waitTime))
              continue
            }
          }
        }

        if (i === retries - 1) {
          throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        if (i === retries - 1) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))) // Exponential backoff
      }
    }

    throw new Error('Failed to fetch after retries')
  }

  static async getRepository(): Promise<GitHubRepository> {
    const response = await this.fetchWithRetry(`${GITHUB_API_BASE}/repos/${MAIN_REPO}`)
    return response.json()
  }

  static async getLatestRelease(): Promise<GitHubRelease> {
    const response = await this.fetchWithRetry(
      `${GITHUB_API_BASE}/repos/${MAIN_REPO}/releases/latest`
    )
    return response.json()
  }

  static async getReleases(limit = 10): Promise<GitHubRelease[]> {
    const response = await this.fetchWithRetry(
      `${GITHUB_API_BASE}/repos/${MAIN_REPO}/releases?per_page=${limit}`
    )
    return response.json()
  }

  static async getContributors(): Promise<
    Array<{ login: string; contributions: number; avatar_url: string }>
  > {
    const response = await this.fetchWithRetry(
      `${GITHUB_API_BASE}/repos/${MAIN_REPO}/contributors?per_page=100`
    )
    return response.json()
  }

  static async getRepositoryStats() {
    try {
      const [repo, contributors] = await Promise.all([this.getRepository(), this.getContributors()])

      let latestRelease: GitHubRelease | null = null
      try {
        latestRelease = await this.getLatestRelease()
      } catch (error) {
        console.warn('No releases found or error fetching latest release:', error)
      }

      return {
        repository: repo,
        contributors,
        latestRelease,
        stats: {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          watchers: repo.watchers_count,
          contributors: contributors.length,
          openIssues: repo.open_issues_count,
          language: repo.language,
          license: repo.license?.name || 'Unknown',
          lastUpdated: repo.updated_at,
          description: repo.description || '',
        },
      }
    } catch (error) {
      console.error('Error fetching GitHub stats:', error)
      throw error
    }
  }

  static formatReleaseNotes(body: string): string {
    if (!body) return 'No release notes available.'

    // Clean up common GitHub release note formatting
    return body
      .replace(/\r\n/g, '\n')
      .replace(/^#+\s*/gm, '### ') // Normalize headers
      .replace(/\*\*(.*?)\*\*/g, '**$1**') // Ensure bold formatting
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .trim()
  }

  static isRateLimited(error: unknown): boolean {
    return (
      (error instanceof Error && error.message?.includes('403')) ||
      (error instanceof Error && error.message?.includes('rate limit'))
    )
  }
}
