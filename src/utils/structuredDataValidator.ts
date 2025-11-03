/**
 * Utility functions for validating structured data
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate Software Application structured data
 */
export function validateSoftwareApplication(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!data.name) errors.push('Missing required field: name')
  if (!data.description) errors.push('Missing required field: description')
  if (!data.applicationCategory) errors.push('Missing required field: applicationCategory')
  if (!data.operatingSystem) errors.push('Missing required field: operatingSystem')

  // Recommended fields
  if (!data.softwareVersion) warnings.push('Missing recommended field: softwareVersion')
  if (!data.datePublished) warnings.push('Missing recommended field: datePublished')
  if (!data.author) warnings.push('Missing recommended field: author')
  if (!data.offers) warnings.push('Missing recommended field: offers')

  // Validate offers structure
  if (data.offers && typeof data.offers === 'object') {
    const offers = data.offers as Record<string, unknown>
    if (!offers.price) errors.push('Missing required field in offers: price')
    if (!offers.priceCurrency) errors.push('Missing required field in offers: priceCurrency')
  }

  // Validate author structure
  if (data.author && typeof data.author === 'object') {
    const author = data.author as Record<string, unknown>
    if (!author['@type']) errors.push('Missing @type in author')
    if (!author.name) errors.push('Missing name in author')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate Organization structured data
 */
export function validateOrganization(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!data.name) errors.push('Missing required field: name')
  if (!data.url) errors.push('Missing required field: url')

  // Recommended fields
  if (!data.logo) warnings.push('Missing recommended field: logo')
  if (!data.description) warnings.push('Missing recommended field: description')
  if (!data.contactPoint) warnings.push('Missing recommended field: contactPoint')

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate FAQ Page structured data
 */
export function validateFAQPage(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!data.mainEntity) errors.push('Missing required field: mainEntity')

  if (data.mainEntity && Array.isArray(data.mainEntity)) {
    data.mainEntity.forEach((item: Record<string, unknown>, index: number) => {
      if (!item['@type'] || item['@type'] !== 'Question') {
        errors.push(`Invalid @type in mainEntity[${index}]: expected 'Question'`)
      }
      if (!item.name) errors.push(`Missing name in mainEntity[${index}]`)
      if (!item.acceptedAnswer) errors.push(`Missing acceptedAnswer in mainEntity[${index}]`)

      if (item.acceptedAnswer && typeof item.acceptedAnswer === 'object') {
        const answer = item.acceptedAnswer as Record<string, unknown>
        if (!answer['@type'] || answer['@type'] !== 'Answer') {
          errors.push(`Invalid @type in acceptedAnswer[${index}]: expected 'Answer'`)
        }
        if (!answer.text) {
          errors.push(`Missing text in acceptedAnswer[${index}]`)
        }
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate all structured data on the page
 */
export function validateAllStructuredData(): ValidationResult {
  const allErrors: string[] = []
  const allWarnings: string[] = []

  // Find all JSON-LD scripts
  const scripts = document.querySelectorAll('script[type="application/ld+json"]')

  scripts.forEach((script, index) => {
    try {
      const data = JSON.parse(script.textContent || '')
      let result: ValidationResult

      switch (data['@type']) {
        case 'SoftwareApplication':
          result = validateSoftwareApplication(data)
          break
        case 'Organization':
          result = validateOrganization(data)
          break
        case 'FAQPage':
          result = validateFAQPage(data)
          break
        default:
          result = { isValid: true, errors: [], warnings: [`Unknown @type: ${data['@type']}`] }
      }

      // Prefix errors and warnings with script index
      result.errors.forEach(error => allErrors.push(`Script ${index}: ${error}`))
      result.warnings.forEach(warning => allWarnings.push(`Script ${index}: ${warning}`))
    } catch {
      allErrors.push(`Script ${index}: Invalid JSON-LD syntax`)
    }
  })

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  }
}

/**
 * Test structured data with Google's Structured Data Testing Tool (programmatically)
 */
export async function testWithGoogleTool(url: string): Promise<unknown> {
  try {
    // Note: This would require a server-side proxy or CORS-enabled endpoint
    // In a real implementation, you might use Google's Rich Results Test API
    const response = await fetch(
      `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`
    )
    return await response.json()
  } catch (error) {
    console.error('Failed to test with Google tool:', error)
    return null
  }
}

/**
 * Development helper to log structured data validation results
 */
export function logValidationResults(): void {
  if (import.meta.env.DEV) {
    const results = validateAllStructuredData()

    if (results.errors.length > 0) {
      console.group('🔴 Structured Data Validation Errors')
      results.errors.forEach(error => console.error(error))
      console.groupEnd()
    }

    if (results.warnings.length > 0) {
      console.group('🟡 Structured Data Validation Warnings')
      results.warnings.forEach(warning => console.warn(warning))
      console.groupEnd()
    }

    if (results.isValid && results.warnings.length === 0) {
      console.log('✅ All structured data is valid')
    }
  }
}
