import { generateText, createGateway } from 'ai'

export default defineEventHandler(async (event) => {
  const { model, scenario, originalPolicy, critiques, seatId, apiKey } = await readBody(event)

  const config = useRuntimeConfig()
  const gatewayApiKey = apiKey || config.aiGatewayApiKey

  if (!gatewayApiKey) {
    throw createError({
      statusCode: 400,
      message: 'API key is required. Please provide your Vercel AI Gateway API key in settings.',
    })
  }

  const gateway = createGateway({
    apiKey: gatewayApiKey,
  })

  const maxRetries = 3
  const timeout = 30000
  let lastError: Error | null = null

  const critiquesText = critiques.length > 0
    ? `Critiques received:\n${critiques.map((c: any) => `${c.from}: ${c.message}`).join('\n\n')}`
    : 'No critiques received.'

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      })

      const result = await Promise.race([
        generateText({
          model: gateway(model),
          messages: [
            {
              role: 'system',
              content: 'You are a delegate in a policy debate. Refactor your policy proposal based on critiques received, keeping it concise (2-3 sentences maximum).',
            },
            {
              role: 'user',
              content: `Scenario: ${scenario}\n\nYour Original Policy: ${originalPolicy}\n\n${critiquesText}\n\nWrite your refactored policy proposal:`,
            },
          ],
        }),
        timeoutPromise,
      ]) as any

      return { policy: result.text.trim() }
    } catch (error: any) {
      lastError = error
      const isTimeout = error.message === 'Request timeout'
      if (isTimeout && attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        continue
      }
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        continue
      }
      throw error
    }
  }

  throw lastError || new Error('Failed to refactor policy')
})
