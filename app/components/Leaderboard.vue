<script setup lang="ts">
import { computed } from 'vue'
import type { ModelPerformance } from '~/stores/game'
import { Trophy, Medal, Award } from 'lucide-vue-next'

const gameStore = useGameStore()

const getModelName = (model: string) => {
  return model.split('/')[1] || model
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return Trophy
  if (rank === 2) return Medal
  if (rank === 3) return Award
  return null
}

const getRankColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-500'
  if (rank === 2) return 'text-gray-400'
  if (rank === 3) return 'text-orange-600'
  return 'text-muted-foreground'
}

const formatScore = (score: number) => {
  return score.toFixed(1)
}
</script>

<template>
  <Card class="bg-card/80 border-border/50 backdrop-blur-sm gap-3 py-4 flex flex-col">
    <div class="px-4 space-y-3 flex-1 flex flex-col min-h-0">
      <h3 class="text-sm font-mono font-semibold text-foreground">Leaderboard</h3>

      <div v-if="gameStore.currentPhase !== 'results'" class="text-xs text-muted-foreground/50 italic py-4 text-center">
        TBD - Rankings available after voting
      </div>

      <div v-else-if="gameStore.modelPerformance.length === 0" class="text-xs text-muted-foreground/50 italic py-4 text-center">
        Complete a game to see rankings
      </div>

      <div v-else class="space-y-2 flex-1 overflow-y-auto min-h-0">
        <div
          v-for="perf in gameStore.modelPerformance"
          :key="perf.model"
          class="flex items-center gap-2 p-2 rounded-lg border border-border/30 hover:bg-card/50 transition-colors"
        >
          <div class="flex-shrink-0 w-6 text-center">
            <component
              :is="getRankIcon(perf.rank)"
              v-if="getRankIcon(perf.rank)"
              :class="['h-4 w-4', getRankColor(perf.rank)]"
            />
            <span v-else class="text-[10px] font-mono text-muted-foreground">#{{ perf.rank }}</span>
          </div>

          <div class="flex-shrink-0">
            <ProviderIcon :model="perf.model" :size="24" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="font-mono text-xs font-semibold text-foreground truncate">{{ getModelName(perf.model) }}</span>
            </div>
            <div class="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>{{ perf.votesReceived }} vote{{ perf.votesReceived !== 1 ? 's' : '' }}</span>
              <span>{{ perf.avgDuration.toFixed(1) }}s</span>
            </div>
          </div>

          <div class="flex-shrink-0 text-right">
            <div class="text-sm font-mono font-bold text-foreground">{{ formatScore(perf.finalScore) }}</div>
          </div>
        </div>
      </div>

      <div v-if="gameStore.modelPerformance.length > 0" class="pt-3 border-t border-border/30 space-y-1 text-[10px] text-muted-foreground">
        <div class="font-mono font-semibold text-foreground mb-1 text-xs">Scoring:</div>
        <div>Votes: 40% • Participation: 20%</div>
        <div>Quality: 20% • Speed: 20%</div>
      </div>
    </div>
  </Card>
</template>
