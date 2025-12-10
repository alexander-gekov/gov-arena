<script setup lang="ts">
import { computed } from 'vue'
import type { GamePhase } from '~/stores/game'

const gameStore = useGameStore()

const phaseLabels: Record<GamePhase, string> = {
  setup: 'Setup',
  proposal: 'Round 1: Proposal',
  critique: 'Round 2: Critique',
  refactor: 'Round 3: Refactor',
  vote: 'Round 4: Voting',
  results: 'Results',
}

const phaseDescription: Record<GamePhase, string> = {
  setup: 'Configure delegates and scenario',
  proposal: 'Each delegate writes a concise policy proposal',
  critique: 'Delegates critique each other\'s proposals',
  refactor: 'Delegates refactor their policies based on critiques',
  vote: 'Delegates vote for the strongest proposal',
  results: 'Voting results and winner announced',
}

const currentPhaseLabel = computed(() => phaseLabels[gameStore.currentPhase])
const currentPhaseDesc = computed(() => phaseDescription[gameStore.currentPhase])

const canStart = computed(() => {
  return gameStore.seats.every(s => s.model) && gameStore.scenario.trim().length > 0
})

const readySeats = computed(() => {
  return gameStore.seats.filter(s => s.model && s.model.trim()).length
})
</script>

<template>
  <Card class="bg-card/80 border-border/50 backdrop-blur-sm gap-4 py-4">
    <div class="px-4 space-y-3">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-mono font-semibold text-foreground">Status</h2>
          <div 
            v-if="gameStore.isRunning"
            class="h-2 w-2 rounded-full bg-green-500 animate-pulse"
          />
        </div>
        <div class="text-xs text-muted-foreground font-mono">
          {{ currentPhaseLabel }}
        </div>
        <div class="text-xs text-muted-foreground/70">
          {{ currentPhaseDesc }}
        </div>
      </div>

      <div v-if="gameStore.currentPhase === 'results' && gameStore.winner" class="space-y-2 pt-4 border-t border-border/30">
        <div class="text-sm font-mono text-foreground">
          Winner: <span class="text-green-400">{{ gameStore.winner }}</span>
        </div>
        <div class="text-xs text-muted-foreground space-y-1">
          <div v-for="(votes, id) in gameStore.voteCounts" :key="id" class="flex justify-between">
            <span>{{ id }}:</span>
            <span>{{ votes }} vote{{ votes !== 1 ? 's' : '' }}</span>
          </div>
        </div>
        <Button
          @click="gameStore.showStatsModal = true"
          variant="outline"
          size="sm"
          class="w-full mt-3 text-xs"
        >
          View Statistics
        </Button>
      </div>

      <div v-if="gameStore.currentPhase === 'setup'" class="space-y-2 pt-4 border-t border-border/30">
        <div class="text-xs text-muted-foreground">
          Ready: {{ readySeats }}/{{ gameStore.seats.length }} delegates
        </div>
      </div>
    </div>
  </Card>
</template>
