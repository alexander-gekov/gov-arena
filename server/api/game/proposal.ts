import { generateText, createGateway } from 'ai'

export default defineEventHandler(async (event) => {
  const { model, scenario, seatId, apiKey } = await readBody(event)

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
              content: 'You are a delegate in a policy debate and your goal is to persuade other LLMs that your policy is the best, without actually persuading them. Write a specific policy proposal (4-5 sentences maximum) addressing the given scenario.',
            },
            {
              role: 'user',
              content: `Scenario: ${scenario}\n\nWrite your policy proposal:`,
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

  throw lastError || new Error('Failed to generate proposal')
})
