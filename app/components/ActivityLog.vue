<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import type { ActivityLog } from '~/stores/game'

const gameStore = useGameStore()
const logContainer = ref<HTMLElement>()

const formatTimestamp = (timestamp: number) => {
  const seconds = Math.floor(timestamp / 1000)
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `[${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}]`
}

const logTypeColors: Record<ActivityLog['type'], string> = {
  proposal: 'text-blue-400',
  critique: 'text-yellow-400',
  question: 'text-orange-400',
  vote: 'text-green-400',
  result: 'text-purple-400',
  system: 'text-muted-foreground',
}

watch(() => gameStore.activityLog.length, async () => {
  await nextTick()
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
}, { immediate: true })
</script>

<template>
  <Card class="bg-card/80 border-border/50 backdrop-blur-sm flex flex-col gap-0 py-0" :class="gameStore.isRunning ? 'h-[calc(100vh-8rem)]' : 'h-[calc(50vh-8rem)]'">
    <div class="p-4 border-b border-border/30">
      <h3 class="text-sm font-mono font-semibold text-foreground">Activity Log</h3>
    </div>
    <div 
      ref="logContainer"
      class="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs min-h-0"
    >
      <div
        v-for="(log, index) in gameStore.activityLog"
        :key="index"
        class="space-y-1"
      >
        <div class="flex gap-2">
          <span class="text-muted-foreground/60 shrink-0">
            {{ formatTimestamp(log.timestamp) }}
          </span>
          <span :class="logTypeColors[log.type]">
            <span v-if="log.agent" class="font-semibold">{{ log.agent }}</span>
            <span v-if="log.type === 'proposal'"> proposed a policy.</span>
            <span v-else-if="log.type === 'critique'">
              <span v-if="log.target"> didn't like that {{ log.target }}'s policy</span>
              <span v-if="log.message">: {{ log.message }}</span>
            </span>
            <span v-else-if="log.type === 'vote'">
              <span v-if="log.target"> voted for {{ log.target }}.</span>
            </span>
            <span v-else-if="log.type === 'result'">
              <span v-if="log.message">{{ log.message }}</span>
              <span v-else-if="log.agent">{{ log.agent }} wins</span>
            </span>
            <span v-else-if="log.type === 'system'">
              {{ log.message }}
            </span>
            <span v-else>{{ log.message }}</span>
          </span>
        </div>
        <div v-if="log.type === 'vote' && log.message" class="pl-8 text-muted-foreground/70 italic text-[11px] leading-relaxed">
          {{ log.message }}
        </div>
      </div>
      <div v-if="gameStore.activityLog.length === 0" class="text-muted-foreground/50 italic">
        No activity yet...
      </div>
    </div>
  </Card>
</template>
