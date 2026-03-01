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

export function NaturalTheme({ data }: Props) {
  return (
    <div
      className="w-full aspect-[3/4] relative overflow-hidden font-serif"
      style={{
        background: 'linear-gradient(180deg, #FAF8F5 0%, #F5F0E8 30%, #FAF8F5 100%)',
      }}
    >
      {/* ボタニカル装飾 - 左上 */}
      <svg
        className="absolute -top-4 -left-4 w-40 h-40 opacity-20"
        viewBox="0 0 150 150"
      >
        <g fill="none" stroke="#7D8E67" strokeWidth="0.8">
          {/* 葉っぱ1 */}
          <path d="M10 80 Q40 50, 70 30 Q50 55, 30 70 Z" />
          <path d="M20 75 Q45 55, 60 40" />
          {/* 葉っぱ2 */}
          <path d="M5 100 Q30 80, 50 55 Q35 80, 20 95 Z" />
          <path d="M12 95 Q32 78, 45 62" />
          {/* 小さな葉 */}
          <path d="M60 15 Q70 10, 80 20 Q70 18, 62 22 Z" />
          {/* 茎 */}
          <path d="M10 110 Q30 70, 75 25" />
        </g>
        <g fill="#F2D1D1" opacity="0.3">
          {/* 小花 */}
          <circle cx="78" cy="22" r="3" />
          <circle cx="55" cy="48" r="2" />
        </g>
      </svg>

      {/* ボタニカル装飾 - 右下 */}
      <svg
        className="absolute -bottom-4 -right-4 w-40 h-40 opacity-20"
        viewBox="0 0 150 150"
        style={{ transform: 'rotate(180deg)' }}
      >
        <g fill="none" stroke="#7D8E67" strokeWidth="0.8">
          <path d="M10 80 Q40 50, 70 30 Q50 55, 30 70 Z" />
          <path d="M20 75 Q45 55, 60 40" />
          <path d="M5 100 Q30 80, 50 55 Q35 80, 20 95 Z" />
          <path d="M12 95 Q32 78, 45 62" />
          <path d="M60 15 Q70 10, 80 20 Q70 18, 62 22 Z" />
          <path d="M10 110 Q30 70, 75 25" />
        </g>
        <g fill="#F2D1D1" opacity="0.3">
          <circle cx="78" cy="22" r="3" />
          <circle cx="55" cy="48" r="2" />
        </g>
      </svg>

      {/* 散らばった小さな花びら */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 400 540">
        <circle cx="350" cy="120" r="2" fill="#F2D1D1" />
        <circle cx="60" cy="200" r="1.5" fill="#7D8E67" />
        <circle cx="320" cy="380" r="2" fill="#F2D1D1" />
        <circle cx="80" cy="450" r="1.5" fill="#7D8E67" />
        <circle cx="280" cy="60" r="1" fill="#C4A35A" />
      </svg>

      {/* コンテンツ */}
      <div className="relative h-full flex flex-col items-center justify-center px-14 py-16 text-center">
        {/* 上部小装飾 */}
        <div className="mb-6">
          <svg viewBox="0 0 60 20" className="w-16 h-5 text-wedding-sage opacity-40">
            <path
              d="M5 10 Q15 2, 30 10 Q45 18, 55 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />
            <circle cx="30" cy="10" r="2" fill="#F2D1D1" opacity="0.6" />
          </svg>
        </div>

        {/* タイトル */}
        <p className="text-xs tracking-[0.4em] text-wedding-sage/60 mb-6">
          Wedding Invitation
        </p>

        {/* 名前 */}
        <div className="mb-8">
          <p className="text-2xl font-semibold text-wedding-charcoal/80 tracking-wider mb-2">
            {data.groomLastName} {data.groomFirstName}
          </p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg viewBox="0 0 30 10" className="w-8 h-2 text-wedding-sage/30">
              <path d="M0 5 Q8 0, 15 5 Q22 10, 30 5" fill="none" stroke="currentColor" strokeWidth="0.6" />
            </svg>
            <span className="text-wedding-sage/40 text-sm">&</span>
            <svg viewBox="0 0 30 10" className="w-8 h-2 text-wedding-sage/30">
              <path d="M0 5 Q8 10, 15 5 Q22 0, 30 5" fill="none" stroke="currentColor" strokeWidth="0.6" />
            </svg>
          </div>
          <p className="text-2xl font-semibold text-wedding-charcoal/80 tracking-wider">
            {data.brideLastName} {data.brideFirstName}
          </p>
        </div>

        {/* 区切り */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-px bg-wedding-sage/20" />
          <svg viewBox="0 0 12 12" className="w-3 h-3 text-wedding-blush">
            <circle cx="6" cy="6" r="4" fill="currentColor" opacity="0.4" />
          </svg>
          <div className="w-6 h-px bg-wedding-sage/20" />
        </div>

        {/* 挨拶文 */}
        <div className="mb-8 max-w-xs">
          <p className="text-[11px] leading-[2.2] tracking-wider text-wedding-charcoal/50">
            {data.message.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < data.message.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>

        {/* 詳細 */}
        <div className="space-y-3 text-xs text-wedding-charcoal/60 tracking-wider">
          <div>
            <p className="text-sm font-medium text-wedding-charcoal/70 mb-0.5">
              {formatDate(data.date)}
            </p>
            <p className="text-[11px]">{formatTime(data.time)} {getCeremonyLabel(data.ceremonyType)}</p>
          </div>

          <div className="w-8 h-px bg-wedding-sage/15 mx-auto" />

          <div>
            <p className="font-medium text-wedding-charcoal/70 mb-0.5">
              {data.venueName}
            </p>
            <p className="text-[10px] text-wedding-charcoal/40">{data.venueAddress}</p>
          </div>

          {data.dressCode && data.dressCode !== 'なし' && (
            <p className="text-[10px]">ドレスコード：{data.dressCode}</p>
          )}

          <div className="pt-2">
            <p className="text-[10px] text-wedding-charcoal/35">
              ご出欠のお返事は {formatDate(data.rsvpDeadline)} までにお願いいたします
            </p>
          </div>
        </div>

        {/* 下部装飾 */}
        <div className="mt-6">
          <svg viewBox="0 0 60 20" className="w-16 h-5 text-wedding-sage opacity-40">
            <path
              d="M5 10 Q15 18, 30 10 Q45 2, 55 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />
            <circle cx="30" cy="10" r="2" fill="#F2D1D1" opacity="0.6" />
          </svg>
        </div>
      </div>
    </div>
  )
}
