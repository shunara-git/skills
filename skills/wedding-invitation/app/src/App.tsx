import { useState, useCallback } from 'react'
import { WeddingData, AppPhase } from '@/types'
import { ChatInterface } from '@/components/ChatInterface'
import { InvitationPreview } from '@/components/InvitationPreview'

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('chat')
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null)

  const handleChatComplete = useCallback((data: WeddingData) => {
    setWeddingData(data)
    setPhase('preview')
  }, [])

  const handleBack = useCallback(() => {
    setPhase('chat')
    setWeddingData(null)
  }, [])

  return (
    <div className="h-full w-full max-w-lg mx-auto bg-white shadow-xl flex flex-col">
      {phase === 'chat' && <ChatInterface onComplete={handleChatComplete} />}
      {phase === 'preview' && weddingData && (
        <InvitationPreview data={weddingData} onBack={handleBack} />
      )}
    </div>
  )
}
