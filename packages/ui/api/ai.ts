import OpenAI from 'https://esm.sh/openai@4.11.0'
import { OpenAIStream, StreamingTextResponse } from 'https://esm.sh/ai@2.2.16'
import { erc20Function, erc721Function, erc1155Function, governorFunction, customFunction } from '../src/wiz-functions.ts'
import { Redis } from 'https://esm.sh/@upstash/redis@1.25.1'

const redis = new Redis({
  url: Deno.env.get('REDIS_URL'),
  token: Deno.env.get('REDIS_TOKEN'),
})

export default async (req: Request) => {
  try {
    const data = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    const openai = new OpenAI({
      apiKey: apiKey
    })

    const validatedMessages = data.messages.filter((message: { role: string, content: string }) => {
      return message.content.length < 500
    })

    const messages = [{
      role: 'system',
      content: `
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
        const createdAt = Date.now()
        const path = `/chat/${id}`
        const payload = {
          id,
          createdAt,
          path,
          messages: [
            ...messages,
            {
              content: completion,
              role: 'assistant'
            }
          ]
        }
        console.log(payload)
        const exists = redis.exissts(`chat:${id}`)
        if (!exists) {
          console.log('creating new chat')
          await redis.hset(`chat:${id}`, payload)
        }
        else {
          console.log('already exists chat')
          await redis.hset(`chat:${id}`, payload)
        }

        // await kv.hmset(`chat:${id}`, payload)
        // await kv.zadd(`user:chat:${userId}`, {
        //   score: createdAt,
        //   member: `chat:${id}`
        // })
      }
    });
    return new StreamingTextResponse(stream);

  } catch (e) {
    console.log(e)
    return Response.json({
      error: 'could not retrieve results'
    })
  }
}
