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

export function JapaneseTheme({ data }: Props) {
  return (
    <div
      className="w-full aspect-[3/4] relative overflow-hidden font-mincho"
      style={{
        background: 'linear-gradient(180deg, #FAF8F5 0%, #F5F0E8 100%)',
      }}
    >
      {/* 和柄装飾 - 上部 */}
      <div className="absolute top-0 left-0 w-full h-24 opacity-15">
        <svg viewBox="0 0 400 80" className="w-full h-full">
          {/* 青海波パターン */}
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={i}>
              <path
                d={`M${i * 35 - 10} 60 Q${i * 35 + 7} 35, ${i * 35 + 25} 60`}
                fill="none"
                stroke="#B5495B"
                strokeWidth="0.8"
              />
              <path
                d={`M${i * 35 - 5} 60 Q${i * 35 + 7} 40, ${i * 35 + 20} 60`}
                fill="none"
                stroke="#C4A35A"
                strokeWidth="0.6"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* 和柄装飾 - 下部 */}
      <div className="absolute bottom-0 left-0 w-full h-24 opacity-15 rotate-180">
        <svg viewBox="0 0 400 80" className="w-full h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={i}>
              <path
                d={`M${i * 35 - 10} 60 Q${i * 35 + 7} 35, ${i * 35 + 25} 60`}
                fill="none"
                stroke="#B5495B"
                strokeWidth="0.8"
              />
              <path
                d={`M${i * 35 - 5} 60 Q${i * 35 + 7} 40, ${i * 35 + 20} 60`}
                fill="none"
                stroke="#C4A35A"
                strokeWidth="0.6"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* 金の縦線装飾 */}
      <div
        className="absolute left-8 top-20 bottom-20 w-px"
        style={{ background: 'linear-gradient(180deg, transparent, #C4A35A, transparent)' }}
      />
      <div
        className="absolute right-8 top-20 bottom-20 w-px"
        style={{ background: 'linear-gradient(180deg, transparent, #C4A35A, transparent)' }}
      />

      {/* コンテンツ */}
      <div className="relative h-full flex flex-col items-center justify-center px-12 py-16 text-center">
        {/* 寿 */}
        <div className="mb-6">
          <span
            className="text-5xl font-bold tracking-widest"
            style={{ color: '#B5495B' }}
          >
            寿
          </span>
        </div>

        {/* 区切り線 */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-px bg-wedding-gold" />
          <div className="w-1.5 h-1.5 rotate-45 bg-wedding-gold" />
          <div className="w-12 h-px bg-wedding-gold" />
        </div>

        {/* 挨拶文 */}
        <div className="mb-8 max-w-xs">
          <p
            className="text-xs leading-[2] tracking-wider text-wedding-charcoal/80"
            style={{ lineHeight: '2.2' }}
          >
            {data.message.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < data.message.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>

        {/* 名前 */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xs text-wedding-charcoal/60 mb-1">{data.groomLastName}</p>
              <p className="text-2xl font-semibold text-wedding-charcoal tracking-widest">
                {data.groomFirstName}
              </p>
            </div>
            <div className="text-wedding-gold text-lg">&</div>
            <div className="text-center">
              <p className="text-xs text-wedding-charcoal/60 mb-1">{data.brideLastName}</p>
              <p className="text-2xl font-semibold text-wedding-charcoal tracking-widest">
                {data.brideFirstName}
              </p>
            </div>
          </div>
        </div>

        {/* 詳細 */}
        <div className="space-y-3 text-xs text-wedding-charcoal/70 tracking-wider">
          <div>
            <p className="text-wedding-crimson font-medium text-sm mb-1">
              {formatDate(data.date)}
            </p>
            <p>{formatTime(data.time)} {getCeremonyLabel(data.ceremonyType)}</p>
          </div>

          <div className="flex items-center gap-2 justify-center">
            <div className="w-8 h-px bg-wedding-gold/40" />
            <div className="w-1 h-1 rotate-45 bg-wedding-gold/40" />
            <div className="w-8 h-px bg-wedding-gold/40" />
          </div>

          <div>
            <p className="font-medium text-sm text-wedding-charcoal/80 mb-0.5">
              {data.venueName}
            </p>
            <p className="text-[10px]">{data.venueAddress}</p>
          </div>

          {data.dressCode && data.dressCode !== 'なし' && (
            <p>ドレスコード：{data.dressCode}</p>
          )}

          <div className="pt-2">
            <p className="text-[10px] text-wedding-charcoal/50">
              ご出欠のお返事は {formatDate(data.rsvpDeadline)} までにお願いいたします
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
