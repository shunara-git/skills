---
name: wedding-invitation
description: AIチャットで結婚式の招待状を自動作成するWebアプリ。チャット形式で情報を入力するだけで、4種類のデザインテーマ（和風・洋風クラシック・モダンミニマル・ナチュラル）から美しい招待状を生成。画像ダウンロード対応。
---

# 結婚式招待状 AI メーカー

チャット形式のAIアシスタントが、結婚式の招待状作成をほぼ自動でサポートするWebアプリです。

## 技術スタック

- React 18 + TypeScript + Vite
- Tailwind CSS（カスタムウェディングカラー）
- html2canvas（画像エクスポート）
- Google Fonts（Noto Sans JP / Noto Serif JP / Shippori Mincho）

## セットアップ

```bash
cd app
npm install
npm run dev
```

## アーキテクチャ

### チャットフロー（11ステップ）

1. 新郎のお名前
2. 新婦のお名前
3. 挙式日
4. 開始時間
5. 挙式スタイル（挙式のみ / 披露宴のみ / 挙式＋披露宴）
6. 会場名
7. 会場住所
8. ドレスコード
9. 返信期限
10. ゲストへのメッセージ（空欄なら自動生成）
11. デザインテーマ選択

### デザインテーマ

| テーマ | スタイル | カラー |
|--------|----------|--------|
| 和風 | 伝統的な和の美・青海波・「寿」 | 紅・金・象牙 |
| 洋風クラシック | ヨーロピアンエレガンス・角装飾 | ネイビー・金・象牙 |
| モダンミニマル | ミニマルデザイン・幾何学模様 | チャコール・白・グレー |
| ナチュラル | ボタニカル・有機的な装飾 | セージ・ブラッシュ・象牙 |

### 主要コンポーネント

- `ChatInterface.tsx` - チャットUI・ステップ管理
- `ChatMessage.tsx` - メッセージバブル・タイピングインジケーター
- `ThemeSelector.tsx` - テーマ選択カード
- `InvitationPreview.tsx` - プレビュー・テーマ切替・画像ダウンロード
- `themes/` - 4つのテーマコンポーネント（SVG装飾含む）

### ファイル構造

```
app/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types.ts
    ├── lib/
    │   ├── chatFlow.ts
    │   └── utils.ts
    └── components/
        ├── ChatInterface.tsx
        ├── ChatMessage.tsx
        ├── ThemeSelector.tsx
        ├── InvitationPreview.tsx
        └── themes/
            ├── JapaneseTheme.tsx
            ├── ClassicTheme.tsx
            ├── ModernTheme.tsx
            └── NaturalTheme.tsx
```
