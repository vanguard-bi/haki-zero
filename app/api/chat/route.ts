import { kv } from '@vercel/kv'
import {
  Message,
  OpenAIStream,
  StreamingTextResponse,
  experimental_StreamData,
  LangChainStream
} from 'ai'
import OpenAI from 'openai'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { getVectorStore } from '@/lib/rag/vector-store'
import { getPinecone } from '@/lib/rag/pinecone-client'

import { streamingModel, nonStreamingModel } from '@/lib/rag/llm'
import {
  STANDALONE_QUESTION_TEMPLATE,
  QA_TEMPLATE
} from '@/lib/rag/prompt-templates'


import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const formatMessage = (message: Message) => {
  return `${message.role === 'user' ? 'Human' : 'Assistant'}: ${
    message.content
  }`
}

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const userId = (await auth())?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    openai.apiKey = previewToken
  }

  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
  const question = messages[messages.length - 1].content

  console.log('got to callchain ')
  // Open AI recommendation
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ')
  const pineconeClient = await getPinecone()
  const vectorStore = await getVectorStore(pineconeClient)
  const { stream, handlers } = LangChainStream({
    experimental_streamData: true
  })
  const data = new experimental_StreamData()

  const chain = ConversationalRetrievalQAChain.fromLLM(
    streamingModel,
    vectorStore.asRetriever(),
    {
      qaTemplate: QA_TEMPLATE,
      questionGeneratorTemplate: STANDALONE_QUESTION_TEMPLATE,
      returnSourceDocuments: true, //default 4
      questionGeneratorChainOptions: {
        llm: nonStreamingModel
      }
    }
  )

  // Question using chat-history
  // Reference https://js.langchain.com/docs/modules/chains/popular/chat_vector_db#externally-managed-memory
  chain
    .call(
      {
        question: sanitizedQuestion,
        chat_history: formattedPreviousMessages
      },
      [handlers]
    )
    .then(async res => {
      const sourceDocuments = res?.sourceDocuments
      const completion = res?.content
      const firstTwoDocuments = sourceDocuments.slice(0, 4)
      const firstThreeLinesOfEachDocument = firstTwoDocuments.map(
        ({ pageContent }: { pageContent: string }) => {
          // Split the pageContent into lines and take the first six
          const lines = pageContent.split('\n').slice(0, 6)
          // Join the first three lines back into a single string
          return lines.join('\n')
        }
      )
      console.log('already appended ', data)
      data.append({
        sources: firstThreeLinesOfEachDocument // Append first three lines of each document
      })

      const onCompletion = async () => {
        const title = json.messages[0].content.substring(0, 100)
        const id = json.id ?? nanoid()
        const createdAt = Date.now()
        const path = `/chat/${id}`
        const payload = {
          id,
          title,
          userId,
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
        await kv.hmset(`chat:${id}`, payload)
        await kv.zadd(`user:chat:${userId}`, {
          score: createdAt,
          member: `chat:${id}`
        })
      }

      onCompletion()

      data.close()
    })

  return new StreamingTextResponse(stream, {}, data)
}
