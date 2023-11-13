import OpenAI from 'https://esm.sh/openai@4.11.0'
import { OpenAIStream, StreamingTextResponse } from 'https://esm.sh/ai@2.2.16'
import { erc20Function, erc721Function, erc1155Function, governorFunction, customFunction } from '../src/wiz-functions.ts'

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

    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: `
            The current options are is ${JSON.stringify(data.currentOpts)}.
            Please be kind and concise. Keep responses to <100 words.
          `.trim()
        },
        ...validatedMessages
      ],
      functions: [
        erc20Function, erc721Function, erc1155Function, governorFunction, customFunction
      ],
      temperature: 0.7,
      stream: true
    })

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);

  } catch (e) {
    console.log(e)
    return Response.json({
      error: 'could not retrieve results'
    })
  }
}
