import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type LogType = 'proposal' | 'critique' | 'question' | 'vote' | 'result' | 'system'

export interface ActivityLog {
  timestamp: number
  type: LogType
  agent?: string
  target?: string
  message: string
}

export interface Seat {
  id: string
  name: string
  model: string
  policy?: string
  refactoredPolicy?: string
  critique?: {
    target: string
    message: string
  }
  vote?: string
  voteExplanation?: string
  isLoading?: boolean
  loadingPhase?: GamePhase
}

export interface ApiCallStats {
  timestamp: Date
  model: string
  provider: string
  phase: GamePhase
  seatId: string
  cost?: number
  inputTokens?: number
  outputTokens?: number
  duration?: number
}

export interface ModelPerformance {
  model: string
  provider: string
  seatIds: string[]
  votesReceived: number
  totalDuration: number
  avgDuration: number
  totalTokens: number
  participationScore: number
  qualityScore: number
  speedScore: number
  finalScore: number
  rank: number
}

export type GamePhase = 'setup' | 'proposal' | 'critique' | 'refactor' | 'vote' | 'results'

export const useGameStore = defineStore('game', () => {
  const seats = ref<Seat[]>([
    { id: 'D1', name: 'Delegate 1', model: '' },
    { id: 'D2', name: 'Delegate 2', model: '' },
    { id: 'D3', name: 'Delegate 3', model: '' },
    { id: 'D4', name: 'Delegate 4', model: '' },
    { id: 'D5', name: 'Delegate 5', model: '' },
    { id: 'D6', name: 'Delegate 6', model: '' },
  ])

  const currentPhase = ref<GamePhase>('setup')
  const activityLog = ref<ActivityLog[]>([])
  const scenario = ref('')
  const isRunning = ref(false)
  const apiStats = ref<ApiCallStats[]>([])
  const showStatsModal = ref(false)
  const showPresentation = ref(false)
  const presentationPhase = ref<GamePhase | null>(null)
  const currentPresenterIndex = ref(0)

  const addLog = (log: ActivityLog) => {
    activityLog.value.push(log)
  }

  const clearLog = () => {
    activityLog.value = []
  }

  const updateSeatModel = (seatId: string, model: string) => {
    const seat = seats.value.find(s => s.id === seatId)
    if (seat) {
      seat.model = model
      if (!model || !model.trim()) {
        seat.policy = undefined
        seat.refactoredPolicy = undefined
        seat.critique = undefined
        seat.vote = undefined
        seat.voteExplanation = undefined
        seat.isLoading = false
        seat.loadingPhase = undefined
      }
    }
  }

  const updateSeatPolicy = (seatId: string, policy: string) => {
    const seat = seats.value.find(s => s.id === seatId)
    if (seat) {
      seat.policy = policy
    }
  }

  const updateSeatRefactoredPolicy = (seatId: string, policy: string) => {
    const seat = seats.value.find(s => s.id === seatId)
    if (seat) {
      seat.refactoredPolicy = policy
    }
  }

  const updateSeatCritique = (seatId: string, target: string, message: string) => {
    const seat = seats.value.find(s => s.id === seatId)
    if (seat) {
      seat.critique = { target, message }
    }
  }

  const updateSeatVote = (seatId: string, target: string, explanation?: string) => {
    const seat = seats.value.find(s => s.id === seatId)
    if (seat) {
      seat.vote = target
      seat.voteExplanation = explanation
    }
  }

  const addApiStats = (stats: ApiCallStats) => {
    apiStats.value.push(stats)
  }

  const clearStats = () => {
    apiStats.value = []
  }

  const setSeatLoading = (seatId: string, isLoading: boolean, phase?: GamePhase) => {
    const seat = seats.value.find(s => s.id === seatId)
    if (seat) {
      seat.isLoading = isLoading
      seat.loadingPhase = phase
    }
  }

  const resetGame = () => {
    seats.value = seats.value.map(seat => ({
      id: seat.id,
      name: seat.name,
      model: seat.model,
    }))
    currentPhase.value = 'setup'
    clearLog()
    clearStats()
    isRunning.value = false
    showStatsModal.value = false
    showPresentation.value = false
    presentationPhase.value = null
    currentPresenterIndex.value = 0
    seats.value.forEach(seat => {
      seat.isLoading = false
      seat.loadingPhase = undefined
    })
  }

  const voteCounts = computed(() => {
    const counts: Record<string, number> = {}
    seats.value.forEach(seat => {
      if (seat.vote) {
        counts[seat.vote] = (counts[seat.vote] || 0) + 1
      }
    })
    return counts
  })

  const winner = computed(() => {
    const counts = voteCounts.value
    if (Object.keys(counts).length === 0) return null

    const maxVotes = Math.max(...Object.values(counts))
    const winners = Object.entries(counts)
      .filter(([_, votes]) => votes === maxVotes)
      .map(([id]) => id)

    return winners.length === 1 ? winners[0] : null
  })

  const modelPerformance = computed<ModelPerformance[]>(() => {
    const modelMap = new Map<string, ModelPerformance>()

    seats.value.forEach(seat => {
      if (!seat.model || !seat.model.trim()) return

      if (!modelMap.has(seat.model)) {
        const provider = seat.model.split('/')[0]
        modelMap.set(seat.model, {
          model: seat.model,
          provider: provider as string,
          seatIds: [],
          votesReceived: 0,
          totalDuration: 0,
          avgDuration: 0,
          totalTokens: 0,
          participationScore: 0,
          qualityScore: 0,
          speedScore: 0,
          finalScore: 0,
          rank: 0,
        })
      }

      const perf = modelMap.get(seat.model)!
      perf.seatIds.push(seat.id)

      const votesForThisSeat = voteCounts.value[seat.id] || 0
      perf.votesReceived += votesForThisSeat

      const seatStats = apiStats.value.filter(s => s.seatId === seat.id)
      const durations = seatStats.map(s => s.duration || 0).filter(d => d > 0)
      if (durations.length > 0) {
        perf.totalDuration += durations.reduce((a, b) => a + b, 0)
      }

      const tokens = seatStats.reduce((sum, s) => sum + (s.inputTokens || 0) + (s.outputTokens || 0), 0)
      perf.totalTokens += tokens

      let participation = 0
      if (seat.policy) participation += 1
      if (seat.critique) participation += 1
      if (seat.refactoredPolicy) participation += 1
      if (seat.vote) participation += 1
      perf.participationScore += participation
    })

    const performances = Array.from(modelMap.values())

    performances.forEach(perf => {
      const seatCount = perf.seatIds.length
      const callCount = apiStats.value.filter(s => perf.seatIds.includes(s.seatId)).length
      if (callCount > 0) {
        perf.avgDuration = perf.totalDuration / callCount
      }

      const maxVotes = Math.max(...performances.map(p => p.votesReceived), 1)
      const voteScore = maxVotes > 0 ? (perf.votesReceived / maxVotes) * 40 : 0

      const maxParticipation = Math.max(...performances.map(p => p.participationScore), 1)
      const participationScore = maxParticipation > 0 ? (perf.participationScore / maxParticipation) * 20 : 0

      const policies = seats.value.filter(s => s.model === perf.model && s.policy)
      const avgPolicyLength = policies.length > 0
        ? policies.reduce((sum, s) => sum + (s.policy?.length || 0), 0) / policies.length
        : 0
      const qualityScore = Math.min((avgPolicyLength / 200) * 20, 20)

      const durations = performances.map(p => p.avgDuration).filter(d => d > 0)
      if (durations.length > 0 && perf.avgDuration > 0) {
        const minDuration = Math.min(...durations)
        const maxDuration = Math.max(...durations)
        const speedScore = maxDuration > minDuration
          ? ((maxDuration - perf.avgDuration) / (maxDuration - minDuration)) * 20
          : 20
        perf.speedScore = speedScore
      } else {
        perf.speedScore = 20
      }

      perf.finalScore = voteScore + participationScore + qualityScore + perf.speedScore
    })

    performances.sort((a, b) => b.finalScore - a.finalScore)
    performances.forEach((perf, index) => {
      perf.rank = index + 1
    })

    return performances
  })

  return {
    seats,
    currentPhase,
    activityLog,
    scenario,
    isRunning,
    voteCounts,
    winner,
    addLog,
    clearLog,
    updateSeatModel,
    updateSeatPolicy,
    updateSeatRefactoredPolicy,
    updateSeatCritique,
    updateSeatVote,
    setSeatLoading,
    addApiStats,
    clearStats,
    apiStats,
    showStatsModal,
    showPresentation,
    presentationPhase,
    currentPresenterIndex,
    modelPerformance,
    resetGame,
  }
})
