/**
 * Utilities for optimizing content for AI search engines
 */

export interface ContentOptimizationConfig {
  targetKeywords: string[]
  keywordDensity: number // Target density as percentage (e.g., 2.5 for 2.5%)
  minContentLength: number
  maxContentLength: number
}

/**
 * Analyze content for AI search optimization
 */
export function analyzeContentForAI(content: string, config: ContentOptimizationConfig) {
  const words = content
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 0)
  const totalWords = words.length

  // Calculate keyword density
  const keywordCounts = config.targetKeywords.map(keyword => {
    const keywordWords = keyword.toLowerCase().split(/\s+/)
    let count = 0

    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const phrase = words.slice(i, i + keywordWords.length).join(' ')
      if (phrase === keyword.toLowerCase()) {
        count++
      }
    }

    return {
      keyword,
      count,
      density: (count / totalWords) * 100,
    }
  })

  // Check content structure
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const avgSentenceLength = totalWords / sentences.length

  // Analyze headings (assuming HTML content)
  const headingMatches = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || []
  const headings = headingMatches.map(h => h.replace(/<[^>]*>/g, ''))

  return {
    wordCount: totalWords,
    sentenceCount: sentences.length,
    avgSentenceLength,
    keywordAnalysis: keywordCounts,
    headings,
    recommendations: generateRecommendations(totalWords, keywordCounts, config),
  }
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(
  wordCount: number,
  keywordAnalysis: Array<{ keyword: string; count: number; density: number }>,
  config: ContentOptimizationConfig
): string[] {
  const recommendations: string[] = []

  // Content length recommendations
  if (wordCount < config.minContentLength) {
    recommendations.push(
      `Content is too short (${wordCount} words). Aim for at least ${config.minContentLength} words.`
    )
  } else if (wordCount > config.maxContentLength) {
    recommendations.push(
      `Content is too long (${wordCount} words). Consider breaking into sections or reducing to under ${config.maxContentLength} words.`
    )
  }

  // Keyword density recommendations
  keywordAnalysis.forEach(({ keyword, density }) => {
    if (density < config.keywordDensity * 0.5) {
      recommendations.push(
        `Keyword "${keyword}" density is too low (${density.toFixed(1)}%). Consider adding more mentions.`
      )
    } else if (density > config.keywordDensity * 2) {
      recommendations.push(
        `Keyword "${keyword}" density is too high (${density.toFixed(1)}%). Reduce mentions to avoid keyword stuffing.`
      )
    }
  })

  return recommendations
}

/**
 * Generate semantic keywords related to main keywords
 */
export function generateSemanticKeywords(mainKeywords: string[]): string[] {
  const semanticMap: Record<string, string[]> = {
    'voice transcription': [
      'speech recognition',
      'audio to text',
      'voice to text',
      'dictation software',
      'speech to text conversion',
      'voice recording transcription',
    ],
    'calendar management': [
      'schedule management',
      'appointment scheduling',
      'event planning',
      'time management',
      'calendar integration',
      'meeting scheduler',
    ],
    'local processing': [
      'offline processing',
      'on-device processing',
      'local computation',
      'edge computing',
      'client-side processing',
      'device-based processing',
    ],
    'privacy protection': [
      'data privacy',
      'privacy first',
      'secure processing',
      'confidential data',
      'private information',
      'data security',
    ],
    'desktop application': [
      'desktop software',
      'native application',
      'desktop app',
      'computer program',
      'desktop tool',
      'system application',
    ],
  }

  const semanticKeywords: string[] = []

  mainKeywords.forEach(keyword => {
    const related = semanticMap[keyword.toLowerCase()]
    if (related) {
      semanticKeywords.push(...related)
    }
  })

  return [...new Set(semanticKeywords)] // Remove duplicates
}

/**
 * Optimize content structure for AI understanding
 */
export function optimizeContentStructure(content: string): string {
  // Add semantic HTML structure
  let optimizedContent = content

  // Ensure proper heading hierarchy
  optimizedContent = optimizedContent.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
    const level = hashes.length
    return `<h${level}>${title}</h${level}>`
  })

  // Add semantic sections
  optimizedContent = optimizedContent.replace(/<h2>([^<]+)<\/h2>/g, '<section><h2>$1</h2>')

  // Close sections before next h2 or at end
  optimizedContent = optimizedContent.replace(/(<\/section>)?(\s*<section><h2>)/g, '</section>$2')

  // Add final closing section if needed
  if (optimizedContent.includes('<section>') && !optimizedContent.endsWith('</section>')) {
    optimizedContent += '</section>'
  }

  return optimizedContent
}

/**
 * Generate content summary for AI search engines
 */
export function generateContentSummary(content: string, maxLength = 160): string {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, ' ')

  // Split into sentences
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0)

  let summary = ''
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (summary.length + trimmedSentence.length + 1 <= maxLength) {
      summary += `${(summary ? ' ' : '') + trimmedSentence}.`
    } else {
      break
    }
  }

  return summary || `${plainText.substring(0, maxLength - 3)}...`
}

/**
 * Extract key information for AI search engines
 */
export function extractKeyInformation(content: string) {
  const keyInfo = {
    features: [] as string[],
    benefits: [] as string[],
    specifications: [] as string[],
    useCases: [] as string[],
  }

  // Extract features (look for bullet points or numbered lists)
  const featureMatches = content.match(/(?:^|\n)\s*[-*•]\s*(.+)/gm) || []
  keyInfo.features = featureMatches.map(match => match.replace(/^\s*[-*•]\s*/, '').trim())

  // Extract benefits (look for words like "benefit", "advantage", "helps")
  const benefitPattern = /(?:benefit|advantage|helps?|enables?|allows?|improves?)[^.!?]*[.!?]/gi
  const benefitMatches = content.match(benefitPattern) || []
  keyInfo.benefits = benefitMatches.map(match => match.trim())

  // Extract specifications (look for technical details)
  const specPattern = /(?:requires?|supports?|compatible|minimum|maximum|version)[^.!?]*[.!?]/gi
  const specMatches = content.match(specPattern) || []
  keyInfo.specifications = specMatches.map(match => match.trim())

  // Extract use cases (look for "use", "for", "when", "if")
  const useCasePattern = /(?:use for|used for|when you|if you|perfect for)[^.!?]*[.!?]/gi
  const useCaseMatches = content.match(useCasePattern) || []
  keyInfo.useCases = useCaseMatches.map(match => match.trim())

  return keyInfo
}

/**
 * Validate content for AI search optimization
 */
export function validateAIOptimization(content: string, config: ContentOptimizationConfig) {
  const analysis = analyzeContentForAI(content, config)
  const keyInfo = extractKeyInformation(content)

  const validation = {
    isOptimized: true,
    score: 0,
    issues: [] as string[],
    suggestions: [] as string[],
  }

  // Check content length
  if (analysis.wordCount < config.minContentLength) {
    validation.isOptimized = false
    validation.issues.push('Content too short for AI search engines')
  }

  // Check keyword optimization
  const underOptimizedKeywords = analysis.keywordAnalysis.filter(
    k => k.density < config.keywordDensity * 0.5
  )
  if (underOptimizedKeywords.length > 0) {
    validation.isOptimized = false
    validation.issues.push('Some keywords are under-optimized')
  }

  // Check structure
  if (analysis.headings.length < 2) {
    validation.issues.push('Content needs more headings for better structure')
  }

  // Check key information extraction
  if (keyInfo.features.length === 0) {
    validation.suggestions.push('Add more feature descriptions')
  }

  if (keyInfo.benefits.length === 0) {
    validation.suggestions.push('Add more benefit statements')
  }

  // Calculate score
  validation.score = Math.max(
    0,
    100 - validation.issues.length * 20 - validation.suggestions.length * 10
  )

  return validation
}
