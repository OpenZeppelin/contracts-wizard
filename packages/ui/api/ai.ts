import OpenAI from 'https://esm.sh/openai@4.11.0'
import { OpenAIStream, StreamingTextResponse } from 'https://esm.sh/ai@2.2.16'
import { erc20Function, erc721Function, erc1155Function, governorFunction, customFunction } from '../src/wiz-functions.ts'
import { Redis } from 'https://esm.sh/@upstash/redis@1.25.1'

export default async (req: Request) => {
  try {
    const data = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    const redisUrl = Deno.env.get('REDIS_URL')
    const redisToken = Deno.env.get('REDIS_TOKEN')

    if (!redisUrl || !redisToken) { throw new Error('missing redis credentials') }

    const redis = new Redis({
      url: redisUrl, 
      token: redisToken,
    })

    const openai = new OpenAI({
      apiKey: apiKey
    })

    const validatedMessages = data.messages.filter((message: { role: string, content: string }) => {
      return message.content.length < 500
    })

    const messages = [{
      role: 'system',
      content: `
        You are a smart contract assistant built by OpenZeppelin to help users using OpenZeppelin Contracts Wizard.
        The current options are ${JSON.stringify(data.currentOpts)}.
        Please be kind and concise. Keep responses to <100 words.
      `.trim()
    }, ...validatedMessages]

    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages,
      functions: [
        erc20Function, erc721Function, erc1155Function, governorFunction, customFunction
      ],
      temperature: 0.7,
      stream: true
    })

    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        const id = data.chatId
        const updatedAt = Date.now()
        const payload = {
          id,
          updatedAt,
          messages: [
            ...messages,
            {
              content: completion,
              role: 'assistant'
            }
          ]
        }
        const exists = await redis.exists(`chat:${id}`)
        if (!exists) {
          // @ts-ignore redis types seem to require [key: string]
          payload.createdAt = updatedAt
        }
        await redis.hset(`chat:${id}`, payload)
      }
    });
    return new StreamingTextResponse(stream);

  } catch (e) {
    console.error("Could not retrieve results:", e);
    return Response.json({
      error: 'Could not retrieve results.'
    });
  }
}
