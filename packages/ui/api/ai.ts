import OpenAI from 'npm:openai'
import { erc20Function, erc721Function, erc1155Function, governorFunction, customFunction } from '../src/wiz-functions.ts'

export default async (req: Request) => {
  // const body: { prompt: string } = await req.json();
  // const prompt = body.prompt;


  try {
    const data = await req.json()

    const apiKey = Deno.env.get('OPENAI_API_KEY')

    const openai = new OpenAI({
      apiKey: apiKey
    })

    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0613',
      messages: data.messages,
      functions: [
        erc20Function, erc721Function, erc1155Function, governorFunction, customFunction
      ],
      temperature: 0.7,
      // stream: true
    })

    return Response.json(result)

  } catch (e) {
    console.log(e)
    return Response.json({
      error: 'could not retrieve results'
    })
  }
}
