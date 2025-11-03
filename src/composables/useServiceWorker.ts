import { ref, onMounted } from 'vue'

export function useServiceWorker() {
  const isSupported = ref(false)
  const isRegistered = ref(false)
  const isUpdateAvailable = ref(false)
  const registration = ref<ServiceWorkerRegistration | null>(null)
  const error = ref<Error | null>(null)

  const register = async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return
    }

    isSupported.value = true

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      registration.value = reg
      isRegistered.value = true

      console.log('Service Worker registered successfully')

      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              isUpdateAvailable.value = true
              console.log('New Service Worker available')
            }
          })
        }
      })

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    } catch (err) {
      error.value = err as Error
      console.error('Service Worker registration failed:', err)
    }
  }

  const update = async () => {
    if (registration.value) {
      try {
        await registration.value.update()
        console.log('Service Worker update check completed')
      } catch (err) {
        console.error('Service Worker update failed:', err)
      }
    }
  }

  const skipWaiting = () => {
    if (registration.value?.waiting) {
      registration.value.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  const unregister = async () => {
    if (registration.value) {
      try {
        await registration.value.unregister()
        isRegistered.value = false
        console.log('Service Worker unregistered')
      } catch (err) {
        console.error('Service Worker unregistration failed:', err)
      }
    }
  }

  onMounted(() => {
    // Only register in production
    if (import.meta.env.PROD) {
      register()
    }
  })

  return {
    isSupported,
    isRegistered,
    isUpdateAvailable,
    registration,
    error,
    register,
    update,
    skipWaiting,
    unregister,
  }
}
