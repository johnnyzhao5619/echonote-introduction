import { ref, computed } from 'vue'
import type { ProjectInfo } from '@/types/project-info'

// Import the project info data
import projectInfoData from '@/data/project-info.json'

const projectInfo = ref<ProjectInfo>(projectInfoData as ProjectInfo)

export function useProjectInfo() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const formattedVersion = computed(() => {
    return projectInfo.value.version.startsWith('v')
      ? projectInfo.value.version
      : `v${projectInfo.value.version}`
  })

  const formattedReleaseDate = computed(() => {
    return new Date(projectInfo.value.releaseDate).toLocaleDateString()
  })

  const isDataStale = computed(() => {
    const lastSync = new Date(projectInfo.value.lastSync)
    const now = new Date()
    const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)
    return hoursSinceSync > 24 // Consider stale if older than 24 hours
  })

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formattedStats = computed(() => ({
    stars: formatNumber(projectInfo.value.stats.stars),
    forks: formatNumber(projectInfo.value.stats.forks),
    contributors: formatNumber(projectInfo.value.stats.contributors),
    watchers: formatNumber(projectInfo.value.stats.watchers),
  }))

  const refreshProjectInfo = async () => {
    isLoading.value = true
    error.value = null

    try {
      // In a real implementation, this would fetch fresh data
      // For now, we use the static data that gets updated by the workflow
      console.log('Project info refreshed from static data')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  return {
    projectInfo: projectInfo.value,
    isLoading,
    error,
    formattedVersion,
    formattedReleaseDate,
    formattedStats,
    isDataStale,
    refreshProjectInfo,
  }
}
