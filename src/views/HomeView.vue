<script setup lang="ts">
import HeroSection from '@/components/sections/HeroSection.vue'
import FeaturesSection from '@/components/sections/FeaturesSection.vue'
import QuickStartSection from '@/components/sections/QuickStartSection.vue'
import TechnicalSection from '@/components/sections/TechnicalSection.vue'
import CommunitySection from '@/components/sections/CommunitySection.vue'
import { TEST_IDS } from '@/constants/testIds'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <HeroSection
      :data-testid="TEST_IDS.HERO_SECTION"
      show-stats
      animate-features
    />

    <!-- Features Section -->
    <FeaturesSection
      :data-testid="TEST_IDS.FEATURES_SECTION"
      show-comparison
      show-use-cases
      animate-on-scroll
    />

    <!-- Quick Start Section -->
    <QuickStartSection
      :data-testid="TEST_IDS.QUICKSTART_SECTION"
      show-system-requirements
      show-configuration
      detect-os
    />

    <!-- Technical Section -->
    <TechnicalSection
      :data-testid="TEST_IDS.TECHNICAL_SECTION"
      show-architecture
      show-tech-stack
      show-performance
      show-quality-badges
    />

    <!-- Community Section -->
    <CommunitySection
      :data-testid="TEST_IDS.COMMUNITY_SECTION"
      show-contributors
      show-support
      show-roadmap
      show-stats
    />
  </div>
</template>
