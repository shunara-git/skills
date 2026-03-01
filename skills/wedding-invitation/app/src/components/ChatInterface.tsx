import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ChatMessage as ChatMessageType,
  WeddingData,
  ThemeName,
  EMPTY_WEDDING_DATA,
  THEME_INFO,
} from '@/types'
import { generateId, formatDate, formatTime } from '@/lib/utils'
import {
  buildAiMessage,
  processUserInput,
  getTotalSteps,
} from '@/lib/chatFlow'
import { ChatMessage, TypingIndicator } from './ChatMessage'
import { ThemeSelector } from './ThemeSelector'

interface Props {
  onComplete: (data: WeddingData) => void
}

export function ChatInterface({ onComplete }: Props) {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [weddingData, setWeddingData] = useState<Partial<WeddingData>>(EMPTY_WEDDING_DATA)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const initialized = useRef(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const addAiMessage = useCallback(
    (stepIndex: number, data: Partial<WeddingData>) => {
      setIsTyping(true)
      setTimeout(() => {
        const msg = buildAiMessage(stepIndex, data)
        if (msg) {
          setMessages((prev) => [...prev, msg])
        }
        setIsTyping(false)
      }, 800)
    },
    []
  )

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      addAiMessage(0, weddingData)
    }
  }, [addAiMessage, weddingData])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    if (!isTyping) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg?.role === 'ai') {
        if (lastMsg.inputType === 'textarea') {
          textareaRef.current?.focus()
        } else if (
          lastMsg.inputType !== 'select' &&
          lastMsg.inputType !== 'theme'
        ) {
          inputRef.current?.focus()
        }
      }
    }
  }, [isTyping, messages])

  const handleSubmit = useCallback(
    (value: string) => {
      if (!value.trim() && getCurrentInputType() !== 'textarea') return

      const lastAiMsg = messages.filter((m) => m.role === 'ai').pop()
      let displayValue = value

      if (lastAiMsg?.inputType === 'date') {
        displayValue = formatDate(value)
      } else if (lastAiMsg?.inputType === 'time') {
        displayValue = formatTime(value)
      }

      const userMsg: ChatMessageType = {
        id: generateId(),
        role: 'user',
        content: displayValue,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])
      setInputValue('')

      const newData = processUserInput(currentStep, value, weddingData)
      setWeddingData(newData)

      const nextStep = currentStep + 1
      if (nextStep < getTotalSteps()) {
        setCurrentStep(nextStep)
        addAiMessage(nextStep, newData)
      } else {
        setIsTyping(true)
        setTimeout(() => {
          const completeMsg: ChatMessageType = {
            id: generateId(),
            role: 'ai',
            content:
              '招待状を作成しています...\n少々お待ちください ✨',
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, completeMsg])
          setIsTyping(false)
          setTimeout(() => {
            onComplete(newData as WeddingData)
          }, 1500)
        }, 800)
      }
    },
    [currentStep, messages, weddingData, addAiMessage, onComplete]
  )

  const handleSelectOption = useCallback(
    (value: string, label: string) => {
      const userMsg: ChatMessageType = {
        id: generateId(),
        role: 'user',
        content: label,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])

      const newData = processUserInput(currentStep, value, weddingData)
      setWeddingData(newData)

      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      addAiMessage(nextStep, newData)
    },
    [currentStep, weddingData, addAiMessage]
  )

  const handleThemeSelect = useCallback(
    (theme: ThemeName) => {
      const info = THEME_INFO[theme]
      handleSelectOption(theme, info.name)
    },
    [handleSelectOption]
  )

  const getCurrentInputType = () => {
    const lastAiMsg = messages.filter((m) => m.role === 'ai').pop()
    return lastAiMsg?.inputType
  }

  const lastAiMsg = messages.filter((m) => m.role === 'ai').pop()
  const showInput = !isTyping && lastAiMsg?.role === 'ai'
  const inputType = lastAiMsg?.inputType

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wedding-crimson to-wedding-gold flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h2 className="font-serif font-semibold text-wedding-charcoal text-sm">
              招待状アシスタント
            </h2>
            <p className="text-xs text-gray-400">
              ステップ {Math.min(currentStep + 1, getTotalSteps())} / {getTotalSteps()}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-wedding-crimson to-wedding-gold rounded-full transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / getTotalSteps()) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}

        {/* Theme selector inline */}
        {showInput && inputType === 'theme' && (
          <ThemeSelector onSelect={handleThemeSelect} />
        )}

        {/* Select options inline */}
        {showInput && inputType === 'select' && lastAiMsg?.options && (
          <div className="flex flex-col gap-2 animate-slide-up">
            {lastAiMsg.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelectOption(opt.value, opt.label)}
                className="text-left rounded-xl border-2 border-gray-100 bg-white px-4 py-3 transition-all hover:border-wedding-gold hover:shadow-md focus:outline-none focus:ring-2 focus:ring-wedding-gold"
              >
                <span className="font-medium text-sm text-wedding-charcoal">
                  {opt.label}
                </span>
                {opt.description && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {opt.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {showInput &&
        inputType !== 'select' &&
        inputType !== 'theme' && (
          <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-100 px-6 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(inputValue)
              }}
              className="flex gap-3"
            >
              {inputType === 'textarea' ? (
                <div className="flex-1 flex flex-col gap-2">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={lastAiMsg?.inputPlaceholder || '入力してください'}
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-wedding-charcoal placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-wedding-gold focus:border-transparent resize-none"
                  />
                  <button
                    type="submit"
                    className="self-end rounded-xl bg-wedding-crimson px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-wedding-crimson focus:ring-offset-2"
                  >
                    {inputValue.trim() ? '送信' : 'おまかせ'}
                  </button>
                </div>
              ) : (
                <>
                  <input
                    ref={inputRef}
                    type={inputType === 'date' || inputType === 'time' ? inputType : 'text'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={lastAiMsg?.inputPlaceholder || '入力してください'}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-wedding-charcoal placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-wedding-gold focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-wedding-crimson px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-wedding-crimson focus:ring-offset-2"
                  >
                    送信
                  </button>
                </>
              )}
            </form>
          </div>
        )}
    </div>
  )
}
