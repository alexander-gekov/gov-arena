# GovArena

**Policy Debate Simulation Platform**

GovArena is a web application that simulates policy debates using multiple Large Language Models (LLMs) competing against each other. Watch AI models propose policies, critique each other, refine their arguments, and vote for the strongest proposal in a structured debate format.

## 🎯 Overview

GovArena creates an arena where different LLM models act as delegates, engaging in a multi-round policy debate simulation. Each model independently develops policies, critiques competitors, refines their proposals, and votes to determine the winner. The platform provides real-time visualization of the debate through a chat-like interface and comprehensive performance analytics.

## ✨ Key Features

### Multi-LLM Competition
- Support for 26+ models across 6 providers (OpenAI, Anthropic, Google, xAI, Meta, DeepSeek)
- Assign different models to up to 6 delegate seats
- Flexible configuration - seats can be left empty

### Four-Round Debate System
1. **Proposal Phase**: Each delegate writes a specific policy proposal (4-5 sentences)
2. **Critique Phase**: Delegates critique other proposals, identifying weaknesses
3. **Refactor Phase**: Delegates refine their policies based on received critiques
4. **Voting Phase**: Delegates vote for the strongest proposal (cannot vote for themselves) with explanations

### Real-Time Visualization
- **Chat View**: Discord-style chat interface showing the debate chronologically
- Message slowdown for better spectator experience
- Color-coded messages by phase (proposal, critique, refactor, vote)
- Real-time loading indicators for active LLM processing

### Performance Analytics
- **Model Leaderboard**: Ranked performance scores based on:
  - Votes received (40%)
  - Participation completion (20%)
  - Response quality (20%)
  - Response speed (20%)
- **Statistics Modal**: Detailed API call metrics including:
  - Total cost, tokens, and duration
  - Per-call breakdown with timestamps
  - Model rankings and vote counts

### Bring Your Own Key (BYOK)
- Optional Vercel AI Gateway API key support
- Stored locally in browser (never sent to server)
- Fallback to server-side key if not provided

### Scenario Management
- Text input for custom policy scenarios
- Document upload support (.txt, .md files)
- Random scenario generator from curated examples

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Nuxt 4 (Vue 3, Composition API, TypeScript)
- **State Management**: Pinia stores
- **Styling**: Tailwind CSS with Shadcn-nuxt components
- **AI Integration**: Vercel AI SDK with AI Gateway
- **UI Components**: Radix Vue primitives

### Layout
- **Three-column Discord-style layout**:
  - Left sidebar: Delegate cards (model selection, status)
  - Center: Debate chat (main content area)
  - Right sidebar: Settings, status panel, leaderboard

## 🎮 How It Works

1. **Setup**: Assign LLM models to delegate seats and enter a policy scenario
2. **Start Game**: The simulation runs automatically through all four phases
3. **Watch**: Follow the debate in real-time through the chat interface
4. **Results**: View winner, vote counts, and detailed performance statistics

### Game Flow

```
Setup → Proposal → Critique → Refactor → Vote → Results
```

Each phase runs concurrently for all active delegates, with automatic timeout and retry logic (3 attempts, 30-second timeout per call).

## 📊 Performance Scoring

Models are ranked using a composite score:

- **Votes Received (40%)**: How many delegates voted for this model's proposal
- **Participation (20%)**: Completion of all four phases
- **Quality (20%)**: Based on policy length and coherence
- **Speed (20%)**: Average response time (faster = better)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, pnpm, yarn, or bun

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env file with:
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## 🔧 Configuration

### Environment Variables
- `AI_GATEWAY_API_KEY`: Vercel AI Gateway API key (optional if using BYOK)

### Supported Models

**OpenAI**: gpt-4.1-mini, gpt-5.1-instant, gpt-5-nano, gpt-5-mini, gpt-4o-mini, gpt-5.1-thinking, gpt-4o

**Anthropic**: claude-sonnet-4.5, claude-haiku-4.5, claude-sonnet-4, claude-3.5-sonnet

**Google**: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, gemini-2.5-flash-lite

**xAI**: grok-4-fast-reasoning, grok-4-fast-non-reasoning, grok-4.1-fast-reasoning, grok-4.1-fast-non-reasoning

**Meta**: llama-3.1-8b, llama-3.3-70b, llama-4-scout, llama-4-maverick

**DeepSeek**: deepseek-v3.2, deepseek-v3.2-thinking, deepseek-r1

## 🎨 Design Philosophy

- **Dark, minimal, tactical aesthetic**: Clean interface focused on content
- **Real-time feedback**: Visual indicators for processing states
- **Spectator-friendly**: Slowed message display for better readability
- **Performance transparency**: Comprehensive statistics and leaderboards

## 📝 License

MIT

---

Built with ❤️ for exploring AI model capabilities and policy debate dynamics.
