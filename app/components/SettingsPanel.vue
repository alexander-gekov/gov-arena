<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronUp, ChevronDown, Upload } from 'lucide-vue-next'
import type { GamePhase } from '~/stores/game'

const gameStore = useGameStore()
const isCollapsed = ref(false)
const { apiKey, setApiKey, clearApiKey } = useApiKey()
const apiKeyInput = ref('')

watch(() => gameStore.isRunning, (isRunning) => {
  if (isRunning) {
    isCollapsed.value = true
  }
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const exampleScenarios = [
  'How should we address rising housing costs in urban areas?',
  'What policies should be implemented to reduce carbon emissions by 50% in the next decade?',
  'How can we improve access to quality education in underserved communities?',
  'What approach should we take to regulate artificial intelligence development?',
  'How should we reform the healthcare system to ensure universal coverage?',
  'What policies would best address income inequality?',
  'How should we handle immigration and border security?',
  'What measures should be taken to ensure data privacy in the digital age?',
  'How can we improve public transportation infrastructure?',
  'What policies should govern cryptocurrency and digital assets?',
]

const selectRandomScenario = () => {
  const randomIndex = Math.floor(Math.random() * exampleScenarios.length)
  gameStore.scenario = exampleScenarios[randomIndex] || ''
}

const fileInputRef = ref<HTMLInputElement>()

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 1024 * 1024) {
    alert('File is too large. Please upload a file smaller than 1MB.')
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (content) {
      gameStore.scenario = content.trim()
    }
  }
  reader.onerror = () => {
    alert('Error reading file. Please ensure it is a valid text file.')
  }
  reader.readAsText(file)

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

const handleApiKeyChange = () => {
  if (apiKeyInput.value.trim()) {
    setApiKey(apiKeyInput.value.trim())
  } else {
    clearApiKey()
  }
}

watch(() => apiKey.value, (newKey) => {
  if (newKey && apiKeyInput.value !== newKey) {
    apiKeyInput.value = newKey
  } else if (!newKey) {
    apiKeyInput.value = ''
  }
}, { immediate: true })

const handleStart = async () => {
  const activeSeats = gameStore.seats.filter(s => s.model && s.model.trim())
  if (!gameStore.scenario.trim() || activeSeats.length === 0) {
    return
  }

  gameStore.isRunning = true
  gameStore.currentPhase = 'proposal'
  gameStore.clearLog()
  
  const startTime = Date.now()
  gameStore.addLog({
    timestamp: 0,
    type: 'system',
    message: 'Game started',
  })

  try {
    await runProposalPhase(startTime)
    await runCritiquePhase(startTime)
    await runRefactorPhase(startTime)
    await runVotePhase(startTime)
    
    gameStore.currentPhase = 'results'
    const winner = gameStore.winner
    if (winner) {
      const votes = gameStore.voteCounts[winner]
      gameStore.addLog({
        timestamp: Date.now() - startTime,
        type: 'result',
        agent: winner,
        message: `${winner} wins with ${votes} vote${votes !== 1 ? 's' : ''}.`,
      })
      gameStore.showStatsModal = true
    }
  } catch (error) {
    console.error('Game error:', error)
    gameStore.addLog({
      timestamp: Date.now() - startTime,
      type: 'system',
      message: `Error: ${error}`,
    })
  } finally {
    gameStore.isRunning = false
  }
}

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

const runProposalPhase = async (startTime: number) => {
  gameStore.currentPhase = 'proposal'
  gameStore.addLog({
    timestamp: Date.now() - startTime,
    type: 'system',
    message: 'Round 1: Proposal phase started',
  })

  const activeSeats = gameStore.seats.filter(s => s.model)
  activeSeats.forEach(seat => {
    gameStore.setSeatLoading(seat.id, true, 'proposal')
  })

  const proposals = await Promise.all(
    activeSeats.map(async (seat) => {
      const callStart = Date.now()
      try {
        const response = await $fetch<{ policy: string }>('/api/game/proposal', {
          method: 'POST',
          body: {
            model: seat.model,
            scenario: gameStore.scenario,
            seatId: seat.id,
            apiKey: apiKey.value || undefined,
          },
        })

        const duration = (Date.now() - callStart) / 1000
        const policyText = response.policy || ''
        const estimatedInputTokens = Math.ceil((gameStore.scenario.length + 200) / 4)
        const estimatedOutputTokens = Math.ceil(policyText.length / 4)

        gameStore.addApiStats({
          timestamp: new Date(),
          model: seat.model,
          provider: getProviderName(seat.model),
          phase: 'proposal',
          seatId: seat.id,
          inputTokens: estimatedInputTokens,
          outputTokens: estimatedOutputTokens,
          duration: duration,
        })

        gameStore.updateSeatPolicy(seat.id, response.policy)
        gameStore.setSeatLoading(seat.id, false)
        gameStore.addLog({
          timestamp: Date.now() - startTime,
          type: 'proposal',
          agent: seat.id,
          message: '',
        })

        return { id: seat.id, policy: response.policy }
      } catch (error) {
        console.error(`Error getting proposal from ${seat.id}:`, error)
        gameStore.setSeatLoading(seat.id, false)
        return null
      }
    })
  )

  return proposals.filter(p => p !== null)
}

const runCritiquePhase = async (startTime: number) => {
  gameStore.currentPhase = 'critique'
  gameStore.addLog({
    timestamp: Date.now() - startTime,
    type: 'system',
    message: 'Round 2: Critique phase started',
  })

  const policies = gameStore.seats
    .filter(s => s.policy)
    .map(s => ({ id: s.id, policy: s.policy! }))

  const activeSeats = gameStore.seats.filter(s => s.model && s.policy)
  activeSeats.forEach(seat => {
    gameStore.setSeatLoading(seat.id, true, 'critique')
  })

  await Promise.all(
    activeSeats.map(async (seat) => {
      const otherPolicies = policies.filter(p => p.id !== seat.id)
      if (otherPolicies.length === 0) {
        gameStore.setSeatLoading(seat.id, false)
        return
      }

      const callStart = Date.now()
      try {
        const response = await $fetch<{ critique: string; targetId: string }>('/api/game/critique', {
          method: 'POST',
          body: {
            model: seat.model,
            scenario: gameStore.scenario,
            policies,
            seatId: seat.id,
            apiKey: apiKey.value || undefined,
          },
        })

        const duration = (Date.now() - callStart) / 1000
        const critiqueText = response.critique || ''
        const policiesText = policies.map(p => p.policy).join('\n\n')
        const estimatedInputTokens = Math.ceil((gameStore.scenario.length + policiesText.length + 200) / 4)
        const estimatedOutputTokens = Math.ceil(critiqueText.length / 4)

        gameStore.addApiStats({
          timestamp: new Date(),
          model: seat.model,
          provider: getProviderName(seat.model),
          phase: 'critique',
          seatId: seat.id,
          inputTokens: estimatedInputTokens,
          outputTokens: estimatedOutputTokens,
          duration: duration,
        })

        const targetId = response.targetId || otherPolicies[0]?.id || 'Unknown'
        gameStore.updateSeatCritique(seat.id, targetId, response.critique)
        gameStore.setSeatLoading(seat.id, false)
        gameStore.addLog({
          timestamp: Date.now() - startTime,
          type: 'critique',
          agent: seat.id,
          target: targetId,
          message: response.critique,
        })
      } catch (error) {
        console.error(`Error getting critique from ${seat.id}:`, error)
        gameStore.setSeatLoading(seat.id, false)
      }
    })
  )

}

const runRefactorPhase = async (startTime: number) => {
  gameStore.currentPhase = 'refactor'
  gameStore.addLog({
    timestamp: Date.now() - startTime,
    type: 'system',
    message: 'Round 3: Refactor phase started',
  })

  const activeSeats = gameStore.seats.filter(s => s.model && s.policy)
  activeSeats.forEach(seat => {
    gameStore.setSeatLoading(seat.id, true, 'refactor')
  })

  await Promise.all(
    activeSeats.map(async (seat) => {
      const critiques = gameStore.seats
        .filter(s => s.critique && s.critique.target === seat.id)
        .map(s => ({ from: s.id, message: s.critique!.message }))

      const callStart = Date.now()
      try {
        const response = await $fetch<{ policy: string }>('/api/game/refactor', {
          method: 'POST',
          body: {
            model: seat.model,
            scenario: gameStore.scenario,
            originalPolicy: seat.policy,
            critiques,
            seatId: seat.id,
            apiKey: apiKey.value || undefined,
          },
        })

        const duration = (Date.now() - callStart) / 1000
        const policyText = response.policy || ''
        const critiquesText = critiques.map(c => c.message).join('\n\n')
        const estimatedInputTokens = Math.ceil((gameStore.scenario.length + (seat.policy?.length || 0) + critiquesText.length + 200) / 4)
        const estimatedOutputTokens = Math.ceil(policyText.length / 4)

        gameStore.addApiStats({
          timestamp: new Date(),
          model: seat.model,
          provider: getProviderName(seat.model),
          phase: 'refactor',
          seatId: seat.id,
          inputTokens: estimatedInputTokens,
          outputTokens: estimatedOutputTokens,
          duration: duration,
        })

        gameStore.updateSeatRefactoredPolicy(seat.id, response.policy)
        gameStore.setSeatLoading(seat.id, false)
      } catch (error) {
        console.error(`Error refactoring policy for ${seat.id}:`, error)
        gameStore.setSeatLoading(seat.id, false)
      }
    })
  )

}

const runVotePhase = async (startTime: number) => {
  gameStore.currentPhase = 'vote'
  gameStore.addLog({
    timestamp: Date.now() - startTime,
    type: 'system',
    message: 'Round 4: Voting phase started',
  })

  const policies = gameStore.seats
    .filter(s => s.refactoredPolicy || s.policy)
    .map(s => ({ id: s.id, policy: s.refactoredPolicy || s.policy! }))

  const activeSeats = gameStore.seats.filter(s => s.model && (s.refactoredPolicy || s.policy))
  activeSeats.forEach(seat => {
    gameStore.setSeatLoading(seat.id, true, 'vote')
  })

  await Promise.all(
    activeSeats.map(async (seat) => {
      const callStart = Date.now()
      try {
        const response = await $fetch<{ vote: string; explanation: string }>('/api/game/vote', {
          method: 'POST',
          body: {
            model: seat.model,
            scenario: gameStore.scenario,
            policies,
            seatId: seat.id,
            apiKey: apiKey.value || undefined,
          },
        })

        const duration = (Date.now() - callStart) / 1000
        const explanationText = response.explanation || ''
        const policiesText = policies.map(p => p.policy).join('\n\n')
        const estimatedInputTokens = Math.ceil((gameStore.scenario.length + policiesText.length + 200) / 4)
        const estimatedOutputTokens = Math.ceil(explanationText.length / 4)

        gameStore.addApiStats({
          timestamp: new Date(),
          model: seat.model,
          provider: getProviderName(seat.model),
          phase: 'vote',
          seatId: seat.id,
          inputTokens: estimatedInputTokens,
          outputTokens: estimatedOutputTokens,
          duration: duration,
        })

        if (response.vote) {
          gameStore.updateSeatVote(seat.id, response.vote, response.explanation)
          gameStore.setSeatLoading(seat.id, false)
          gameStore.addLog({
            timestamp: Date.now() - startTime,
            type: 'vote',
            agent: seat.id,
            target: response.vote,
            message: response.explanation || '',
          })
        } else {
          gameStore.setSeatLoading(seat.id, false)
        }
      } catch (error) {
        console.error(`Error getting vote from ${seat.id}:`, error)
        gameStore.setSeatLoading(seat.id, false)
      }
    })
  )

}

const handleReset = () => {
  gameStore.resetGame()
}
</script>

<template>
  <Card v-if="!isCollapsed || !gameStore.isRunning" class="bg-card/80 border-border/50 backdrop-blur-sm gap-4 py-4">
    <div class="px-4 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-mono font-semibold text-foreground">Settings</h3>
        <Button
          v-if="gameStore.isRunning"
          @click="toggleCollapse"
          variant="ghost"
          size="sm"
          class="h-6 w-6 p-0"
        >
          <ChevronUp v-if="!isCollapsed" class="h-4 w-4" />
          <ChevronDown v-else class="h-4 w-4" />
        </Button>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-xs text-muted-foreground font-mono">Scenario</label>
          <div class="flex gap-2">
            <Button
              @click="triggerFileUpload"
              :disabled="gameStore.isRunning"
              variant="outline"
              size="sm"
              class="text-xs h-7 px-2"
              title="Upload document"
            >
              <Upload class="h-3 w-3" />
            </Button>
            <Button
              @click="selectRandomScenario"
              :disabled="gameStore.isRunning"
              variant="outline"
              size="sm"
              class="text-xs h-7"
            >
              Random
            </Button>
          </div>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept=".txt,.md,.text"
          @change="handleFileUpload"
          class="hidden"
        />
        <textarea
          v-model="gameStore.scenario"
          :disabled="gameStore.isRunning"
          class="w-full min-h-[100px] px-3 py-2 text-xs bg-input/30 border border-border/50 rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          placeholder="Enter the policy scenario..."
        />
      </div>

      <div class="space-y-2 pt-2 border-t border-border/30">
        <label class="text-xs text-muted-foreground font-mono">API Key</label>
        <input
          v-model="apiKeyInput"
          type="password"
          placeholder="Vercel AI Gateway API key (optional)"
          class="w-full px-3 py-2 text-xs bg-input/30 border border-border/50 rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="gameStore.isRunning"
          @blur="handleApiKeyChange"
          @keyup.enter="handleApiKeyChange"
        />
      </div>

      <div class="flex gap-2">
        <Button
          @click="handleStart"
          :disabled="gameStore.isRunning || !gameStore.scenario.trim() || gameStore.seats.filter(s => s.model && s.model.trim()).length === 0"
          class="flex-1 text-xs"
        >
          Start Game
        </Button>
        <Button
          @click="handleReset"
          :disabled="gameStore.isRunning"
          variant="outline"
          class="text-xs"
        >
          Reset
        </Button>
      </div>
    </div>
  </Card>
  <Card v-else-if="gameStore.isRunning && isCollapsed" class="bg-card/80 border-border/50 backdrop-blur-sm">
    <Button
      @click="toggleCollapse"
      variant="outline"
      size="sm"
      class="w-full text-xs"
    >
      <ChevronDown class="h-4 w-4 mr-2" />
      Show Settings
    </Button>
  </Card>
</template>
