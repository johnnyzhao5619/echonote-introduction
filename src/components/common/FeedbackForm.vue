<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

// Props
interface Props {
  triggerClass?: string
  position?: 'fixed' | 'inline'
  autoShow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  triggerClass:
    'fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors duration-200',
  position: 'fixed',
  autoShow: false,
})

// Composables
const { t } = useI18n()

// State
const isFormVisible = ref(false)
const isSubmitting = ref(false)
const isSubmitted = ref(false)

const formData = ref({
  type: '',
  rating: 0,
  message: '',
  contact: '',
})

// Computed
const isFormValid = computed(() => {
  return formData.value.type && formData.value.message.trim().length > 0
})

// Methods
const showForm = () => {
  isFormVisible.value = true
  document.body.style.overflow = 'hidden'
}

const hideForm = () => {
  isFormVisible.value = false
  document.body.style.overflow = ''
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    hideForm()
  }
}

const setRating = (rating: number) => {
  formData.value.rating = rating
}

const resetForm = () => {
  formData.value = {
    type: '',
    rating: 0,
    message: '',
    contact: '',
  }
  isSubmitted.value = false
}

const submitFeedback = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // Simulate API call - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, 1500))

    // In a real implementation, you would send the feedback to your backend
    const feedbackData = {
      ...formData.value,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      language: navigator.language,
    }

    console.log('Feedback submitted:', feedbackData)

    // Track feedback submission
    window.dispatchEvent(
      new CustomEvent('feedback-submitted', {
        detail: feedbackData,
      })
    )

    isSubmitted.value = true
  } catch (error) {
    console.error('Failed to submit feedback:', error)

    // Show error message
    alert(t('common.error'))
  } finally {
    isSubmitting.value = false
  }
}

// Handle escape key
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFormVisible.value) {
    hideForm()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)

  if (props.autoShow) {
    // Auto-show after some time or based on user behavior
    setTimeout(() => {
      if (!localStorage.getItem('feedback-shown')) {
        showForm()
        localStorage.setItem('feedback-shown', 'true')
      }
    }, 30000) // Show after 30 seconds
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="feedback-form">
    <!-- Feedback Button -->
    <button
      v-if="!isFormVisible"
      @click="showForm"
      class="feedback-trigger"
      :class="triggerClass"
      :aria-label="t('feedback.button.label')"
    >
      <svg
        class="w-5 h-5 mr-2"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
          clip-rule="evenodd"
        />
      </svg>
      {{ t('feedback.button.label') }}
    </button>

    <!-- Feedback Form Modal -->
    <div
      v-if="isFormVisible"
      class="feedback-modal"
      @click="handleBackdropClick"
    >
      <div
        class="feedback-modal-content"
        @click.stop
      >
        <!-- Header -->
        <div class="feedback-header">
          <h3 class="feedback-title">
            {{ t('feedback.title') }}
          </h3>
          <button
            @click="hideForm"
            class="feedback-close"
            :aria-label="t('common.close')"
          >
            <svg
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- Success State -->
        <div
          v-if="isSubmitted"
          class="feedback-success"
        >
          <div class="success-icon">
            <svg
              class="w-12 h-12 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h4 class="success-title">{{ t('feedback.success.title') }}</h4>
          <p class="success-message">{{ t('feedback.success.message') }}</p>
          <button
            @click="resetForm"
            class="success-button"
          >
            {{ t('feedback.success.newFeedback') }}
          </button>
        </div>

        <!-- Form -->
        <form
          v-else
          @submit.prevent="submitFeedback"
          class="feedback-form-content"
        >
          <!-- Feedback Type -->
          <div class="form-group">
            <label
              for="feedback-type"
              class="form-label"
            >
              {{ t('feedback.type.label') }}
            </label>
            <select
              id="feedback-type"
              v-model="formData.type"
              class="form-select"
              required
            >
              <option value="">{{ t('common.select') }}</option>
              <option value="bug">{{ t('feedback.type.bug') }}</option>
              <option value="feature">{{ t('feedback.type.feature') }}</option>
              <option value="general">{{ t('feedback.type.general') }}</option>
              <option value="translation">{{ t('feedback.type.translation') }}</option>
            </select>
          </div>

          <!-- Rating -->
          <div class="form-group">
            <label class="form-label">
              {{ t('feedback.rating.label') }}
            </label>
            <div class="rating-container">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="setRating(star)"
                class="rating-star"
                :class="{ active: star <= formData.rating }"
                :aria-label="`${star} ${star === 1 ? 'star' : 'stars'}`"
              >
                <svg
                  class="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Message -->
          <div class="form-group">
            <label
              for="feedback-message"
              class="form-label"
            >
              {{ t('feedback.message.label') }}
            </label>
            <textarea
              id="feedback-message"
              v-model="formData.message"
              class="form-textarea"
              :placeholder="t('feedback.message.placeholder')"
              rows="4"
              required
              maxlength="1000"
            ></textarea>
            <div class="character-count">{{ formData.message.length }}/1000</div>
          </div>

          <!-- Contact Information -->
          <div class="form-group">
            <label
              for="feedback-contact"
              class="form-label"
            >
              {{ t('feedback.contact.label') }}
              <span class="optional">({{ t('feedback.contact.optional') }})</span>
            </label>
            <input
              id="feedback-contact"
              v-model="formData.contact"
              type="email"
              class="form-input"
              :placeholder="t('feedback.contact.placeholder')"
            />
          </div>

          <!-- Privacy Notice -->
          <div class="privacy-notice">
            <p class="privacy-text">
              {{ t('feedback.privacy.notice') }}
            </p>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button
              type="button"
              @click="hideForm"
              class="cancel-button"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="submit-button"
              :disabled="isSubmitting || !isFormValid"
            >
              <svg
                v-if="isSubmitting"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ isSubmitting ? t('feedback.submitting') : t('feedback.submit') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feedback-form {
  position: relative;
}

.feedback-trigger {
  display: flex;
  align-items: center;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  z-index: 40;
}

.feedback-trigger:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.feedback-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.feedback-modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.feedback-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0;
}

.feedback-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.feedback-close {
  color: #6b7280;
  transition: color 0.2s;
}

.feedback-close:hover {
  color: #374151;
}

.feedback-success {
  padding: 2rem 1.5rem;
  text-align: center;
}

.success-icon {
  margin: 0 auto 1rem;
}

.success-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.success-message {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.success-button {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.success-button:hover {
  background-color: #2563eb;
}

.feedback-form-content {
  padding: 1rem 1.5rem 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.optional {
  font-weight: 400;
  color: #6b7280;
}

.form-select,
.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.character-count {
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.rating-container {
  display: flex;
  gap: 0.25rem;
}

.rating-star {
  color: #d1d5db;
  transition: color 0.2s;
}

.rating-star:hover,
.rating-star.active {
  color: #fbbf24;
}

.privacy-notice {
  background-color: #f3f4f6;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
}

.privacy-text {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-weight: 500;
  color: #374151;
  background-color: white;
  transition: all 0.2s;
}

.cancel-button:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.submit-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
}

.submit-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .feedback-modal-content {
    background: #1f2937;
    color: #f9fafb;
  }

  .feedback-title {
    color: #f9fafb;
  }

  .form-label {
    color: #e5e7eb;
  }

  .form-select,
  .form-input,
  .form-textarea {
    background-color: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .form-select:focus,
  .form-input:focus,
  .form-textarea:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .privacy-notice {
    background-color: #374151;
  }

  .cancel-button {
    background-color: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }

  .cancel-button:hover {
    background-color: #4b5563;
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .feedback-modal {
    padding: 0.5rem;
  }

  .feedback-modal-content {
    max-height: 95vh;
  }

  .feedback-header {
    padding: 1rem 1rem 0;
  }

  .feedback-form-content {
    padding: 0.75rem 1rem 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
