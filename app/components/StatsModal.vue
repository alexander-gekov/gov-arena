<script setup lang="ts">
import { computed } from 'vue'
import type { ApiCallStats } from '~/stores/game'

const gameStore = useGameStore()

const getProviderName = (model: string) => {
  if (model.startsWith('openai/')) return 'OpenAI'
  if (model.startsWith('anthropic/')) return 'Anthropic'
  if (model.startsWith('google/')) return 'Google'
  if (model.startsWith('xai/')) return 'xAI'
  if (model.startsWith('deepseek/')) return 'DeepSeek'
  if (model.startsWith('meta/')) return 'Meta'
  if (model.startsWith('minimax/')) return 'Minimax'
  return 'Unknown'
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  })
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }).toUpperCase()
}

const totalCost = computed(() => {
  return gameStore.apiStats.reduce((sum, stat) => sum + (stat.cost || 0), 0)
})

const totalInputTokens = computed(() => {
  return gameStore.apiStats.reduce((sum, stat) => sum + (stat.inputTokens || 0), 0)
})

const totalOutputTokens = computed(() => {
  return gameStore.apiStats.reduce((sum, stat) => sum + (stat.outputTokens || 0), 0)
})

const totalDuration = computed(() => {
  return gameStore.apiStats.reduce((sum, stat) => sum + (stat.duration || 0), 0)
})

const formatDuration = (seconds: number) => {
  return seconds.toFixed(2)
}

const formatTokens = (tokens: number) => {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`
  }
  return tokens.toString()
}

const formatCost = (cost: number) => {
  return `$${cost.toFixed(6)}`
}
</script>

<template>
  <Dialog :open="gameStore.showStatsModal" @update:open="gameStore.showStatsModal = $event">
    <DialogContent class="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-lg font-mono font-bold">Game Statistics</DialogTitle>
        <DialogDescription class="text-xs text-muted-foreground">
          Detailed statistics for all API calls during this game
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto space-y-4">
        <div v-if="gameStore.modelPerformance.length > 0" class="space-y-2">
          <div class="text-xs font-mono font-semibold text-foreground px-2">Model Rankings</div>
          <div class="border border-border/50 rounded-md overflow-hidden">
            <table class="w-full text-xs">
              <thead class="bg-card/50 border-b border-border/50">
                <tr>
                  <th class="text-left p-2 font-mono text-muted-foreground">Rank</th>
                  <th class="text-left p-2 font-mono text-muted-foreground">Model</th>
                  <th class="text-right p-2 font-mono text-muted-foreground">Votes</th>
                  <th class="text-right p-2 font-mono text-muted-foreground">Score</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="perf in gameStore.modelPerformance"
                  :key="perf.model"
                  class="border-b border-border/30 last:border-0 hover:bg-card/30"
                >
                  <td class="p-2 font-mono text-muted-foreground">#{{ perf.rank }}</td>
                  <td class="p-2">
                    <div class="flex items-center gap-2">
                      <ProviderIcon :model="perf.model" :size="16" />
                      <span class="font-mono">{{ perf.model.split('/')[1] || perf.model }}</span>
                    </div>
                  </td>
                  <td class="p-2 text-right font-mono">{{ perf.votesReceived }}</td>
                  <td class="p-2 text-right font-mono font-semibold">{{ perf.finalScore.toFixed(1) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-4 p-4 bg-card/50 rounded-md border border-border/50">
          <div class="space-y-1">
            <div class="text-xs text-muted-foreground font-mono">Total Cost</div>
            <div class="text-sm font-semibold">{{ formatCost(totalCost) }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-xs text-muted-foreground font-mono">Input Tokens</div>
            <div class="text-sm font-semibold">{{ formatTokens(totalInputTokens) }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-xs text-muted-foreground font-mono">Output Tokens</div>
            <div class="text-sm font-semibold">{{ formatTokens(totalOutputTokens) }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-xs text-muted-foreground font-mono">Total Duration</div>
            <div class="text-sm font-semibold">{{ formatDuration(totalDuration) }}s</div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-mono font-semibold text-foreground px-2">API Calls</div>
          <div class="border border-border/50 rounded-md overflow-x-auto">
            <table class="w-full text-xs">
              <thead class="bg-card/50 border-b border-border/50">
                <tr>
                  <th class="text-left p-2 font-mono text-muted-foreground">Time</th>
                  <th class="text-left p-2 font-mono text-muted-foreground">Model</th>
                  <th class="text-left p-2 font-mono text-muted-foreground">Provider</th>
                  <th class="text-left p-2 font-mono text-muted-foreground">Phase</th>
                  <th class="text-right p-2 font-mono text-muted-foreground">Cost</th>
                  <th class="text-right p-2 font-mono text-muted-foreground">Input</th>
                  <th class="text-right p-2 font-mono text-muted-foreground">Output</th>
                  <th class="text-right p-2 font-mono text-muted-foreground">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(stat, index) in gameStore.apiStats"
                  :key="index"
                  class="border-b border-border/30 last:border-0 hover:bg-card/30"
                >
                  <td class="p-2 font-mono text-muted-foreground">
                    <div>{{ formatDate(stat.timestamp) }}</div>
                    <div class="text-[10px]">{{ formatTime(stat.timestamp) }}</div>
                  </td>
                  <td class="p-2">
                    <div class="flex items-center gap-2">
                      <ProviderIcon :model="stat.model" :size="16" />
                      <span class="font-mono">{{ stat.model.split('/')[1] || stat.model }}</span>
                    </div>
                  </td>
                  <td class="p-2 font-mono text-muted-foreground">
                    {{ getProviderName(stat.model) }}
                  </td>
                  <td class="p-2 font-mono text-muted-foreground capitalize">
                    {{ stat.phase }}
                  </td>
                  <td class="p-2 text-right font-mono">
                    {{ stat.cost ? formatCost(stat.cost) : '-' }}
                  </td>
                  <td class="p-2 text-right font-mono text-muted-foreground">
                    {{ stat.inputTokens ? formatTokens(stat.inputTokens) : '-' }}
                  </td>
                  <td class="p-2 text-right font-mono text-muted-foreground">
                    {{ stat.outputTokens ? formatTokens(stat.outputTokens) : '-' }}
                  </td>
                  <td class="p-2 text-right font-mono text-muted-foreground">
                    {{ stat.duration ? formatDuration(stat.duration) + 's' : '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button @click="gameStore.showStatsModal = false" variant="outline" size="sm">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>


