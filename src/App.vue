<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import NavigationBar from './components/common/NavigationBar.vue'
import UserFeedbackCollector from './components/common/UserFeedbackCollector.vue'
import { useSEO } from './composables/useSEO'
import { useStructuredData } from './composables/useStructuredData'
import { useServiceWorker } from './composables/useServiceWorker'
import { usePerformance } from './composables/usePerformance'
import { useAnalytics } from './composables/useAnalytics'
import { useCommunity } from './composables/useCommunity'
import { useFeedback } from './composables/useFeedback'

// Initialize SEO for the main app
useSEO()

// Initialize structured data for the home page
useStructuredData({ type: 'SoftwareApplication' })
useStructuredData({ type: 'Organization' })
useStructuredData({ type: 'WebSite' })

// Initialize service worker for caching
const { isUpdateAvailable, skipWaiting } = useServiceWorker()

// Initialize performance monitoring
usePerformance()

// Initialize analytics and community features
const { initializeAnalytics, trackPageView } = useAnalytics()
const { initializeCommunity } = useCommunity()
const { loadCommunityMetrics } = useFeedback()

// Handle service worker updates
if (isUpdateAvailable.value) {
  console.log('App update available')
  // Optionally show update notification to user
  // For now, auto-update
  skipWaiting()
}

// Initialize community and analytics systems
onMounted(() => {
  // Initialize analytics system
  initializeAnalytics()

  // Initialize community tracking
  initializeCommunity()

  // Load existing community metrics
  loadCommunityMetrics()

  // Track initial page view
  trackPageView()
})
</script>

<template>
  <div id="app">
    <!-- Skip links for accessibility -->
    <a
      href="#main-content"
      class="skip-link"
      >Skip to main content</a
    >
    <a
      href="#navigation"
      class="skip-link"
      >Skip to navigation</a
    >

    <NavigationBar id="navigation" />

    <!-- Main content with top padding to account for fixed navigation -->
    <main
      id="main-content"
      class="pt-16"
      tabindex="-1"
    >
      <RouterView />
    </main>

    <!-- User Feedback Collector - Global component for community engagement -->
    <UserFeedbackCollector />
  </div>
</template>

<style scoped>
/* Skip links for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}

/* App layout */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#main-content {
  flex: 1;
}

/* Legacy styles - keeping for compatibility */
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .skip-link {
    transition: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .skip-link {
    background: #000;
    color: #fff;
    border: 2px solid #fff;
  }
}
</style>
