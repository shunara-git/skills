import { ChatMessage, WeddingData } from '@/types'
import { generateId } from '@/lib/utils'

interface StepDef {
  aiMessage: string | ((data: Partial<WeddingData>) => string)
  inputType: ChatMessage['inputType']
  inputPlaceholder?: string
  fieldKey?: keyof WeddingData
  options?: ChatMessage['options']
  processInput?: (input: string, data: Partial<WeddingData>) => Partial<WeddingData>
}

const STEPS: StepDef[] = [
  {
    aiMessage:
      'はじめまして！結婚式の招待状を一緒に作りましょう。\nまずは新郎のお名前を教えてください（例：山田 太郎）',
    inputType: 'text',
    inputPlaceholder: '姓 名',
    processInput: (input, data) => {
      const parts = input.trim().split(/\s+/)
      return {
        ...data,
        groomLastName: parts[0] || '',
        groomFirstName: parts.slice(1).join(' ') || '',
      }
    },
  },
  {
    aiMessage: (data) =>
      `${data.groomLastName}${data.groomFirstName}さんですね。\n次に新婦のお名前を教えてください（例：鈴木 花子）`,
    inputType: 'text',
    inputPlaceholder: '姓 名',
    processInput: (input, data) => {
      const parts = input.trim().split(/\s+/)
      return {
        ...data,
        brideLastName: parts[0] || '',
        brideFirstName: parts.slice(1).join(' ') || '',
      }
    },
  },
  {
    aiMessage: (data) =>
      `${data.groomLastName}${data.groomFirstName}さんと${data.brideLastName}${data.brideFirstName}さん、おめでとうございます！\n\n挙式の日程を選択してください`,
    inputType: 'date',
    fieldKey: 'date',
  },
  {
    aiMessage: '開始時間を教えてください',
    inputType: 'time',
    fieldKey: 'time',
  },
  {
    aiMessage: '挙式のスタイルを選んでください',
    inputType: 'select',
    options: [
      { label: '挙式＋披露宴', value: 'both', description: '挙式と披露宴の両方を行います' },
      { label: '挙式のみ', value: 'ceremony', description: '挙式のみを行います' },
      { label: '披露宴のみ', value: 'reception', description: '披露宴・パーティーのみを行います' },
    ],
    fieldKey: 'ceremonyType',
  },
  {
    aiMessage: '会場のお名前を教えてください',
    inputType: 'text',
    inputPlaceholder: '例：ホテル椿山荘東京',
    fieldKey: 'venueName',
  },
  {
    aiMessage: '会場の住所を教えてください',
    inputType: 'text',
    inputPlaceholder: '例：東京都文京区関口2-10-8',
    fieldKey: 'venueAddress',
  },
  {
    aiMessage: 'ドレスコードはありますか？（なければ「なし」と入力）',
    inputType: 'text',
    inputPlaceholder: '例：セミフォーマル',
    fieldKey: 'dressCode',
  },
  {
    aiMessage: '返信期限を設定してください',
    inputType: 'date',
    fieldKey: 'rsvpDeadline',
  },
  {
    aiMessage:
      'ゲストへのメッセージをお書きください。\n（空欄の場合はこちらで用意します）',
    inputType: 'textarea',
    inputPlaceholder: '',
    fieldKey: 'message',
    processInput: (input, data) => {
      const message =
        input.trim() ||
        `謹啓 ${getSeasonGreeting()}の候 皆様にはますますご清祥のこととお慶び申し上げます\nこのたび 私たちは結婚式を挙げることになりました\nつきましては 日頃お世話になっている皆様に\nお集まりいただき ささやかな小宴を催したく存じます\nご多用中 誠に恐縮ではございますが\nぜひご出席賜りますよう お願い申し上げます\n謹白`
      return { ...data, message }
    },
  },
  {
    aiMessage: (data) =>
      `素敵な情報をありがとうございます！\n\n${data.groomLastName}家・${data.brideLastName}家のおふたりにぴったりの招待状デザインを選びましょう。\n\nお好みのテーマを選んでください`,
    inputType: 'theme',
    fieldKey: 'theme',
  },
]

function getSeasonGreeting(): string {
  const month = new Date().getMonth() + 1
  const greetings: Record<number, string> = {
    1: '初春',
    2: '立春',
    3: '早春',
    4: '陽春',
    5: '新緑',
    6: '初夏',
    7: '盛夏',
    8: '残暑',
    9: '初秋',
    10: '秋冷',
    11: '晩秋',
    12: '初冬',
  }
  return greetings[month] || '時下'
}

export function getStep(index: number): StepDef | undefined {
  return STEPS[index]
}

export function getTotalSteps(): number {
  return STEPS.length
}

export function buildAiMessage(
  stepIndex: number,
  data: Partial<WeddingData>
): ChatMessage | null {
  const step = STEPS[stepIndex]
  if (!step) return null

  const content =
    typeof step.aiMessage === 'function'
      ? step.aiMessage(data)
      : step.aiMessage

  return {
    id: generateId(),
    role: 'ai',
    content,
    timestamp: Date.now(),
    inputType: step.inputType,
    inputPlaceholder: step.inputPlaceholder,
    options: step.options,
    fieldKey: step.fieldKey,
  }
}

export function processUserInput(
  stepIndex: number,
  input: string,
  currentData: Partial<WeddingData>
): Partial<WeddingData> {
  const step = STEPS[stepIndex]
  if (!step) return currentData

  if (step.processInput) {
    return step.processInput(input, currentData)
  }

  if (step.fieldKey) {
    return { ...currentData, [step.fieldKey]: input }
  }

  return currentData
}
