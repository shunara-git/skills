import { ChatMessage as ChatMessageType } from '@/types'

interface Props {
  message: ChatMessageType
}

export function ChatMessage({ message }: Props) {
  const isAi = message.role === 'ai'

  return (
    <div
      className={`flex ${isAi ? 'justify-start' : 'justify-end'} animate-slide-up`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3 ${
          isAi
            ? 'bg-white text-wedding-charcoal shadow-sm border border-gray-100'
            : 'bg-wedding-crimson text-white shadow-md'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-line">
          {message.content}
        </p>
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing" />
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-typing"
            style={{ animationDelay: '0.2s' }}
          />
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-typing"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </div>
  )
}
