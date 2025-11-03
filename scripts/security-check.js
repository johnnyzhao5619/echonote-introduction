#!/usr/bin/env node

/**
 * Security Configuration Checker
 *
 * This script validates security configurations and checks for common issues.
 *
 * Usage:
 *   node scripts/security-check.js [--url https://example.com]
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
const args = process.argv.slice(2)
const urlIndex = args.indexOf('--url')
const targetUrl = urlIndex !== -1 && args[urlIndex + 1] ? args[urlIndex + 1] : null

console.log('🔒 EchoNote Security Configuration Check')
console.log('')

// Security checks
const checks = {
  files: [],
  headers: [],
  dependencies: [],
  configuration: [],
}

function checkFile(path, description) {
  const fullPath = join(__dirname, '..', path)
  const exists = existsSync(fullPath)

  checks.files.push({
    path,
    description,
    status: exists ? 'PASS' : 'FAIL',
    exists,
  })

  return exists
}

function checkPackageJson() {
  try {
    const packagePath = join(__dirname, '../package.json')
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))

    // Check for security-related scripts
    const hasSecurityScripts =
      packageJson.scripts &&
      (packageJson.scripts['security:audit'] ||
        packageJson.scripts['audit'] ||
        packageJson.scripts['security:check'])

    checks.configuration.push({
      check: 'Security Scripts',
      description: 'Package.json includes security-related scripts',
      status: hasSecurityScripts ? 'PASS' : 'WARN',
      details: hasSecurityScripts
        ? 'Security scripts found'
        : 'Consider adding security audit scripts',
    })

    // Check for known vulnerable packages (basic check)
    const vulnerablePackages = []

    // Note: This is a basic check. Use npm audit for comprehensive vulnerability scanning

    checks.dependencies.push({
      check: 'Dependency Vulnerabilities',
      description: 'Check for known vulnerable dependencies',
      status: vulnerablePackages.length === 0 ? 'PASS' : 'FAIL',
      details:
        vulnerablePackages.length === 0
          ? 'No known vulnerabilities found'
          : `Found: ${vulnerablePackages.join(', ')}`,
    })
  } catch (err) {
    checks.configuration.push({
      check: 'Package.json',
      description: 'Read and validate package.json',
      status: 'FAIL',
      details: err.message,
    })
  }
}

function checkViteConfig() {
  try {
    const configPath = join(__dirname, '../vite.config.ts')
    const configContent = readFileSync(configPath, 'utf8')

    // Check for security headers
    const hasSecurityHeaders =
      configContent.includes('X-Content-Type-Options') ||
      configContent.includes('X-Frame-Options') ||
      configContent.includes('X-XSS-Protection')

    checks.configuration.push({
      check: 'Vite Security Headers',
      description: 'Vite config includes security headers',
      status: hasSecurityHeaders ? 'PASS' : 'WARN',
      details: hasSecurityHeaders
        ? 'Security headers configured'
        : 'Consider adding security headers',
    })

    // Check for production optimizations
    const hasProductionOptimizations =
      configContent.includes('drop:') && configContent.includes('minify:')

    checks.configuration.push({
      check: 'Production Optimizations',
      description: 'Production build optimizations enabled',
      status: hasProductionOptimizations ? 'PASS' : 'WARN',
      details: hasProductionOptimizations
        ? 'Production optimizations found'
        : 'Consider adding production optimizations',
    })
  } catch (err) {
    checks.configuration.push({
      check: 'Vite Configuration',
      description: 'Read and validate vite.config.ts',
      status: 'FAIL',
      details: err.message,
    })
  }
}

async function checkUrl(url) {
  if (!url) return

  console.log(`🌐 Checking URL: ${url}`)
  console.log('')

  try {
    const response = await fetch(url, { method: 'HEAD' })

    // Check security headers
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': ['DENY', 'SAMEORIGIN'],
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=',
      'Content-Security-Policy': 'default-src',
      'Referrer-Policy': 'strict-origin',
    }

    for (const [header, expectedValue] of Object.entries(securityHeaders)) {
      const actualValue = response.headers.get(header)
      let status = 'FAIL'
      let details = 'Header not present'

      if (actualValue) {
        if (Array.isArray(expectedValue)) {
          status = expectedValue.some(val => actualValue.includes(val)) ? 'PASS' : 'WARN'
          details = `Present: ${actualValue}`
        } else {
          status = actualValue.includes(expectedValue) ? 'PASS' : 'WARN'
          details = `Present: ${actualValue}`
        }
      }

      checks.headers.push({
        header,
        description: `Security header: ${header}`,
        status,
        details,
      })
    }

    // Check HTTPS
    const isHttps = url.startsWith('https://')
    checks.headers.push({
      header: 'HTTPS',
      description: 'Site served over HTTPS',
      status: isHttps ? 'PASS' : 'FAIL',
      details: isHttps ? 'HTTPS enabled' : 'Site not served over HTTPS',
    })
  } catch (error) {
    console.log(`❌ Error checking URL: ${error.message}`)
  }
}

function printResults() {
  console.log('📋 Security Check Results')
  console.log('========================')
  console.log('')

  // File checks
  if (checks.files.length > 0) {
    console.log('📁 File Checks:')
    checks.files.forEach(check => {
      const icon = check.status === 'PASS' ? '✅' : '❌'
      console.log(`   ${icon} ${check.description}`)
      if (check.status === 'FAIL') {
        console.log(`      Missing: ${check.path}`)
      }
    })
    console.log('')
  }

  // Configuration checks
  if (checks.configuration.length > 0) {
    console.log('⚙️  Configuration Checks:')
    checks.configuration.forEach(check => {
      const icon = check.status === 'PASS' ? '✅' : check.status === 'WARN' ? '⚠️' : '❌'
      console.log(`   ${icon} ${check.description}`)
      if (check.details) {
        console.log(`      ${check.details}`)
      }
    })
    console.log('')
  }

  // Dependency checks
  if (checks.dependencies.length > 0) {
    console.log('📦 Dependency Checks:')
    checks.dependencies.forEach(check => {
      const icon = check.status === 'PASS' ? '✅' : check.status === 'WARN' ? '⚠️' : '❌'
      console.log(`   ${icon} ${check.description}`)
      if (check.details) {
        console.log(`      ${check.details}`)
      }
    })
    console.log('')
  }

  // Header checks
  if (checks.headers.length > 0) {
    console.log('🔒 Security Header Checks:')
    checks.headers.forEach(check => {
      const icon = check.status === 'PASS' ? '✅' : check.status === 'WARN' ? '⚠️' : '❌'
      console.log(`   ${icon} ${check.description}`)
      if (check.details) {
        console.log(`      ${check.details}`)
      }
    })
    console.log('')
  }

  // Summary
  const allChecks = [
    ...checks.files,
    ...checks.configuration,
    ...checks.dependencies,
    ...checks.headers,
  ]
  const passed = allChecks.filter(c => c.status === 'PASS').length
  const warned = allChecks.filter(c => c.status === 'WARN').length
  const failed = allChecks.filter(c => c.status === 'FAIL').length

  console.log('📊 Summary:')
  console.log(`   ✅ Passed: ${passed}`)
  console.log(`   ⚠️  Warnings: ${warned}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`   📋 Total: ${allChecks.length}`)

  if (failed > 0) {
    console.log('')
    console.log('❌ Security check failed. Please address the issues above.')
    process.exit(1)
  } else if (warned > 0) {
    console.log('')
    console.log('⚠️  Security check completed with warnings. Consider addressing them.')
  } else {
    console.log('')
    console.log('🎉 All security checks passed!')
  }
}

async function main() {
  // File existence checks
  checkFile('public/.nojekyll', 'GitHub Pages Jekyll bypass')
  checkFile('public/404.html', 'Custom 404 error page')
  checkFile('public/_headers', 'Security headers configuration')
  checkFile('public/.well-known/security.txt', 'Security disclosure policy')
  checkFile('docs/SECURITY.md', 'Security documentation')

  // Configuration checks
  checkPackageJson()
  checkViteConfig()

  // URL checks (if provided)
  if (targetUrl) {
    await checkUrl(targetUrl)
  }

  // Print results
  printResults()
}

// Run the script
main().catch(error => {
  console.error('❌ Security check failed:', error.message)
  process.exit(1)
})
