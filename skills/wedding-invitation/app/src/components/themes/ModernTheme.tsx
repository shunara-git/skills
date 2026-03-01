import { WeddingData } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'

interface Props {
  data: WeddingData
}

function getCeremonyLabel(type: WeddingData['ceremonyType']): string {
  switch (type) {
    case 'ceremony': return '挙式'
    case 'reception': return '披露宴'
    case 'both': return '挙式・披露宴'
  }
}

export function ModernTheme({ data }: Props) {
  return (
    <div
      className="w-full aspect-[3/4] relative overflow-hidden font-sans"
      style={{ background: '#FFFFFF' }}
    >
      {/* 幾何学的装飾 */}
      <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.04]">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="200" cy="0" r="120" fill="none" stroke="#2D2D2D" strokeWidth="0.5" />
          <circle cx="200" cy="0" r="90" fill="none" stroke="#2D2D2D" strokeWidth="0.5" />
          <circle cx="200" cy="0" r="60" fill="none" stroke="#2D2D2D" strokeWidth="0.5" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-48 h-48 opacity-[0.04]">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="0" cy="200" r="120" fill="none" stroke="#2D2D2D" strokeWidth="0.5" />
          <circle cx="0" cy="200" r="90" fill="none" stroke="#2D2D2D" strokeWidth="0.5" />
          <circle cx="0" cy="200" r="60" fill="none" stroke="#2D2D2D" strokeWidth="0.5" />
        </svg>
      </div>

      {/* 上部アクセントライン */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-wedding-charcoal" />

      {/* コンテンツ */}
      <div className="relative h-full flex flex-col px-12 py-14">
        {/* 上部：日付を大きく */}
        <div className="mb-auto">
          <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase mb-1">
            Save the Date
          </p>
          <p className="text-3xl font-light text-wedding-charcoal tracking-tight">
            {data.date && new Date(data.date).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).replace(/\//g, '.')}
          </p>
        </div>

        {/* 中央：名前 */}
        <div className="my-auto text-center">
          <div className="space-y-2">
            <p className="text-3xl font-light tracking-[0.2em] text-wedding-charcoal">
              {data.groomLastName} {data.groomFirstName}
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-10 h-px bg-gray-300" />
              <span className="text-xs text-gray-300">&</span>
              <div className="w-10 h-px bg-gray-300" />
            </div>
            <p className="text-3xl font-light tracking-[0.2em] text-wedding-charcoal">
              {data.brideLastName} {data.brideFirstName}
            </p>
          </div>
        </div>

        {/* 下部：詳細情報 */}
        <div className="mt-auto space-y-5">
          {/* 挨拶文 */}
          <p className="text-[10px] leading-[2] tracking-wider text-gray-400 text-center max-w-[260px] mx-auto">
            {data.message.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < data.message.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>

          {/* 区切り線 */}
          <div className="w-full h-px bg-gray-100" />

          {/* 詳細グリッド */}
          <div className="grid grid-cols-2 gap-4 text-[10px]">
            <div>
              <p className="text-[8px] tracking-[0.2em] text-gray-300 uppercase mb-1">日時</p>
              <p className="text-wedding-charcoal font-medium">{formatDate(data.date)}</p>
              <p className="text-gray-400">{formatTime(data.time)} {getCeremonyLabel(data.ceremonyType)}</p>
            </div>
            <div>
              <p className="text-[8px] tracking-[0.2em] text-gray-300 uppercase mb-1">会場</p>
              <p className="text-wedding-charcoal font-medium">{data.venueName}</p>
              <p className="text-gray-400">{data.venueAddress}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[10px]">
            {data.dressCode && data.dressCode !== 'なし' && (
              <div>
                <p className="text-[8px] tracking-[0.2em] text-gray-300 uppercase mb-1">
                  ドレスコード
                </p>
                <p className="text-wedding-charcoal">{data.dressCode}</p>
              </div>
            )}
            <div>
              <p className="text-[8px] tracking-[0.2em] text-gray-300 uppercase mb-1">
                返信期限
              </p>
              <p className="text-wedding-charcoal">{formatDate(data.rsvpDeadline)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 下部アクセントライン */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-wedding-charcoal" />
    </div>
  )
}
