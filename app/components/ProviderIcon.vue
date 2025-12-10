<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  model: string
  size?: number
}>()

const provider = computed(() => {
  if (props.model.startsWith('openai/')) return 'openai'
  if (props.model.startsWith('anthropic/')) return 'anthropic'
  if (props.model.startsWith('google/')) return 'google'
  if (props.model.startsWith('xai/')) return 'xai'
  if (props.model.startsWith('deepseek/')) return 'deepseek'
  if (props.model.startsWith('meta/')) return 'meta'
  if (props.model.startsWith('minimax/')) return 'minimax'
  return null
})

const imageSrc = computed(() => {
  if (!provider.value) return null
  
  const imageMap: Record<string, string> = {
    openai: '/img/openai.png',
    anthropic: '/img/anthropic.png',
    google: '/img/google.png',
    xai: '/img/xai.png',
    deepseek: '/img/deepseek.png',
    meta: '/img/meta.png',
  }
  
  return imageMap[provider.value] || null
})

const iconSize = computed(() => props.size || 20)
</script>

<template>
  <img
    v-if="imageSrc"
    :src="imageSrc"
    :alt="provider || 'provider'"
    :style="{ width: `${iconSize}px`, height: `${iconSize}px` }"
    class="shrink-0 object-contain"
  />
  <div
    v-else
    :style="{ width: `${iconSize}px`, height: `${iconSize}px` }"
    class="shrink-0 rounded bg-muted"
  />
</template>

