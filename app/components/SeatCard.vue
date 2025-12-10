<script setup lang="ts">
import type { Seat } from '~/stores/game'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  seat: Seat
}>()

const getModelName = (model: string) => {
  return model.split('/')[1] || model
}

const modelOptions = [
  'xai/grok-4-fast-reasoning',
  'xai/grok-4-fast-non-reasoning',
  'xai/grok-4.1-fast-reasoning',
  'xai/grok-4.1-fast-non-reasoning',
  'google/gemini-2.5-flash',
  'google/gemini-2.5-pro',
  'google/gemini-2.0-flash',
  'google/gemini-2.5-flash-lite',
  'anthropic/claude-sonnet-4.5',
  'anthropic/claude-haiku-4.5',
  'anthropic/claude-sonnet-4',
  'anthropic/claude-3.5-sonnet',
  'openai/gpt-4.1-mini',
  'openai/gpt-5.1-instant',
  'openai/gpt-5-nano',
  'openai/gpt-5-mini',
  'openai/gpt-4o-mini',
  'openai/gpt-5.1-thinking',
  'openai/gpt-4o',
  'meta/llama-3.1-8b',
  'meta/llama-3.3-70b',
  'meta/llama-4-scout',
  'meta/llama-4-maverick',
  'deepseek/deepseek-v3.2',
  'deepseek/deepseek-v3.2-thinking',
  'deepseek/deepseek-r1',
]

const gameStore = useGameStore()

const handleModelChange = (value: string) => {
  gameStore.updateSeatModel(props.seat.id, value)
}
</script>

<template>
  <Card class="bg-card/50 border-border/50 backdrop-blur-sm gap-3 py-3" :class="{ 'opacity-50': !seat.model }">
    <div class="px-4 space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-mono text-sm font-semibold text-foreground">{{ seat.name }}</h3>
        <div class="flex items-center gap-2">
          <div
            v-if="seat.isLoading"
            class="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"
            title="Processing..."
          />
          <div 
            v-else-if="seat.policy || seat.vote"
            class="h-2 w-2 rounded-full"
            :class="seat.vote ? 'bg-green-500' : 'bg-blue-500'"
          />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Select :model-value="seat.model || undefined" @update:model-value="handleModelChange">
          <SelectTrigger class="flex-1 text-xs">
            <SelectValue placeholder="Select model (optional)">
              <template v-if="seat.model">
                <div class="flex items-center gap-2">
                  <ProviderIcon :model="seat.model" :size="20" />
                  <span>{{ getModelName(seat.model) }}</span>
                </div>
              </template>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="model in modelOptions"
              :key="model"
              :value="model"
            >
              <div class="flex items-center gap-2">
                <ProviderIcon :model="model" :size="20" />
                <span>{{ getModelName(model) }}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          v-if="seat.model"
          @click="handleModelChange('')"
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0 shrink-0"
          title="Clear model"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>

      <div v-if="seat.isLoading && seat.loadingPhase" class="space-y-2 py-2">
        <div class="text-xs text-muted-foreground font-mono flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
          Processing {{ seat.loadingPhase }}...
        </div>
      </div>

      <div v-if="seat.vote" class="pt-2 border-t border-border/30">
        <div class="text-xs text-muted-foreground font-mono">
          Voted for: <span class="text-foreground font-semibold">{{ seat.vote }}</span>
        </div>
      </div>
    </div>
  </Card>
</template>
