import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'Get the details of a specific case',
    message: `What are the details of the election petition ruled on by David Maraga?`
  },
  {
    heading: 'Find legal precedent',
    message: 'What is the legal precedent on recorded phonecalls? \n'
  },
  {
    heading: 'Get general insights',
    message: `What is the role of governors? \n`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">Hi! I'm Haki.</h1>
        <p className="leading-normal text-muted-foreground">
          I am a research assistant built by{' '}
          <ExternalLink href="https://songh.ai">Songhai</ExternalLink>, and{' '}
          <ExternalLink href="https://vanguard.bi">Vanguard BI</ExternalLink>.
        </p>
        <p className="leading-normal text-muted-foreground">
          I use the Constitution of Kenya, Kenyan case law and state-the-art AI to get you the information you need.
        </p>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
