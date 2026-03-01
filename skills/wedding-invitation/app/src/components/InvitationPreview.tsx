import { useRef, useState, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { WeddingData, ThemeName, THEME_INFO } from '@/types'
import { JapaneseTheme } from './themes/JapaneseTheme'
import { ClassicTheme } from './themes/ClassicTheme'
import { ModernTheme } from './themes/ModernTheme'
import { NaturalTheme } from './themes/NaturalTheme'

interface Props {
  data: WeddingData
  onBack: () => void
}

const THEME_COMPONENTS: Record<ThemeName, React.FC<{ data: WeddingData }>> = {
  japanese: JapaneseTheme,
  classic: ClassicTheme,
  modern: ModernTheme,
  natural: NaturalTheme,
}

export function InvitationPreview({ data, onBack }: Props) {
  const invitationRef = useRef<HTMLDivElement>(null)
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(data.theme)
  const [isExporting, setIsExporting] = useState(false)

  const ThemeComponent = THEME_COMPONENTS[currentTheme]

  const handleDownload = useCallback(async () => {
    if (!invitationRef.current) return
    setIsExporting(true)
    try {
      const canvas = await html2canvas(invitationRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      })
      const link = document.createElement('a')
      link.download = `wedding-invitation-${data.groomLastName}-${data.brideLastName}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }, [data])

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-wedding-charcoal transition-colors"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            やり直す
          </button>
          <h2 className="font-serif font-semibold text-sm text-wedding-charcoal">
            招待状プレビュー
          </h2>
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-wedding-crimson px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
          >
            {isExporting ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            画像を保存
          </button>
        </div>
      </div>

      {/* テーマ切り替え */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {(Object.entries(THEME_INFO) as [ThemeName, typeof THEME_INFO[ThemeName]][]).map(
            ([key, info]) => (
              <button
                key={key}
                onClick={() => setCurrentTheme(key)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  currentTheme === key
                    ? 'bg-wedding-charcoal text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {info.name}
              </button>
            )
          )}
        </div>
      </div>

      {/* プレビューエリア */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center p-8">
        <div className="w-full max-w-md shadow-2xl rounded-lg overflow-hidden">
          <div ref={invitationRef}>
            <ThemeComponent data={{ ...data, theme: currentTheme }} />
          </div>
        </div>
      </div>
    </div>
  )
}
