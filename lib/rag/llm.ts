import {ChatOpenAI} from '@langchain/openai'

export const streamingModel = new ChatOpenAI({
    modelName: 'gpt-4-0125-preview',
    streaming: true,
    verbose: true,
    maxTokens:500,
    temperature : 0.5
})

export const nonStreamingModel = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo-1106',
    verbose: true,
    maxTokens:250,
    temperature: 0.5
})