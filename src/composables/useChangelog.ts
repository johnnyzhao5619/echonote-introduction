import { ref, computed } from 'vue'
import type { ChangelogData, ChangelogRelease, ParsedReleaseNotes } from '@/types/changelog'

// Import the changelog data
import changelogData from '@/data/changelog.json'

const changelog = ref<ChangelogData>(changelogData as ChangelogData)

export function useChangelog() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const latestRelease = computed(() => {
    return changelog.value.releases[0] || null
  })

  const recentReleases = computed(() => {
    return changelog.value.releases.slice(0, 5)
  })

  const stableReleases = computed(() => {
    return changelog.value.releases.filter(release => !release.prerelease)
  })

  const prereleases = computed(() => {
    return changelog.value.releases.filter(release => release.prerelease)
  })

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatRelativeDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
    return `${Math.ceil(diffDays / 365)} years ago`
  }

  const parseReleaseNotes = (body: string): ParsedReleaseNotes => {
    const sections: ParsedReleaseNotes = {
      features: [],
      bugFixes: [],
      improvements: [],
      breaking: [],
      other: [],
    }

    if (!body) return sections

    const lines = body.split('\n')
    let currentSection = 'other'

    for (const line of lines) {
      const trimmedLine = line.trim()

      // Detect section headers
      if (trimmedLine.toLowerCase().includes('feature')) {
        currentSection = 'features'
        continue
      } else if (
        trimmedLine.toLowerCase().includes('bug') ||
        trimmedLine.toLowerCase().includes('fix')
      ) {
        currentSection = 'bugFixes'
        continue
      } else if (
        trimmedLine.toLowerCase().includes('improvement') ||
        trimmedLine.toLowerCase().includes('enhance')
      ) {
        currentSection = 'improvements'
        continue
      } else if (trimmedLine.toLowerCase().includes('breaking')) {
        currentSection = 'breaking'
        continue
      }

      // Extract list items
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const item = trimmedLine.substring(2).trim()
        if (item) {
          sections[currentSection as keyof ParsedReleaseNotes].push(item)
        }
      }
    }

    return sections
  }

  const getTotalDownloads = (release: ChangelogRelease): number => {
    return release.assets.reduce((total, asset) => total + asset.downloadCount, 0)
  }

  const getAllTimeDownloads = computed(() => {
    return changelog.value.releases.reduce((total, release) => {
      return total + getTotalDownloads(release)
    }, 0)
  })

  const getDownloadsByPlatform = computed(() => {
    const platforms = {
      windows: 0,
      macos: 0,
      linux: 0,
      other: 0,
    }

    changelog.value.releases.forEach(release => {
      release.assets.forEach(asset => {
        const name = asset.name.toLowerCase()
        if (name.includes('windows') || name.includes('.exe')) {
          platforms.windows += asset.downloadCount
        } else if (name.includes('macos') || name.includes('darwin') || name.includes('.dmg')) {
          platforms.macos += asset.downloadCount
        } else if (
          name.includes('linux') ||
          name.includes('.appimage') ||
          name.includes('.deb') ||
          name.includes('.rpm')
        ) {
          platforms.linux += asset.downloadCount
        } else {
          platforms.other += asset.downloadCount
        }
      })
    })

    return platforms
  })

  const refreshChangelog = async () => {
    isLoading.value = true
    error.value = null

    try {
      // In a real implementation, this would fetch fresh data
      // For now, we use the static data that gets updated by the workflow
      console.log('Changelog refreshed from static data')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  return {
    changelog: changelog.value,
    isLoading,
    error,
    latestRelease,
    recentReleases,
    stableReleases,
    prereleases,
    formatFileSize,
    formatDate,
    formatRelativeDate,
    parseReleaseNotes,
    getTotalDownloads,
    getAllTimeDownloads,
    getDownloadsByPlatform,
    refreshChangelog,
  }
}
