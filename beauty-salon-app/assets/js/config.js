/*
 * config.js — 美容室アプリの共通設定レイヤー
 *
 * サイト(index.html)と管理画面(admin.html)の両方がこのファイルを読み込む。
 * 設定は「デフォルト設定 + localStorage の上書き」をディープマージしたものが有効になる。
 * 管理画面での変更は localStorage に保存され、エクスポート/インポートで
 * 店舗ごとの設定ファイル(JSON)として持ち運べる。
 *
 * 依存ライブラリなし。file:// で開いても動く。
 */
(function (global) {
  'use strict';

  var CONFIG_KEY = 'salon.config';
  var BOOKINGS_KEY = 'salon.bookings';

  /* プレースホルダー画像(SVG data URI)を作る。実際の写真は管理画面からアップロードして差し替える。 */
  function placeholder(label, w, h, bg, fg) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<rect width="100%" height="100%" fill="' + bg + '"/>' +
      '<text x="50%" y="50%" fill="' + fg + '" font-family="sans-serif" font-size="' + Math.round(h / 12) + '" text-anchor="middle" dominant-baseline="middle">' + label + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /*
   * デフォルト設定。ここがカスタマイズ可能な項目の全一覧を兼ねる。
   * sections の配列順 = サイト上の表示順。enabled:false で非表示。
   * 管理画面はこの構造をそのまま編集する。
   */
  var DEFAULT_CONFIG = {
    meta: {
      salonName: 'Salon Sample',
      tagline: 'あなたらしさを引き出す、大人のためのヘアサロン',
      description: '丁寧なカウンセリングとくつろぎの空間で、毎日が楽しくなるスタイルをご提案します。'
    },
    theme: {
      /* 管理画面のカラーピッカーで変更する。CSS変数としてサイトに注入される。 */
      primaryColor: '#8a6d5c',
      accentColor: '#c9a86a',
      backgroundColor: '#faf7f2',
      textColor: '#3a3330',
      /* 'serif' | 'sans' — 見出しの書体の雰囲気 */
      fontStyle: 'serif'
    },
    /* 配置(表示順・表示/非表示)はこの配列で一元管理する */
    sections: [
      { id: 'hero',    enabled: true, title: '' },
      { id: 'concept', enabled: true, title: 'コンセプト' },
      { id: 'menu',    enabled: true, title: 'メニュー' },
      { id: 'staff',   enabled: true, title: 'スタッフ' },
      { id: 'gallery', enabled: true, title: 'ギャラリー' },
      { id: 'news',    enabled: true, title: 'お知らせ' },
      { id: 'access',  enabled: true, title: 'アクセス・営業時間' },
      { id: 'booking', enabled: true, title: 'ご予約' }
    ],
    hero: {
      image: placeholder('Hero Image', 1600, 900, '#8a6d5c', '#faf7f2'),
      heading: 'Salon Sample',
      subheading: 'あなたらしさを引き出す、大人のためのヘアサロン',
      ctaText: 'ご予約はこちら'
    },
    concept: {
      body: '当店は、お客様一人ひとりの髪質やライフスタイルに寄り添うプライベートサロンです。\n初めての方にも安心していただけるよう、施術前のカウンセリングを大切にしています。',
      image: placeholder('Concept', 800, 600, '#c9a86a', '#3a3330')
    },
    menu: {
      note: '※ 料金はすべて税込表示です。髪の長さ・状態により変動する場合があります。',
      categories: [
        {
          name: 'カット',
          items: [
            { name: 'カット', price: 4950, duration: 60, description: 'シャンプー・ブロー込み' },
            { name: '前髪カット', price: 1100, duration: 15, description: '' }
          ]
        },
        {
          name: 'カラー',
          items: [
            { name: 'フルカラー', price: 7150, duration: 90, description: '' },
            { name: 'リタッチカラー', price: 5500, duration: 60, description: '根元3cmまで' }
          ]
        },
        {
          name: 'パーマ・トリートメント',
          items: [
            { name: 'パーマ(カット込み)', price: 11000, duration: 120, description: '' },
            { name: '髪質改善トリートメント', price: 8800, duration: 75, description: '' }
          ]
        }
      ]
    },
    staff: [
      {
        name: '山田 花子',
        role: '代表 / スタイリスト',
        photo: placeholder('Staff 1', 600, 600, '#b9a493', '#3a3330'),
        bio: 'スタイリスト歴15年。骨格に合わせたショートカットが得意です。'
      },
      {
        name: '佐藤 太郎',
        role: 'スタイリスト',
        photo: placeholder('Staff 2', 600, 600, '#a89383', '#3a3330'),
        bio: 'ダメージレスなカラーの提案が得意。お気軽にご相談ください。'
      }
    ],
    gallery: [
      { photo: placeholder('Style 1', 600, 600, '#d8c7b0', '#3a3330'), caption: 'ナチュラルボブ' },
      { photo: placeholder('Style 2', 600, 600, '#c4b39e', '#3a3330'), caption: '大人ハイライト' },
      { photo: placeholder('Style 3', 600, 600, '#b0a08d', '#3a3330'), caption: '柔らかレイヤー' }
    ],
    news: [
      { date: '2026-07-01', title: '夏季限定クーポンのお知らせ', body: '7月中はカラー+トリートメントが10%OFFです。' }
    ],
    access: {
      address: '東京都渋谷区サンプル町1-2-3 サンプルビル2F',
      phone: '03-0000-0000',
      email: 'info@example.com',
      businessHours: [
        { label: '平日', time: '10:00 - 20:00' },
        { label: '土日祝', time: '9:00 - 19:00' }
      ],
      closedDays: '毎週火曜・第2水曜',
      /* Googleマップの「共有 > 地図を埋め込む」のURL。空なら地図非表示。 */
      mapEmbedUrl: '',
      note: '最寄駅から徒歩5分。近隣にコインパーキングあり。'
    },
    booking: {
      /* フォーム予約(このアプリ内で受付、管理画面で一覧確認) */
      formEnabled: true,
      notice: 'ご希望に添えない場合は、折り返しご連絡いたします。前日・当日のキャンセルはお電話にてお願いします。',
      /* 外部予約への導線(空なら非表示) */
      lineUrl: '',
      hotpepperUrl: '',
      phoneBooking: true
    },
    sns: {
      instagram: '',
      x: '',
      line: ''
    }
  };

  /* ---- utilities ---- */

  function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }

  /* 保存済み設定をデフォルトに重ねる。配列は保存側で丸ごと置き換え(並び替え・削除を保持するため)。 */
  function deepMerge(base, override) {
    if (!isPlainObject(base) || !isPlainObject(override)) {
      return override === undefined ? base : override;
    }
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(override).forEach(function (k) {
      out[k] = isPlainObject(base[k]) && isPlainObject(override[k])
        ? deepMerge(base[k], override[k])
        : override[k];
    });
    return out;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /* ---- 公開API ---- */

  var SalonConfig = {
    defaults: function () {
      return clone(DEFAULT_CONFIG);
    },

    /* 有効な設定(デフォルト + localStorage)を返す */
    load: function () {
      var saved = null;
      try {
        saved = JSON.parse(localStorage.getItem(CONFIG_KEY));
      } catch (e) { /* 壊れた保存データは無視してデフォルトに戻す */ }
      if (!isPlainObject(saved)) return clone(DEFAULT_CONFIG);
      return deepMerge(clone(DEFAULT_CONFIG), saved);
    },

    save: function (config) {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    },

    reset: function () {
      localStorage.removeItem(CONFIG_KEY);
    },

    /* 設定JSON文字列を返す(店舗ごとの設定ファイルとして配布する用) */
    exportJson: function () {
      return JSON.stringify(this.load(), null, 2);
    },

    /* JSON文字列を検証して保存。成功時はマージ済み設定を返し、失敗時は例外。 */
    importJson: function (jsonText) {
      var parsed = JSON.parse(jsonText);
      if (!isPlainObject(parsed)) throw new Error('設定ファイルの形式が正しくありません');
      var merged = deepMerge(clone(DEFAULT_CONFIG), parsed);
      this.save(merged);
      return merged;
    }
  };

  /*
   * 予約データ(プロトタイプではlocalStorageに保存し、管理画面で一覧・対応状況を管理する。
   * 本番導入時はここをAPI呼び出しに差し替える想定)。
   */
  var SalonBookings = {
    list: function () {
      try {
        var v = JSON.parse(localStorage.getItem(BOOKINGS_KEY));
        return Array.isArray(v) ? v : [];
      } catch (e) {
        return [];
      }
    },

    /* booking: { name, phone, menu, staff, date, time, message } */
    add: function (booking) {
      var all = this.list();
      var record = clone(booking);
      record.id = 'bk-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
      record.createdAt = new Date().toISOString();
      record.status = 'pending'; /* pending | confirmed | cancelled */
      all.unshift(record);
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
      return record;
    },

    updateStatus: function (id, status) {
      var all = this.list().map(function (b) {
        if (b.id === id) b.status = status;
        return b;
      });
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
    },

    remove: function (id) {
      var all = this.list().filter(function (b) { return b.id !== id; });
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
    }
  };

  global.SalonConfig = SalonConfig;
  global.SalonBookings = SalonBookings;
  global.SalonPlaceholder = placeholder;
})(window);
