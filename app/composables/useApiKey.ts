import { ref, watch } from 'vue'

const STORAGE_KEY = 'govarena_api_key'

const apiKey = ref<string>('')

if (process.client) {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    apiKey.value = stored
  }
}

watch(apiKey, (newKey) => {
  if (process.client) {
    if (newKey) {
      localStorage.setItem(STORAGE_KEY, newKey)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})

export const useApiKey = () => {
  const setApiKey = (key: string) => {
    apiKey.value = key.trim()
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
