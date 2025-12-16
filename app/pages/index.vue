<script setup lang="ts">
import { onMounted } from 'vue'
import { SlidersHorizontal, Users } from 'lucide-vue-next'

const gameStore = useGameStore()

onMounted(() => {
  document.documentElement.classList.add('dark')
})
</script>

<template>
  <div class="min-h-dvh bg-background text-foreground flex flex-col overflow-hidden">
    <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50 shrink-0 gap-3">
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <h1 class="text-lg sm:text-xl font-mono font-bold tracking-tight shrink-0">GovArena</h1>
        <div class="hidden sm:block text-xs text-muted-foreground font-mono truncate">
          Policy Debate Simulation
        </div>
      </div>
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="outline" size="sm" class="lg:hidden h-8 px-2 text-xs font-mono">
              <Users class="h-4 w-4 mr-2" />
              Delegates
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-[92vw] max-w-sm p-0">
            <div class="flex flex-col h-full">
              <div class="p-4 border-b border-border/30 shrink-0">
                <div class="text-sm font-mono font-semibold text-foreground">Delegates</div>
              </div>
              <div class="flex-1 overflow-y-auto p-4 space-y-3">
                <SeatCard
                  v-for="seat in gameStore.seats"
                  :key="seat.id"
                  :seat="seat"
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger as-child>
            <Button variant="outline" size="sm" class="lg:hidden h-8 px-2 text-xs font-mono">
              <SlidersHorizontal class="h-4 w-4 mr-2" />
              Controls
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-[92vw] max-w-sm p-0">
            <div class="flex flex-col h-full">
              <div class="p-4 border-b border-border/30 shrink-0">
                <div class="text-sm font-mono font-semibold text-foreground">Controls</div>
              </div>
              <div class="flex-1 overflow-y-auto p-4 space-y-4">
                <SettingsPanel />
                <StatusPanel />
                <Leaderboard />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <a
          href="/info"
          class="text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
        >
          Info
        </a>
        <a
          href="https://github.com/alexander-gekov/gov-arena"
          target="_blank"
          rel="noopener noreferrer"
          class="text-muted-foreground hover:text-foreground transition-colors"
          title="View on GitHub"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
          </svg>
        </a>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <aside class="hidden lg:flex w-80 border-r border-border/50 bg-background/50 flex-col overflow-hidden shrink-0">
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

      <aside class="hidden lg:flex w-80 border-l border-border/50 bg-background/50 flex-col overflow-hidden shrink-0">
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
