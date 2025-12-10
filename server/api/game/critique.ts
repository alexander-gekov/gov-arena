import { generateText, createGateway } from 'ai'

export default defineEventHandler(async (event) => {
  const { model, scenario, policies, seatId, apiKey } = await readBody(event)

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

  const otherPolicies = policies.filter((p: any) => p.id !== seatId)
  const policiesText = otherPolicies.map((p: any) => `${p.id}: ${p.policy}`).join('\n\n')

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
              content: 'You are a delegate in a policy debate. Choose one policy to critique and provide a concise critique or question. First, respond with the ID of the policy you want to critique (e.g., "D1"), then on a new line provide your critique.',
            },
            {
              role: 'user',
              content: `Scenario: ${scenario}\n\nOther Delegates' Policies:\n${policiesText}\n\nWhich policy do you want to critique? Respond with the ID on the first line, then your critique on the following lines:`,
            },
          ],
        }),
        timeoutPromise,
      ]) as any

      const lines = result.text.trim().split('\n')
      const targetMatch = lines[0]?.match(/D[1-6]/i)
      const targetId = targetMatch ? targetMatch[0].toUpperCase() : null
      const critique = lines.slice(1).join('\n').trim() || result.text.trim()

      return { targetId, critique }
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

  throw lastError || new Error('Failed to generate critique')
})
