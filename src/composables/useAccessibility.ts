import { ref, onMounted } from 'vue'

export function useAccessibility() {
  const isHighContrast = ref(false)
  const isReducedMotion = ref(false)
  const fontSize = ref('normal')
  const focusVisible = ref(false)

  // Check for accessibility preferences
  const checkAccessibilityPreferences = () => {
    // High contrast mode
    if (window.matchMedia) {
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
      isHighContrast.value = highContrastQuery.matches

      highContrastQuery.addEventListener('change', e => {
        isHighContrast.value = e.matches
      })

      // Reduced motion preference
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      isReducedMotion.value = reducedMotionQuery.matches

      reducedMotionQuery.addEventListener('change', e => {
        isReducedMotion.value = e.matches
      })
    }
  }

  // Focus management
  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    )

    const firstFocusableElement = focusableElements[0] as HTMLElement
    const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    element.addEventListener('keydown', handleTabKey)

    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  }

  // Skip link functionality
  const createSkipLink = (targetId: string, text = 'Skip to main content') => {
    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = text
    skipLink.className =
      'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg'

    skipLink.addEventListener('click', e => {
      e.preventDefault()
      const target = document.getElementById(targetId)
      if (target) {
        target.focus()
        target.scrollIntoView({ behavior: 'smooth' })
      }
    })

    return skipLink
  }

  // Announce to screen readers
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.textContent = message

    document.body.appendChild(announcer)

    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }

  // Color contrast checker
  const checkColorContrast = (foreground: string, background: string): number => {
    const getLuminance = (color: string): number => {
      // Convert hex to RGB
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16) / 255
      const g = parseInt(hex.substr(2, 2), 16) / 255
      const b = parseInt(hex.substr(4, 2), 16) / 255

      // Calculate relative luminance
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })

      return 0.2126 * (sRGB[0] || 0) + 0.7152 * (sRGB[1] || 0) + 0.0722 * (sRGB[2] || 0)
    }

    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  // Keyboard navigation helper
  const handleArrowNavigation = (
    event: KeyboardEvent,
    items: NodeListOf<HTMLElement> | HTMLElement[],
    currentIndex: number,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ): number => {
    const itemsArray = Array.from(items)
    let newIndex = currentIndex

    if (orientation === 'vertical') {
      if (event.key === 'ArrowDown') {
        newIndex = currentIndex < itemsArray.length - 1 ? currentIndex + 1 : 0
        event.preventDefault()
      } else if (event.key === 'ArrowUp') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : itemsArray.length - 1
        event.preventDefault()
      }
    } else {
      if (event.key === 'ArrowRight') {
        newIndex = currentIndex < itemsArray.length - 1 ? currentIndex + 1 : 0
        event.preventDefault()
      } else if (event.key === 'ArrowLeft') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : itemsArray.length - 1
        event.preventDefault()
      }
    }

    if (newIndex !== currentIndex && itemsArray[newIndex]) {
      itemsArray[newIndex]?.focus()
    }

    return newIndex
  }

  // Focus visible detection
  const handleFocusVisible = () => {
    let hadKeyboardEvent = false

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) return
      hadKeyboardEvent = true
    }

    const onPointerDown = () => {
      hadKeyboardEvent = false
    }

    const onFocus = (e: FocusEvent) => {
      if (hadKeyboardEvent || (e.target as HTMLElement).matches(':focus-visible')) {
        focusVisible.value = true
      }
    }

    const onBlur = () => {
      focusVisible.value = false
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('mousedown', onPointerDown, true)
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('touchstart', onPointerDown, true)
    document.addEventListener('focus', onFocus, true)
    document.addEventListener('blur', onBlur, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('mousedown', onPointerDown, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('touchstart', onPointerDown, true)
      document.removeEventListener('focus', onFocus, true)
      document.removeEventListener('blur', onBlur, true)
    }
  }

  onMounted(() => {
    checkAccessibilityPreferences()
    const cleanup = handleFocusVisible()

    return cleanup
  })

  return {
    isHighContrast,
    isReducedMotion,
    fontSize,
    focusVisible,
    trapFocus,
    createSkipLink,
    announce,
    checkColorContrast,
    handleArrowNavigation,
  }
}

export function useScreenReader() {
  const isScreenReaderActive = ref(false)

  // Detect screen reader usage
  const detectScreenReader = () => {
    // Check for common screen reader indicators
    const indicators = [
      'speechSynthesis' in window,
      navigator.userAgent.includes('NVDA'),
      navigator.userAgent.includes('JAWS'),
      navigator.userAgent.includes('VoiceOver'),
      'webkitSpeechSynthesis' in window,
    ]

    isScreenReaderActive.value = indicators.some(indicator => indicator)
  }

  // Create accessible descriptions
  const createDescription = (element: HTMLElement, description: string) => {
    const descId = `desc-${Math.random().toString(36).substr(2, 9)}`
    const descElement = document.createElement('div')
    descElement.id = descId
    descElement.className = 'sr-only'
    descElement.textContent = description

    element.setAttribute('aria-describedby', descId)
    element.appendChild(descElement)

    return () => {
      element.removeAttribute('aria-describedby')
      if (descElement.parentNode) {
        descElement.parentNode.removeChild(descElement)
      }
    }
  }

  // Create accessible labels
  const createLabel = (element: HTMLElement, label: string) => {
    const labelId = `label-${Math.random().toString(36).substr(2, 9)}`
    const labelElement = document.createElement('div')
    labelElement.id = labelId
    labelElement.className = 'sr-only'
    labelElement.textContent = label

    element.setAttribute('aria-labelledby', labelId)
    element.appendChild(labelElement)

    return () => {
      element.removeAttribute('aria-labelledby')
      if (labelElement.parentNode) {
        labelElement.parentNode.removeChild(labelElement)
      }
    }
  }

  onMounted(() => {
    detectScreenReader()
  })

  return {
    isScreenReaderActive,
    createDescription,
    createLabel,
  }
}
