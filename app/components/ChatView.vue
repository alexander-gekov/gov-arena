<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import type { Seat } from '~/stores/game'

const gameStore = useGameStore()
const chatContainer = ref<HTMLElement>()
const visibleMessages = ref<Set<string>>(new Set())
const messageDelay = 2000

interface ChatMessage {
  id: string
  seatId: string
  seatName: string
  model: string
  phase: 'proposal' | 'critique' | 'refactor' | 'vote'
  content: string
  timestamp: number
  stats?: {
    duration?: number
    inputTokens?: number
    outputTokens?: number
  }
}

const allMessages = computed<ChatMessage[]>(() => {
  const msgs: ChatMessage[] = []
  const activeSeats = gameStore.seats.filter(s => s.model && s.model.trim())

  activeSeats.forEach(seat => {
    if (seat.policy) {
      const stats = gameStore.apiStats.find(s => s.seatId === seat.id && s.phase === 'proposal')
      msgs.push({
        id: `${seat.id}-proposal`,
        seatId: seat.id,
        seatName: seat.name,
        model: seat.model,
        phase: 'proposal',
        content: seat.policy,
        timestamp: stats?.timestamp.getTime() || Date.now(),
        stats: stats ? {
          duration: stats.duration,
          inputTokens: stats.inputTokens,
          outputTokens: stats.outputTokens,
        } : undefined,
      })
    }

    if (seat.critique) {
      const stats = gameStore.apiStats.find(s => s.seatId === seat.id && s.phase === 'critique')
      msgs.push({
        id: `${seat.id}-critique`,
        seatId: seat.id,
        seatName: seat.name,
        model: seat.model,
        phase: 'critique',
        content: `I have concerns about ${seat.critique.target}'s policy: ${seat.critique.message}`,
        timestamp: stats?.timestamp.getTime() || Date.now(),
        stats: stats ? {
          duration: stats.duration,
          inputTokens: stats.inputTokens,
          outputTokens: stats.outputTokens,
        } : undefined,
      })
    }

    if (seat.refactoredPolicy) {
      const stats = gameStore.apiStats.find(s => s.seatId === seat.id && s.phase === 'refactor')
      msgs.push({
        id: `${seat.id}-refactor`,
        seatId: seat.id,
        seatName: seat.name,
        model: seat.model,
        phase: 'refactor',
        content: `Refined policy: ${seat.refactoredPolicy}`,
        timestamp: stats?.timestamp.getTime() || Date.now(),
        stats: stats ? {
          duration: stats.duration,
          inputTokens: stats.inputTokens,
          outputTokens: stats.outputTokens,
        } : undefined,
      })
    }

    if (seat.vote) {
      const stats = gameStore.apiStats.find(s => s.seatId === seat.id && s.phase === 'vote')
      msgs.push({
        id: `${seat.id}-vote`,
        seatId: seat.id,
        seatName: seat.name,
        model: seat.model,
        phase: 'vote',
        content: `I vote for ${seat.vote}. ${seat.voteExplanation || ''}`,
        timestamp: stats?.timestamp.getTime() || Date.now(),
        stats: stats ? {
          duration: stats.duration,
          inputTokens: stats.inputTokens,
          outputTokens: stats.outputTokens,
        } : undefined,
      })
    }
  })

  return msgs.sort((a, b) => a.timestamp - b.timestamp)
})

const messages = computed(() => {
  return allMessages.value.filter(msg => visibleMessages.value.has(msg.id))
})

const getModelName = (model: string) => {
  return model.split('/')[1] || model
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

let revealTimeout: NodeJS.Timeout | null = null

const revealMessages = () => {
  if (revealTimeout) {
    clearTimeout(revealTimeout)
  }

  const sortedMessages = [...allMessages.value]
  let index = 0

  const revealNext = () => {
    if (index < sortedMessages.length) {
      visibleMessages.value.add(sortedMessages[index].id)
      index++
      revealTimeout = setTimeout(revealNext, messageDelay)
    }
  }

  revealNext()
}

watch(() => allMessages.value.length, (newLength, oldLength) => {
  if (newLength > oldLength && gameStore.isRunning) {
    const newMessages = allMessages.value.slice(oldLength)
    newMessages.forEach((msg, idx) => {
      setTimeout(() => {
        visibleMessages.value.add(msg.id)
        nextTick(() => {
          if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
          }
        })
      }, idx * messageDelay)
    })
  } else if (!gameStore.isRunning && newLength > 0) {
    visibleMessages.value.clear()
    revealMessages()
  }
}, { immediate: true })

watch(() => gameStore.isRunning, (isRunning) => {
  if (!isRunning && allMessages.value.length > 0) {
    visibleMessages.value.clear()
    revealMessages()
  }
})

watch(() => messages.value.length, async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}, { immediate: true })
</script>

<template>
  <Card class="bg-card/80 border-border/50 backdrop-blur-sm flex flex-col gap-0 py-0 h-full">
    <div class="p-4 border-b border-border/30">
      <h3 class="text-sm font-mono font-semibold text-foreground">Debate Chat</h3>
    </div>
    <div 
      ref="chatContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
        :class="message.seatId === 'D1' || message.seatId === 'D3' || message.seatId === 'D5' ? 'justify-start' : 'justify-end'"
      >
        <div 
          v-if="message.seatId === 'D1' || message.seatId === 'D3' || message.seatId === 'D5'"
          class="flex-shrink-0"
        >
          <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-border/50">
            <ProviderIcon :model="message.model" :size="24" />
          </div>
        </div>

        <div 
          class="flex-1 max-w-[70%] space-y-1"
          :class="message.seatId === 'D1' || message.seatId === 'D3' || message.seatId === 'D5' ? '' : 'items-end flex flex-col'"
        >
          <div class="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span class="font-semibold text-foreground">{{ message.seatName }}</span>
            <span>{{ getModelName(message.model) }}</span>
            <span>{{ formatTime(message.timestamp) }}</span>
            <span 
              v-if="message.stats"
              class="text-[10px] px-1.5 py-0.5 rounded bg-muted"
            >
              {{ message.stats.duration?.toFixed(1) }}s
            </span>
          </div>
          <div 
            class="rounded-2xl px-4 py-3 text-sm leading-relaxed"
            :class="[
              message.seatId === 'D1' || message.seatId === 'D3' || message.seatId === 'D5'
                ? 'bg-primary/10 border border-primary/20 text-foreground'
                : 'bg-secondary border border-border/50 text-foreground',
              message.phase === 'proposal' && 'bg-blue-500/10 border-blue-500/20',
              message.phase === 'critique' && 'bg-yellow-500/10 border-yellow-500/20',
              message.phase === 'refactor' && 'bg-purple-500/10 border-purple-500/20',
              message.phase === 'vote' && 'bg-green-500/10 border-green-500/20',
            ]"
          >
            {{ message.content }}
          </div>
        </div>

        <div 
          v-if="message.seatId === 'D2' || message.seatId === 'D4' || message.seatId === 'D6'"
          class="flex-shrink-0"
        >
          <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-border/50">
            <ProviderIcon :model="message.model" :size="24" />
          </div>
        </div>
      </div>

      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center py-12 px-4 space-y-6">
        <div class="text-center space-y-4 max-w-md">
          <h3 class="text-sm font-mono font-semibold text-foreground">Getting Started</h3>
          <div class="space-y-4 text-left">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono font-semibold text-primary">
                1
              </div>
              <div class="flex-1 space-y-1">
                <div class="text-xs font-mono font-semibold text-foreground">Choose LLMs as Delegates</div>
                <div class="text-xs text-muted-foreground">Select models from the left sidebar for each delegate seat</div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono font-semibold text-primary">
                2
              </div>
              <div class="flex-1 space-y-1">
                <div class="text-xs font-mono font-semibold text-foreground">Select a Topic</div>
                <div class="text-xs text-muted-foreground">Enter a policy scenario or use the Random button</div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono font-semibold text-primary">
                3
              </div>
              <div class="flex-1 space-y-1">
                <div class="text-xs font-mono font-semibold text-foreground">Enter API Key</div>
                <div class="text-xs text-muted-foreground">Add your Vercel AI Gateway API key (optional if server key is configured)</div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono font-semibold text-primary">
                4
              </div>
              <div class="flex-1 space-y-1">
                <div class="text-xs font-mono font-semibold text-foreground">Start Simulation</div>
                <div class="text-xs text-muted-foreground">Click "Start Game" to begin the debate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

