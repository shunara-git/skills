import { ThemeName, THEME_INFO } from '@/types'

interface Props {
  onSelect: (theme: ThemeName) => void
}

const THEME_PREVIEWS: Record<ThemeName, { icon: string; pattern: string }> = {
  japanese: {
    icon: '🏯',
    pattern:
      'radial-gradient(circle at 20% 30%, rgba(181,73,91,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(196,163,90,0.1) 0%, transparent 50%)',
  },
  classic: {
    icon: '🏰',
    pattern:
      'radial-gradient(circle at 50% 50%, rgba(34,58,112,0.06) 0%, transparent 60%), linear-gradient(135deg, rgba(196,163,90,0.05) 0%, transparent 50%)',
  },
  modern: {
    icon: '▪',
    pattern:
      'linear-gradient(135deg, rgba(45,45,45,0.04) 25%, transparent 25%, transparent 75%, rgba(45,45,45,0.04) 75%)',
  },
  natural: {
    icon: '🌿',
    pattern:
      'radial-gradient(circle at 30% 80%, rgba(125,142,103,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(242,209,209,0.15) 0%, transparent 50%)',
  },
}

export function ThemeSelector({ onSelect }: Props) {
  const themes = Object.entries(THEME_INFO) as [ThemeName, typeof THEME_INFO[ThemeName]][]

  return (
    <div className="grid grid-cols-2 gap-3 animate-slide-up">
      {themes.map(([key, info]) => {
        const preview = THEME_PREVIEWS[key]
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="group relative overflow-hidden rounded-xl border-2 border-gray-100 bg-white p-4 text-left transition-all hover:border-wedding-gold hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold focus:ring-offset-2"
          >
            <div
              className="absolute inset-0 opacity-60 transition-opacity group-hover:opacity-100"
              style={{ backgroundImage: preview.pattern }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{preview.icon}</span>
                <span className="font-serif font-semibold text-sm text-wedding-charcoal">
                  {info.name}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {info.description}
              </p>
              <div className="flex gap-1.5 mt-3">
                {info.colors.map((color, i) => (
                  <span
                    key={i}
                    className="w-5 h-5 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
