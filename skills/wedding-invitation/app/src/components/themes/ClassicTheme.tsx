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

export function ClassicTheme({ data }: Props) {
  return (
    <div
      className="w-full aspect-[3/4] relative overflow-hidden font-serif"
      style={{
        background: 'linear-gradient(180deg, #FAF8F5 0%, #F7F3ED 50%, #FAF8F5 100%)',
      }}
    >
      {/* 角装飾 */}
      <svg
        className="absolute top-6 left-6 w-16 h-16 opacity-30"
        viewBox="0 0 60 60"
      >
        <path d="M0 0 L30 0 Q10 10, 0 30 Z" fill="none" stroke="#223A70" strokeWidth="1" />
        <path d="M0 0 L20 0 Q8 8, 0 20" fill="none" stroke="#C4A35A" strokeWidth="0.8" />
      </svg>
      <svg
        className="absolute top-6 right-6 w-16 h-16 opacity-30"
        viewBox="0 0 60 60"
        style={{ transform: 'scaleX(-1)' }}
      >
        <path d="M0 0 L30 0 Q10 10, 0 30 Z" fill="none" stroke="#223A70" strokeWidth="1" />
        <path d="M0 0 L20 0 Q8 8, 0 20" fill="none" stroke="#C4A35A" strokeWidth="0.8" />
      </svg>
      <svg
        className="absolute bottom-6 left-6 w-16 h-16 opacity-30"
        viewBox="0 0 60 60"
        style={{ transform: 'scaleY(-1)' }}
      >
        <path d="M0 0 L30 0 Q10 10, 0 30 Z" fill="none" stroke="#223A70" strokeWidth="1" />
        <path d="M0 0 L20 0 Q8 8, 0 20" fill="none" stroke="#C4A35A" strokeWidth="0.8" />
      </svg>
      <svg
        className="absolute bottom-6 right-6 w-16 h-16 opacity-30"
        viewBox="0 0 60 60"
        style={{ transform: 'scale(-1, -1)' }}
      >
        <path d="M0 0 L30 0 Q10 10, 0 30 Z" fill="none" stroke="#223A70" strokeWidth="1" />
        <path d="M0 0 L20 0 Q8 8, 0 20" fill="none" stroke="#C4A35A" strokeWidth="0.8" />
      </svg>

      {/* 外枠 */}
      <div className="absolute inset-8 border border-wedding-navy/15 rounded-sm" />
      <div className="absolute inset-10 border border-wedding-gold/20 rounded-sm" />

      {/* コンテンツ */}
      <div className="relative h-full flex flex-col items-center justify-center px-16 py-16 text-center">
        {/* タイトル */}
        <div className="mb-2">
          <p className="text-xs tracking-[0.5em] text-wedding-navy/50 uppercase">
            Wedding Invitation
          </p>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-px bg-wedding-navy/20" />
          <svg viewBox="0 0 20 20" className="w-4 h-4 text-wedding-gold/50">
            <path
              d="M10 2 L12 8 L18 8 L13 12 L15 18 L10 14 L5 18 L7 12 L2 8 L8 8 Z"
              fill="currentColor"
            />
          </svg>
          <div className="w-16 h-px bg-wedding-navy/20" />
        </div>

        {/* 名前 */}
        <div className="mb-8">
          <div className="flex items-baseline justify-center gap-4">
            <div>
              <p className="text-xs text-wedding-navy/40 mb-1">{data.groomLastName}</p>
              <p className="text-2xl font-semibold text-wedding-navy tracking-wider">
                {data.groomFirstName}
              </p>
            </div>
            <span className="text-wedding-gold text-xl font-light">&</span>
            <div>
              <p className="text-xs text-wedding-navy/40 mb-1">{data.brideLastName}</p>
              <p className="text-2xl font-semibold text-wedding-navy tracking-wider">
                {data.brideFirstName}
              </p>
            </div>
          </div>
        </div>

        {/* 区切り */}
        <div className="w-20 h-px bg-wedding-gold/30 mb-6" />

        {/* 挨拶文 */}
        <div className="mb-8 max-w-xs">
          <p className="text-[11px] leading-[2.2] tracking-wider text-wedding-navy/60">
            {data.message.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < data.message.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>

        {/* 詳細 */}
        <div className="space-y-4 text-xs text-wedding-navy/70 tracking-wider">
          <div>
            <p className="text-sm font-medium text-wedding-navy/80 mb-1">
              {formatDate(data.date)}
            </p>
            <p>{formatTime(data.time)} {getCeremonyLabel(data.ceremonyType)}</p>
          </div>

          <div>
            <p className="font-medium text-sm text-wedding-navy/80 mb-0.5">
              {data.venueName}
            </p>
            <p className="text-[10px] text-wedding-navy/50">{data.venueAddress}</p>
          </div>

          {data.dressCode && data.dressCode !== 'なし' && (
            <p className="text-[10px]">ドレスコード：{data.dressCode}</p>
          )}

          <div className="pt-2">
            <div className="w-12 h-px bg-wedding-gold/20 mx-auto mb-3" />
            <p className="text-[10px] text-wedding-navy/40">
              ご出欠のお返事は {formatDate(data.rsvpDeadline)} までに
              <br />
              お知らせくださいますようお願い申し上げます
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
