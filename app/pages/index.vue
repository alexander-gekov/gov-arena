<script setup lang="ts">
import { onMounted } from 'vue'

const gameStore = useGameStore()

onMounted(() => {
  document.documentElement.classList.add('dark')
})
</script>

<template>
  <div class="h-screen bg-background text-foreground flex flex-col overflow-hidden">
    <div class="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
      <h1 class="text-xl font-mono font-bold tracking-tight">GovArena</h1>
      <div class="text-xs text-muted-foreground font-mono">
        Policy Debate Simulation
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <aside class="w-80 border-r border-border/50 bg-background/50 flex flex-col overflow-hidden shrink-0">
        <div class="p-4 border-b border-border/30 shrink-0">
          <h2 class="text-sm font-mono font-semibold text-foreground">Delegates</h2>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <SeatCard
            v-for="seat in gameStore.seats"
            :key="seat.id"
            :seat="seat"
          />
        </div>
      </aside>

      <main class="flex-1 flex flex-col overflow-hidden min-w-0">
        <ChatView />
      </main>

      <aside class="w-80 border-l border-border/50 bg-background/50 flex flex-col overflow-hidden shrink-0">
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <SettingsPanel />
          <StatusPanel />
          <Leaderboard />
        </div>
      </aside>
    </div>

    <StatsModal />
  </div>
</template>
