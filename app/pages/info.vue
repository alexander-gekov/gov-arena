<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  document.documentElement.classList.add('dark')
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="flex items-center justify-between px-6 py-4 border-b border-border/50">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-xl font-mono font-bold tracking-tight hover:opacity-80 transition-opacity">
          GovArena
        </NuxtLink>
        <div class="text-xs text-muted-foreground font-mono">
          Policy Debate Simulation
        </div>
      </div>
      <div class="flex items-center gap-3">
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

    <div class="container mx-auto max-w-4xl px-6 py-12">
      <div class="space-y-12">
        <div class="space-y-4">
          <h2 class="text-2xl font-mono font-bold text-foreground">About Me</h2>
          <div class="space-y-4 text-muted-foreground">
            <div class="space-y-2">
              <h3 class="text-lg font-mono font-semibold text-foreground">Alexander Gekov</h3>
              <p class="leading-relaxed">
                Co-Founder @ TalentSight | Software Engineer | AI Enthusiast
              </p>
              <p class="leading-relaxed">
                Helping Recruiters Succeed
              </p>
            </div>
            
            <div class="space-y-2 pt-2 border-t border-border/30">
              <p class="leading-relaxed">
                I am currently working on <span class="text-foreground font-semibold">TalentSight</span>, an AI-driven recruitment platform designed to help recruiters save hours of manual work in terms of sourcing and outreach.
              </p>
            </div>

            <div class="space-y-2 pt-2 border-t border-border/30">
              <p class="text-sm font-mono font-semibold text-foreground mb-2">Find me on:</p>
              <div class="flex flex-wrap gap-4">
                <a
                  href="https://github.com/alexander-gekov"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline font-mono text-sm"
                >
                  GitHub
                </a>
                <a
                  href="https://twitter.com/alexandergekov"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline font-mono text-sm"
                >
                  Twitter
                </a>
                <a
                  href="https://youtube.com/@alexandergekov"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline font-mono text-sm"
                >
                  YouTube
                </a>
                <a
                  href="https://linkedin.com/in/alexandergekov"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline font-mono text-sm"
                >
                  LinkedIn
                </a>
                <a
                  href="https://me.alexandergekov.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline font-mono text-sm"
                >
                  Website
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-2xl font-mono font-bold text-foreground">About the Project</h2>
          <div class="space-y-3 text-muted-foreground">
            <p class="leading-relaxed">
              GovArena is part of my submission for the <span class="text-foreground font-semibold">Vercel AI Gateway Hackathon</span>. This project demonstrates the power of Vercel AI Gateway in enabling parallel LLM interactions and creating engaging multi-agent simulations.
            </p>
            <p class="leading-relaxed">
              The platform showcases how different AI models can compete in structured policy debates, providing insights into model capabilities, reasoning patterns, and collaborative dynamics.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
