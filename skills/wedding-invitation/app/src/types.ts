export type ThemeName = 'japanese' | 'classic' | 'modern' | 'natural'

export type CeremonyType = 'ceremony' | 'reception' | 'both'

export interface WeddingData {
  groomLastName: string
  groomFirstName: string
  brideLastName: string
  brideFirstName: string
  date: string
  time: string
  venueName: string
  venueAddress: string
  ceremonyType: CeremonyType
  dressCode: string
  rsvpDeadline: string
  message: string
  theme: ThemeName
}

export interface ChatMessage {
  id: string
  role: 'ai' | 'user'
  content: string
  timestamp: number
  options?: ChatOption[]
  inputType?: 'text' | 'date' | 'time' | 'select' | 'theme' | 'textarea'
  inputPlaceholder?: string
  fieldKey?: keyof WeddingData
}

export interface ChatOption {
  label: string
  value: string
  description?: string
}

export type AppPhase = 'chat' | 'preview'

export const EMPTY_WEDDING_DATA: WeddingData = {
  groomLastName: '',
  groomFirstName: '',
  brideLastName: '',
  brideFirstName: '',
  date: '',
  time: '',
  venueName: '',
  venueAddress: '',
  ceremonyType: 'both',
  dressCode: '',
  rsvpDeadline: '',
  message: '',
  theme: 'japanese',
}

export const THEME_INFO: Record<ThemeName, { name: string; description: string; colors: string[] }> = {
  japanese: {
    name: '和風',
    description: '伝統的な和の美しさを活かした格式高いデザイン',
    colors: ['#B5495B', '#C4A35A', '#FAF8F5'],
  },
  classic: {
    name: '洋風クラシック',
    description: 'ヨーロピアンエレガンスを感じる正統派デザイン',
    colors: ['#223A70', '#C4A35A', '#FAF8F5'],
  },
  modern: {
    name: 'モダンミニマル',
    description: '洗練されたシンプルさが際立つモダンデザイン',
    colors: ['#2D2D2D', '#FFFFFF', '#E8E8E8'],
  },
  natural: {
    name: 'ナチュラル',
    description: '自然の温もりを感じるボタニカルデザイン',
    colors: ['#7D8E67', '#F2D1D1', '#FAF8F5'],
  },
}
