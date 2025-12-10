import { ref, watch } from 'vue'

const STORAGE_KEY = 'govarena_api_key'

const ALLOWED_DOMAINS = ['gov-arena.vercel.app', 'localhost', '127.0.0.1']

const isAllowedDomain = () => {
  if (!process.client) return false
  const hostname = window.location.hostname
  return ALLOWED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))
}

const apiKey = ref<string>('')

if (process.client && isAllowedDomain()) {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      apiKey.value = stored
    }
  } catch (error) {
    console.warn('Failed to read API key from sessionStorage:', error)
  }
}

watch(apiKey, (newKey) => {
  if (process.client && isAllowedDomain()) {
    try {
      if (newKey) {
        sessionStorage.setItem(STORAGE_KEY, newKey)
      } else {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.warn('Failed to save API key to sessionStorage:', error)
    }
  }
})

export const useApiKey = () => {
  const setApiKey = (key: string) => {
    const trimmed = key.trim()
    if (trimmed.length > 0) {
      apiKey.value = trimmed
    } else {
      apiKey.value = ''
    }
  }

  const clearApiKey = () => {
    apiKey.value = ''
  }

  return {
    apiKey,
    setApiKey,
    clearApiKey,
  }
}
