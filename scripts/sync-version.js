#!/usr/bin/env node

/**
 * Manual Version Synchronization Script
 *
 * This script fetches the latest version information from the main EchoNote repository
 * and updates the local project-info.json file.
 *
 * Usage:
 *   node scripts/sync-version.js [--force] [--repo owner/repo]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
// 读取应用配置 (预留用于未来配置读取)
const DEFAULT_REPO = 'johnnyzhao5619/echonote'
const GITHUB_API_BASE = 'https://api.github.com'
const PROJECT_INFO_PATH = join(__dirname, '../src/data/project-info.json')
const PACKAGE_JSON_PATH = join(__dirname, '../package.json')

// Parse command line arguments
const args = process.argv.slice(2)
const forceUpdate = args.includes('--force')
const repoIndex = args.indexOf('--repo')
const targetRepo = repoIndex !== -1 && args[repoIndex + 1] ? args[repoIndex + 1] : DEFAULT_REPO

console.log('🔄 EchoNote Version Synchronization')
console.log(`📦 Target repository: ${targetRepo}`)
console.log(`🔧 Force update: ${forceUpdate}`)
console.log('')

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'EchoNote-Introduction-Sync',
        },
      })

      if (response.ok) {
        return response
      }

      if (response.status === 404) {
        throw new Error(`Repository ${targetRepo} not found`)
      }

      if (response.status === 403) {
        const remaining = response.headers.get('X-RateLimit-Remaining')
        const resetTime = response.headers.get('X-RateLimit-Reset')

        if (remaining === '0' && resetTime) {
          const resetDate = new Date(parseInt(resetTime) * 1000)
          const waitTime = resetDate.getTime() - Date.now()

          if (waitTime > 0 && waitTime < 300000) {
            // Wait max 5 minutes
            console.log(`⏳ Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)} seconds...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
            continue
          }
        }

        throw new Error('GitHub API rate limit exceeded. Please try again later.')
      }

      if (i === retries - 1) {
        throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      if (i === retries - 1) {
        throw error
      }
      console.log(`⚠️  Attempt ${i + 1} failed, retrying...`)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

async function fetchRepositoryInfo() {
  console.log('📡 Fetching repository information...')

  try {
    // Fetch repository data
    const repoResponse = await fetchWithRetry(`${GITHUB_API_BASE}/repos/${targetRepo}`)
    const repo = await repoResponse.json()

    // Fetch latest release
    let latestRelease = null
    try {
      const releaseResponse = await fetchWithRetry(
        `${GITHUB_API_BASE}/repos/${targetRepo}/releases/latest`
      )
      latestRelease = await releaseResponse.json()
      console.log(`Found latest release: ${latestRelease.tag_name}`)
    } catch {
      console.log('No releases found or error fetching release')
    }

    // Fetch contributors
    let contributorsCount = 0
    try {
      const contributorsResponse = await fetchWithRetry(
        `${GITHUB_API_BASE}/repos/${targetRepo}/contributors?per_page=100`
      )
      const contributors = await contributorsResponse.json()
      contributorsCount = contributors.length
      console.log(`Found ${contributorsCount} contributors`)
    } catch {
      console.log('Error fetching contributors count')
    }

    // Prepare version information
    const versionInfo = {
      version: latestRelease?.tag_name || 'v1.2.0',
      releaseDate: latestRelease?.published_at || new Date().toISOString(),
      releaseNotes: latestRelease?.body || 'No release notes available',
      downloadUrl: latestRelease?.html_url || `https://github.com/${targetRepo}/releases`,
      stats: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        contributors: contributorsCount,
        openIssues: repo.open_issues_count,
        language: repo.language || 'Unknown',
        license: repo.license?.name || 'Unknown',
        lastUpdated: repo.updated_at,
        description: repo.description || '',
      },
      lastSync: new Date().toISOString(),
    }

    console.log('📊 Repository statistics:')
    console.log(`   ⭐ Stars: ${versionInfo.stats.stars}`)
    console.log(`   🍴 Forks: ${versionInfo.stats.forks}`)
    console.log(`   👥 Contributors: ${versionInfo.stats.contributors}`)
    console.log(`   📝 Version: ${versionInfo.version}`)

    return versionInfo
  } catch (error) {
    console.error('❌ Error fetching repository information:', error.message)

    // Return fallback data
    return {
      version: 'v1.2.0',
      releaseDate: new Date().toISOString(),
      releaseNotes: 'Unable to fetch release information',
      downloadUrl: `https://github.com/${targetRepo}/releases`,
      stats: {
        stars: 0,
        forks: 0,
        watchers: 0,
        contributors: 0,
        openIssues: 0,
        language: 'Python',
        license: 'Apache-2.0',
        lastUpdated: new Date().toISOString(),
        description: 'Smart voice transcription and calendar management desktop application',
      },
      lastSync: new Date().toISOString(),
      error: error.message,
    }
  }
}

function hasSignificantChanges(oldInfo, newInfo) {
  if (!oldInfo) return true

  const significantFields = ['version', 'stats.stars', 'stats.forks', 'stats.contributors']

  for (const field of significantFields) {
    const oldValue = field.includes('.')
      ? field.split('.').reduce((obj, key) => obj?.[key], oldInfo)
      : oldInfo[field]
    const newValue = field.includes('.')
      ? field.split('.').reduce((obj, key) => obj?.[key], newInfo)
      : newInfo[field]

    if (oldValue !== newValue) {
      console.log(`📈 Change detected in ${field}: ${oldValue} → ${newValue}`)
      return true
    }
  }

  return false
}

function updatePackageVersion(version) {
  try {
    const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8'))
    const newVersion = version.replace('v', '')

    if (packageJson.version !== newVersion) {
      packageJson.version = newVersion
      writeFileSync(PACKAGE_JSON_PATH, `${JSON.stringify(packageJson, null, 2)}\n`)
      console.log(`📦 Updated package.json version to ${newVersion}`)
      return true
    }

    return false
  } catch (error) {
    console.error('⚠️  Error updating package.json:', error.message)
    return false
  }
}

async function main() {
  try {
    // Fetch new version information
    const newVersionInfo = await fetchRepositoryInfo()

    // Read existing version information
    let oldVersionInfo = null
    if (existsSync(PROJECT_INFO_PATH)) {
      try {
        oldVersionInfo = JSON.parse(readFileSync(PROJECT_INFO_PATH, 'utf8'))
      } catch {
        console.log('⚠️  Error reading existing project info, will create new file')
      }
    }

    // Check if update is needed
    const hasChanges = hasSignificantChanges(oldVersionInfo, newVersionInfo)

    if (!hasChanges && !forceUpdate) {
      console.log('✅ No significant changes detected. Use --force to update anyway.')
      return
    }

    // Write updated version information
    writeFileSync(PROJECT_INFO_PATH, JSON.stringify(newVersionInfo, null, 2))
    console.log('✅ Updated project-info.json')

    // Update package.json version if needed
    updatePackageVersion(newVersionInfo.version)

    console.log('')
    console.log('🎉 Version synchronization completed successfully!')

    if (newVersionInfo.error) {
      console.log('⚠️  Note: Some data may be incomplete due to API errors')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Synchronization failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
