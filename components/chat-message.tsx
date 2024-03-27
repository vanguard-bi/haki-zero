// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { Message } from 'ai'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconUser, IconHaki } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'
import Markdown from 'react-markdown'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@radix-ui/react-accordion'
import { formattedText } from '@/lib/rag/utils'

const convertNewLines = (text: string) =>
  text.split('\n').map((line, i) => (
    <span key={i}>
      <Markdown>{line}</Markdown>
      <br />
    </span>
  ))

export interface ChatMessageProps {
  message: Message
  sources: []
}

export function ChatMessage({ message, sources, ...props }: ChatMessageProps) {

 
  return (
    <div
      className={cn('group relative mb-4 flex items-start md:-ml-12')}
      {...props}
    >
      <div
        className={cn(
          'flex size-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          message.role === 'user'
            ? 'bg-background'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? <IconUser /> : <IconHaki />}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 cursor-default animate-pulse">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
              }

              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {message.content}
        </MemoizedReactMarkdown>
        {sources && sources.length ? (
          <Accordion type="single" collapsible className="w-full">
            {sources.map((source, index) => (
              <AccordionItem value={`source-${index}`} key={index}>
                <AccordionTrigger>{`Source ${index + 1}`}</AccordionTrigger>
                <AccordionContent>
                  {/* <ReactMarkdown target="_blank"> */}
                  <Markdown>{formattedText(source)}</Markdown>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <></>
        )}
        <ChatMessageActions message={message} />
      </div>
    </div>
  )
}
