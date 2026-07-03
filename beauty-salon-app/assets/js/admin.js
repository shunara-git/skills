/*
 * admin.js — 美容室アプリ 管理画面のロジック
 *
 * 起動時に SalonConfig.load() で作業用 state を取得し、フォーム変更は即座に state へ反映する。
 * 「保存」ボタンで SalonConfig.save(state) を実行。未保存の変更があるときは保存ボタンを強調し、
 * beforeunload で警告する。
 *
 * 設計方針:
 *  - XSS対策: config/予約データ由来の文字列は必ず textContent 経由で DOM に入れる(innerHTML連結禁止)。
 *  - 再描画は「そのタブのコンテナだけ」。テキスト入力は input イベントで state 更新のみ行い再描画しない
 *    (フォーカスが飛ばないように)。追加/削除/並び替えのときだけ再描画する。
 *
 * 依存なし・素のJSのみ。file:// で開いても動作する。
 */
(function () {
  'use strict';

  /* ========== 状態 ========== */
  var state = SalonConfig.load(); // 作業用の設定(保存するまで localStorage には反映されない)
  var dirty = false;              // 未保存の変更があるか
  var activeTab = 'basic';        // 現在のタブID

  /* プレースホルダーの生成条件(「戻す」ボタン用)。config.js のデフォルトに合わせる。 */
  var PLACEHOLDERS = {
    hero: function () { return SalonPlaceholder('Hero Image', 1600, 900, '#8a6d5c', '#faf7f2'); },
    concept: function () { return SalonPlaceholder('Concept', 800, 600, '#c9a86a', '#3a3330'); },
    staff: function () { return SalonPlaceholder('Staff', 600, 600, '#b9a493', '#3a3330'); },
    gallery: function () { return SalonPlaceholder('Style', 600, 600, '#d8c7b0', '#3a3330'); }
  };

  /* 画像リサイズの長辺上限(px)。localStorage 容量対策。 */
  var MAX_EDGE = { hero: 1600, concept: 1600, staff: 600, gallery: 800 };

  /* ========== DOMヘルパー(安全に要素を組み立てる) ========== */

  /*
   * h(tag, props, ...children)
   * props: { class, text, value, checked, on<Event>: fn, その他は属性 }
   * children: 文字列(textNode化) / 数値 / ノード / 配列
   * text/textContent 経由なので data 由来の文字列も安全。
   */
  function h(tag, props) {
    var node = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null) return;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'value') node.value = v;
      else if (k === 'checked') node.checked = !!v;
      else if (k === 'disabled') { if (v) node.disabled = true; }
      else if (k.length > 2 && k.slice(0, 2) === 'on' && typeof v === 'function') {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else {
        node.setAttribute(k, v);
      }
    });
    for (var i = 2; i < arguments.length; i++) append(node, arguments[i]);
    return node;
  }

  function append(node, child) {
    if (child == null || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(node, c); }); return; }
    if (typeof child === 'string' || typeof child === 'number') {
      node.appendChild(document.createTextNode(String(child)));
      return;
    }
    node.appendChild(child);
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function byId(id) { return document.getElementById(id); }

  /* ========== 入力フィールドのビルダー ========== */

  /* ラベル + 入力要素 をまとめた field を返す */
  function field(labelText, inputNode, hint) {
    return h('div', { class: 'field' },
      h('label', { class: 'field-label', text: labelText }),
      inputNode,
      hint ? h('div', { class: 'field-hint', text: hint }) : null
    );
  }

  /*
   * テキスト入力を作り、obj[key] へ input イベントで反映する(再描画しない)。
   * opts: { textarea, type, placeholder, number, rows }
   */
  function textInput(obj, key, opts) {
    opts = opts || {};
    var isArea = !!opts.textarea;
    var cur = obj[key];
    var input = h(isArea ? 'textarea' : 'input', {
      class: 'inp',
      value: cur == null ? '' : String(cur),
      placeholder: opts.placeholder || ''
    });
    if (!isArea) input.type = opts.type || 'text';
    if (isArea && opts.rows) input.rows = opts.rows;
    if (opts.number) { input.type = 'number'; input.min = '0'; input.step = opts.step || '1'; }
    input.addEventListener('input', function () {
      if (opts.number) {
        obj[key] = input.value === '' ? 0 : Number(input.value);
      } else {
        obj[key] = input.value;
      }
      markDirty();
    });
    return input;
  }

  /* ========== 変更フラグ・保存 ========== */

  function markDirty() {
    if (!dirty) {
      dirty = true;
      updateSaveButton();
    }
  }

  function updateSaveButton() {
    var btn = byId('saveBtn');
    var note = byId('dirtyNote');
    if (dirty) {
      btn.classList.add('is-dirty');
      note.hidden = false;
    } else {
      btn.classList.remove('is-dirty');
      note.hidden = true;
    }
  }

  function save() {
    try {
      SalonConfig.save(state);
      dirty = false;
      updateSaveButton();
      toast('保存しました', 'success');
    } catch (e) {
      if (isQuotaError(e)) {
        toast('保存容量を超えました。画像サイズが大きすぎます。不要な画像を差し替えてください。', 'error');
      } else {
        toast('保存に失敗しました: ' + (e && e.message ? e.message : e), 'error');
      }
    }
  }

  function isQuotaError(e) {
    return e && (
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      e.code === 22 || e.code === 1014 ||
      /quota/i.test(e.message || '')
    );
  }

  /* ========== トースト ========== */

  function toast(message, type) {
    var area = byId('toastArea');
    var t = h('div', { class: 'toast toast-' + (type || 'info'), text: message });
    area.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .3s';
      t.style.opacity = '0';
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, 3200);
  }

  /* ========== 画像アップロード(canvasで縮小 → JPEG dataURL) ========== */

  /*
   * file を長辺 maxEdge 以下・JPEG品質0.85 に縮小して dataURL を cb に渡す。
   * 透過PNG等でJPEG化に失敗した場合は元の dataURL にフォールバック。
   */
  function processImage(file, maxEdge, cb) {
    if (!file) return;
    if (!/^image\//.test(file.type)) { toast('画像ファイルを選択してください', 'error'); return; }
    var reader = new FileReader();
    reader.onerror = function () { toast('ファイルの読み込みに失敗しました', 'error'); };
    reader.onload = function () {
      var original = reader.result;
      var img = new Image();
      img.onerror = function () { toast('画像を読み込めませんでした', 'error'); };
      img.onload = function () {
        var w = img.naturalWidth || img.width;
        var h0 = img.naturalHeight || img.height;
        var scale = Math.min(1, maxEdge / Math.max(w, h0));
        var nw = Math.max(1, Math.round(w * scale));
        var nh = Math.max(1, Math.round(h0 * scale));
        var canvas = document.createElement('canvas');
        canvas.width = nw;
        canvas.height = nh;
        var ctx = canvas.getContext('2d');
        // JPEGは透過を扱えないので白背景で塗ってから描画
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, nw, nh);
        ctx.drawImage(img, 0, 0, nw, nh);
        var dataUrl;
        try {
          dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        } catch (err) {
          dataUrl = original; // 変換不可(まれ)なら原本を使う
        }
        cb(dataUrl);
      };
      img.src = original;
    };
    reader.readAsDataURL(file);
  }

  /* 画像アップロード用のブロック(サムネイル + file input + プレースホルダーに戻す) */
  function imageUploader(obj, key, maxEdge, placeholderFn, opts) {
    opts = opts || {};
    var wrap = h('div', { class: 'image-block' });
    var thumb = h('img', { class: 'thumb' + (opts.square ? ' square' : ''), alt: 'プレビュー' });
    thumb.src = obj[key] || '';
    var fileInput = h('input', { type: 'file', accept: 'image/*' });
    fileInput.addEventListener('change', function () {
      var f = fileInput.files && fileInput.files[0];
      if (!f) return;
      processImage(f, maxEdge, function (dataUrl) {
        obj[key] = dataUrl;
        thumb.src = dataUrl;
        fileInput.value = '';
        markDirty();
        if (opts.onChange) opts.onChange();
        toast('画像を差し替えました(保存を押すと確定します)', 'info');
      });
    });
    var revert = h('button', { class: 'btn btn-sm', type: 'button', text: 'プレースホルダーに戻す' });
    revert.addEventListener('click', function () {
      obj[key] = placeholderFn();
      thumb.src = obj[key];
      markDirty();
      if (opts.onChange) opts.onChange();
    });
    append(wrap, [
      thumb,
      h('div', { class: 'image-controls' }, fileInput, revert)
    ]);
    return wrap;
  }

  /* ========== タブ定義 ========== */

  var TABS = [
    { id: 'basic',   label: '基本情報',           ico: '📝', render: renderBasic },
    { id: 'design',  label: 'デザイン',           ico: '🎨', render: renderDesign },
    { id: 'layout',  label: '配置(セクション)',   ico: '📐', render: renderLayout },
    { id: 'photos',  label: '写真',               ico: '🖼', render: renderPhotos },
    { id: 'menu',    label: 'メニュー',           ico: '📋', render: renderMenu },
    { id: 'staff',   label: 'スタッフ',           ico: '👥', render: renderStaff },
    { id: 'news',    label: 'お知らせ',           ico: '📣', render: renderNews },
    { id: 'access',  label: 'アクセス・営業時間', ico: '📍', render: renderAccess },
    { id: 'booking', label: '予約設定',           ico: '⚙',  render: renderBooking },
    { id: 'reserv',  label: '予約一覧',           ico: '📅', render: renderReservations },
    { id: 'io',      label: '書き出し・読み込み', ico: '💾', render: renderIO }
  ];

  function tabById(id) {
    for (var i = 0; i < TABS.length; i++) if (TABS[i].id === id) return TABS[i];
    return TABS[0];
  }

  /* ========== 各タブのレンダリング ========== */

  /* 1. 基本情報 */
  function renderBasic(root) {
    var m = state.meta;
    append(root, h('div', { class: 'panel' },
      h('h2', { text: 'サロンの基本情報' }),
      h('p', { class: 'panel-desc', text: 'サイト全体で使われる名前と紹介文です。' }),
      field('サロン名', textInput(m, 'salonName', { placeholder: '例:Salon Sample' })),
      field('キャッチコピー(tagline)', textInput(m, 'tagline', { placeholder: 'あなたらしさを引き出す…' })),
      field('紹介文(description)', textInput(m, 'description', { textarea: true, rows: 3 }))
    ));
  }

  /* 2. デザイン */
  function renderDesign(root) {
    var t = state.theme;

    // ミニプレビュー(色見本 + サンプル見出し)。色変更時に直接更新する。
    var preview = h('div', { class: 'theme-preview' });
    function paintPreview() {
      clear(preview);
      var head = h('div', { class: 'theme-preview-head' },
        h('h3', { text: state.meta.salonName || 'Salon Sample' }),
        h('p', { text: state.meta.tagline || 'サンプルのキャッチコピー' })
      );
      head.style.background = t.backgroundColor;
      head.style.color = t.textColor;
      head.querySelector('h3').style.color = t.primaryColor;
      head.querySelector('h3').style.fontFamily = t.fontStyle === 'serif'
        ? 'Georgia, "Hiragino Mincho ProN", serif'
        : 'system-ui, sans-serif';
      var accentBar = h('div');
      accentBar.style.height = '6px';
      accentBar.style.background = t.accentColor;
      var swatches = h('div', { class: 'swatches' });
      [t.primaryColor, t.accentColor, t.backgroundColor, t.textColor].forEach(function (c) {
        var s = h('div', { class: 'swatch' });
        s.style.background = c;
        swatches.appendChild(s);
      });
      var labels = h('div', { class: 'swatch-labels' },
        h('span', { text: 'メイン' }), h('span', { text: 'アクセント' }),
        h('span', { text: '背景' }), h('span', { text: '文字' })
      );
      append(preview, [head, accentBar, swatches, labels]);
    }

    function colorField(labelText, key) {
      var input = h('input', { type: 'color', value: t[key] });
      var code = h('span', { class: 'code', text: t[key] });
      input.addEventListener('input', function () {
        t[key] = input.value;
        code.textContent = input.value;
        markDirty();
        paintPreview();
      });
      return h('div', { class: 'field' },
        h('label', { class: 'field-label', text: labelText }),
        h('div', { class: 'inline' }, input, code)
      );
    }

    var colorPanel = h('div', { class: 'panel' },
      h('h2', { text: 'テーマカラー' }),
      h('p', { class: 'panel-desc', text: 'サイトの配色です。CSS変数としてサイトに反映されます。' }),
      h('div', { class: 'color-grid' },
        colorField('メインカラー(primary)', 'primaryColor'),
        colorField('アクセントカラー(accent)', 'accentColor'),
        colorField('背景色(background)', 'backgroundColor'),
        colorField('文字色(text)', 'textColor')
      )
    );

    // フォントスタイル
    var fontPanel = h('div', { class: 'panel' },
      h('h2', { text: '見出しの書体' })
    );
    var group = h('div', { class: 'radio-group' });
    [['serif', '明朝系(serif)'], ['sans', 'ゴシック系(sans)']].forEach(function (pair) {
      var radio = h('input', { type: 'radio', name: 'fontStyle', value: pair[0], checked: t.fontStyle === pair[0] });
      radio.addEventListener('change', function () {
        if (radio.checked) { t.fontStyle = pair[0]; markDirty(); paintPreview(); }
      });
      group.appendChild(h('label', {}, radio, document.createTextNode(pair[1])));
    });
    append(fontPanel, group);

    var previewPanel = h('div', { class: 'panel' },
      h('h2', { text: 'プレビュー' }),
      h('p', { class: 'panel-desc', text: '選択中テーマの見え方の目安です。' }),
      preview
    );

    paintPreview();
    append(root, [colorPanel, fontPanel, previewPanel]);
  }

  /* 3. 配置(セクション並び替え) */
  function renderLayout(root) {
    var panel = h('div', { class: 'panel' },
      h('h2', { text: 'セクションの並び順・表示' }),
      h('p', { class: 'section-hint', text: 'サイトの表示順はこの並び順です。チェックを外すとそのセクションは非表示になります。' })
    );
    var list = h('div');

    function redraw() {
      clear(list);
      state.sections.forEach(function (sec, idx) {
        var row = h('div', { class: 'section-row' + (sec.enabled ? '' : ' disabled') });

        var order = h('div', { class: 'sec-order' });
        var up = h('button', { class: 'btn btn-icon', type: 'button', text: '↑', title: '上へ' });
        var down = h('button', { class: 'btn btn-icon', type: 'button', text: '↓', title: '下へ' });
        if (idx === 0) up.disabled = true;
        if (idx === state.sections.length - 1) down.disabled = true;
        up.addEventListener('click', function () { moveArr(state.sections, idx, -1); markDirty(); redraw(); });
        down.addEventListener('click', function () { moveArr(state.sections, idx, 1); markDirty(); redraw(); });
        append(order, [up, down]);

        var main = h('div', { class: 'sec-main' });
        var isHero = sec.id === 'hero';
        // hero は title 編集不可
        if (isHero) {
          main.appendChild(h('div', { class: 'list-item-title', text: 'ヒーロー(トップ画像)' }));
        } else {
          main.appendChild(textInput(sec, 'title', { placeholder: 'セクション見出し' }));
        }
        main.appendChild(h('div', { class: 'sec-id', text: 'id: ' + sec.id }));

        var chk = h('input', { type: 'checkbox', checked: sec.enabled });
        chk.addEventListener('change', function () {
          sec.enabled = chk.checked;
          row.className = 'section-row' + (sec.enabled ? '' : ' disabled');
          markDirty();
        });
        var toggle = h('label', { class: 'checkbox-field' }, chk, document.createTextNode('表示'));

        append(row, [order, main, toggle]);
        list.appendChild(row);
      });
    }
    redraw();
    append(panel, list);
    append(root, panel);
  }

  /* 4. 写真(hero / concept)+ ギャラリー */
  function renderPhotos(root) {
    // hero
    append(root, h('div', { class: 'panel' },
      h('h2', { text: 'ヒーロー画像(トップ)' }),
      h('p', { class: 'panel-desc', text: 'アップロード時は長辺1600px以下・JPEG品質85%に自動縮小します。' }),
      imageUploader(state.hero, 'image', MAX_EDGE.hero, PLACEHOLDERS.hero)
    ));
    // concept
    append(root, h('div', { class: 'panel' },
      h('h2', { text: 'コンセプト画像' }),
      h('p', { class: 'panel-desc', text: '長辺1600px以下・JPEG品質85%に自動縮小します。' }),
      imageUploader(state.concept, 'image', MAX_EDGE.concept, PLACEHOLDERS.concept)
    ));

    // ギャラリー
    var galPanel = h('div', { class: 'panel' },
      h('h2', { text: 'ギャラリー' }),
      h('p', { class: 'panel-desc', text: 'スタイル写真の一覧です。長辺800px以下に縮小します。並び替え・追加・削除ができます。' })
    );
    var galList = h('div');

    function redrawGallery() {
      clear(galList);
      if (!state.gallery.length) {
        galList.appendChild(emptyState('写真がありません。「写真を追加」で登録してください。'));
      }
      state.gallery.forEach(function (g, idx) {
        var item = h('div', { class: 'list-item' });
        var head = h('div', { class: 'list-item-head' },
          h('div', { class: 'list-item-title', text: '写真 ' + (idx + 1) }),
          h('div', { class: 'list-item-actions' },
            orderButtons(state.gallery, idx, redrawGallery),
            removeButton(function () { state.gallery.splice(idx, 1); markDirty(); redrawGallery(); })
          )
        );
        var uploader = imageUploader(g, 'photo', MAX_EDGE.gallery, PLACEHOLDERS.gallery, { square: true });
        var caption = field('キャプション', textInput(g, 'caption', { placeholder: '例:ナチュラルボブ' }));
        append(item, [head, uploader, caption]);
        galList.appendChild(item);
      });
    }
    redrawGallery();
    append(galPanel, galList);
    append(galPanel, h('button', {
      class: 'btn add-row', type: 'button', text: '＋ 写真を追加',
      onClick: function () {
        state.gallery.push({ photo: PLACEHOLDERS.gallery(), caption: '' });
        markDirty();
        redrawGallery();
      }
    }));
    append(root, galPanel);
  }

  /* 5. メニュー */
  function renderMenu(root) {
    var panel = h('div', { class: 'panel' },
      h('h2', { text: 'メニュー' }),
      h('p', { class: 'panel-desc', text: 'カテゴリごとにメニュー項目を管理します。' })
    );
    var catList = h('div');

    function redraw() {
      clear(catList);
      if (!state.menu.categories.length) {
        catList.appendChild(emptyState('カテゴリがありません。「カテゴリを追加」で作成してください。'));
      }
      state.menu.categories.forEach(function (cat, ci) {
        var catBox = h('div', { class: 'list-item' });
        var head = h('div', { class: 'list-item-head' },
          textInput(cat, 'name', { placeholder: 'カテゴリ名(例:カット)' }),
          h('div', { class: 'list-item-actions' },
            orderButtons(state.menu.categories, ci, redraw),
            removeButton(function () {
              if (confirm('カテゴリ「' + (cat.name || '') + '」を削除しますか?')) {
                state.menu.categories.splice(ci, 1); markDirty(); redraw();
              }
            }, 'カテゴリ削除')
          )
        );
        append(catBox, head);

        // 項目
        (cat.items || (cat.items = [])).forEach(function (it, ii) {
          var itemBox = h('div', { class: 'list-item' });
          var ihead = h('div', { class: 'list-item-head' },
            h('div', { class: 'list-item-title', text: '項目 ' + (ii + 1) }),
            h('div', { class: 'list-item-actions' },
              orderButtons(cat.items, ii, redraw),
              removeButton(function () { cat.items.splice(ii, 1); markDirty(); redraw(); })
            )
          );
          var rowFields = h('div', { class: 'row' },
            field('メニュー名', textInput(it, 'name', { placeholder: 'カット' })),
            field('料金(円)', textInput(it, 'price', { number: true })),
            field('所要(分)', textInput(it, 'duration', { number: true }))
          );
          var desc = field('説明', textInput(it, 'description', { placeholder: 'シャンプー・ブロー込み 等' }));
          append(itemBox, [ihead, rowFields, desc]);
          catBox.appendChild(itemBox);
        });

        catBox.appendChild(h('button', {
          class: 'btn btn-sm add-row', type: 'button', text: '＋ 項目を追加',
          onClick: function () {
            cat.items.push({ name: '', price: 0, duration: 0, description: '' });
            markDirty(); redraw();
          }
        }));
        catList.appendChild(catBox);
      });
    }
    redraw();
    append(panel, catList);
    append(panel, h('button', {
      class: 'btn add-row', type: 'button', text: '＋ カテゴリを追加',
      onClick: function () {
        state.menu.categories.push({ name: '', items: [] });
        markDirty(); redraw();
      }
    }));

    // 注記
    var notePanel = h('div', { class: 'panel' },
      h('h2', { text: '注記(menu.note)' }),
      field('メニュー下部の注意書き', textInput(state.menu, 'note', { textarea: true, rows: 2 }))
    );

    append(root, [panel, notePanel]);
  }

  /* 6. スタッフ */
  function renderStaff(root) {
    var panel = h('div', { class: 'panel' },
      h('h2', { text: 'スタッフ' }),
      h('p', { class: 'panel-desc', text: '写真は長辺600px以下に縮小します。並び替え・追加・削除ができます。' })
    );
    var list = h('div');

    function redraw() {
      clear(list);
      if (!state.staff.length) {
        list.appendChild(emptyState('スタッフが登録されていません。'));
      }
      state.staff.forEach(function (s, idx) {
        var item = h('div', { class: 'list-item' });
        var head = h('div', { class: 'list-item-head' },
          h('div', { class: 'list-item-title', text: (s.name || 'スタッフ') }),
          h('div', { class: 'list-item-actions' },
            orderButtons(state.staff, idx, redraw),
            removeButton(function () {
              if (confirm('このスタッフを削除しますか?')) { state.staff.splice(idx, 1); markDirty(); redraw(); }
            })
          )
        );
        var uploader = imageUploader(s, 'photo', MAX_EDGE.staff, PLACEHOLDERS.staff, { square: true });
        var fields = h('div', {},
          field('名前', textInput(s, 'name', { placeholder: '山田 花子' })),
          field('肩書き(role)', textInput(s, 'role', { placeholder: '代表 / スタイリスト' })),
          field('紹介文(bio)', textInput(s, 'bio', { textarea: true, rows: 2 }))
        );
        append(item, [head, uploader, fields]);
        list.appendChild(item);
      });
    }
    redraw();
    append(panel, list);
    append(panel, h('button', {
      class: 'btn add-row', type: 'button', text: '＋ スタッフを追加',
      onClick: function () {
        state.staff.push({ name: '', role: '', photo: PLACEHOLDERS.staff(), bio: '' });
        markDirty(); redraw();
      }
    }));
    append(root, panel);
  }

  /* 7. お知らせ */
  function renderNews(root) {
    var panel = h('div', { class: 'panel' },
      h('h2', { text: 'お知らせ' }),
      h('p', { class: 'panel-desc', text: '新しい順に表示されます。' })
    );
    var list = h('div');

    function redraw() {
      clear(list);
      if (!state.news.length) {
        list.appendChild(emptyState('お知らせがありません。'));
      }
      state.news.forEach(function (n, idx) {
        var item = h('div', { class: 'list-item' });
        var head = h('div', { class: 'list-item-head' },
          h('div', { class: 'list-item-title', text: 'お知らせ ' + (idx + 1) }),
          h('div', { class: 'list-item-actions' },
            orderButtons(state.news, idx, redraw),
            removeButton(function () { state.news.splice(idx, 1); markDirty(); redraw(); })
          )
        );
        var fields = h('div', {},
          h('div', { class: 'row' },
            field('日付', textInput(n, 'date', { type: 'date' })),
            field('タイトル', textInput(n, 'title', { placeholder: '夏季限定クーポン' }))
          ),
          field('本文', textInput(n, 'body', { textarea: true, rows: 2 }))
        );
        append(item, [head, fields]);
        list.appendChild(item);
      });
    }
    redraw();
    append(panel, list);
    append(panel, h('button', {
      class: 'btn add-row', type: 'button', text: '＋ お知らせを追加',
      onClick: function () {
        state.news.unshift({ date: today(), title: '', body: '' });
        markDirty(); redraw();
      }
    }));
    append(root, panel);
  }

  /* 8. アクセス・営業時間 */
  function renderAccess(root) {
    var a = state.access;
    var info = h('div', { class: 'panel' },
      h('h2', { text: '店舗情報' }),
      field('住所', textInput(a, 'address')),
      h('div', { class: 'row' },
        field('電話番号', textInput(a, 'phone', { placeholder: '03-0000-0000' })),
        field('メールアドレス', textInput(a, 'email', { placeholder: 'info@example.com' }))
      ),
      field('定休日', textInput(a, 'closedDays', { placeholder: '毎週火曜・第2水曜' })),
      field('GoogleマップURL(埋め込み)', textInput(a, 'mapEmbedUrl', { placeholder: '空欄なら地図非表示' }),
        'Googleマップの「共有 > 地図を埋め込む」で得られるURL。'),
      field('補足(note)', textInput(a, 'note', { textarea: true, rows: 2 }))
    );

    // 営業時間
    var hoursPanel = h('div', { class: 'panel' },
      h('h2', { text: '営業時間' })
    );
    var list = h('div');
    a.businessHours = a.businessHours || [];

    function redraw() {
      clear(list);
      if (!a.businessHours.length) {
        list.appendChild(emptyState('営業時間の行がありません。'));
      }
      a.businessHours.forEach(function (bh, idx) {
        var row = h('div', { class: 'list-item' });
        var body = h('div', { class: 'row' },
          field('区分(label)', textInput(bh, 'label', { placeholder: '平日 / 土日祝' })),
          field('時間(time)', textInput(bh, 'time', { placeholder: '10:00 - 20:00' }))
        );
        var actions = h('div', { class: 'list-item-actions' },
          orderButtons(a.businessHours, idx, redraw),
          removeButton(function () { a.businessHours.splice(idx, 1); markDirty(); redraw(); })
        );
        var head = h('div', { class: 'list-item-head' },
          h('div', { class: 'list-item-title', text: '行 ' + (idx + 1) }), actions);
        append(row, [head, body]);
        list.appendChild(row);
      });
    }
    redraw();
    append(hoursPanel, list);
    append(hoursPanel, h('button', {
      class: 'btn add-row', type: 'button', text: '＋ 営業時間の行を追加',
      onClick: function () {
        a.businessHours.push({ label: '', time: '' });
        markDirty(); redraw();
      }
    }));

    append(root, [info, hoursPanel]);
  }

  /* 9. 予約設定 */
  function renderBooking(root) {
    var b = state.booking;
    var s = state.sns;

    var formChk = h('input', { type: 'checkbox', checked: b.formEnabled });
    formChk.addEventListener('change', function () { b.formEnabled = formChk.checked; markDirty(); });
    var phoneChk = h('input', { type: 'checkbox', checked: b.phoneBooking });
    phoneChk.addEventListener('change', function () { b.phoneBooking = phoneChk.checked; markDirty(); });

    var bookingPanel = h('div', { class: 'panel' },
      h('h2', { text: '予約設定' }),
      h('label', { class: 'checkbox-field' }, formChk, document.createTextNode('フォーム予約を有効にする')),
      h('div', { style: 'height:10px' }),
      h('label', { class: 'checkbox-field' }, phoneChk, document.createTextNode('電話予約を表示する')),
      h('hr', { class: 'divider' }),
      field('予約に関する注意書き(notice)', textInput(b, 'notice', { textarea: true, rows: 2 })),
      field('LINE予約URL', textInput(b, 'lineUrl', { placeholder: '空欄なら非表示' })),
      field('ホットペッパー予約URL', textInput(b, 'hotpepperUrl', { placeholder: '空欄なら非表示' }))
    );

    var snsPanel = h('div', { class: 'panel' },
      h('h2', { text: 'SNS' }),
      h('p', { class: 'panel-desc', text: '各SNSのURL。空欄のものは表示されません。' }),
      field('Instagram', textInput(s, 'instagram', { placeholder: 'https://instagram.com/...' })),
      field('X(旧Twitter)', textInput(s, 'x', { placeholder: 'https://x.com/...' })),
      field('LINE', textInput(s, 'line', { placeholder: 'https://line.me/...' }))
    );

    append(root, [bookingPanel, snsPanel]);
  }

  /* 10. 予約一覧 */
  function renderReservations(root) {
    var panel = h('div', { class: 'panel' },
      h('h2', { text: '予約一覧' }),
      h('p', { class: 'panel-desc', text: 'サイトのフォームから届いた予約です。状態を更新できます。' })
    );
    var container = h('div');

    function redraw() {
      clear(container);
      var bookings = SalonBookings.list();
      if (!bookings.length) {
        container.appendChild(emptyState('予約はまだありません。'));
        return;
      }
      var table = h('table', { class: 'data' });
      var thead = h('thead', {}, h('tr', {},
        ['受付日時', '氏名', '電話', 'メニュー', '指名', '希望日時', '要望', '状態', '操作'].map(function (t) {
          return h('th', { text: t });
        })
      ));
      var tbody = h('tbody');
      bookings.forEach(function (bk) {
        var badgeClass = 'badge-' + (bk.status || 'pending');
        var badgeText = statusLabel(bk.status);
        var actions = h('div', { class: 'cell-actions' },
          h('button', {
            class: 'btn btn-sm', type: 'button', text: '確定',
            disabled: bk.status === 'confirmed',
            onClick: function () { SalonBookings.updateStatus(bk.id, 'confirmed'); toast('確定にしました', 'success'); redraw(); }
          }),
          h('button', {
            class: 'btn btn-sm', type: 'button', text: 'キャンセル',
            disabled: bk.status === 'cancelled',
            onClick: function () { SalonBookings.updateStatus(bk.id, 'cancelled'); toast('キャンセルにしました', 'info'); redraw(); }
          }),
          h('button', {
            class: 'btn btn-sm btn-danger', type: 'button', text: '削除',
            onClick: function () {
              if (confirm('この予約を削除しますか?この操作は取り消せません。')) {
                SalonBookings.remove(bk.id); toast('削除しました', 'info'); redraw();
              }
            }
          })
        );
        var tr = h('tr', {},
          h('td', { text: formatDateTime(bk.createdAt) }),
          h('td', { text: bk.name || '' }),
          h('td', { text: bk.phone || '' }),
          h('td', { text: bk.menu || '' }),
          h('td', { text: bk.staff || '指名なし' }),
          h('td', { text: [bk.date, bk.time].filter(Boolean).join(' ') }),
          h('td', { text: bk.message || '' }),
          h('td', {}, h('span', { class: 'badge ' + badgeClass, text: badgeText })),
          h('td', {}, actions)
        );
        tbody.appendChild(tr);
      });
      append(table, [thead, tbody]);
      container.appendChild(h('div', { class: 'table-wrap' }, table));
    }
    redraw();
    append(panel, container);
    append(root, panel);
  }

  /* 11. 書き出し・読み込み */
  function renderIO(root) {
    // 書き出し
    var exportPanel = h('div', { class: 'panel' },
      h('h2', { text: '設定の書き出し' }),
      h('p', { class: 'panel-desc', text: '現在の保存済み設定をJSONファイルとしてダウンロードします。' }),
      h('button', {
        class: 'btn btn-primary', type: 'button', text: '設定をJSONでダウンロード',
        onClick: downloadConfig
      })
    );

    // 読み込み
    var importInput = h('input', { type: 'file', accept: 'application/json,.json' });
    importInput.addEventListener('change', function () {
      var f = importInput.files && importInput.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var merged = SalonConfig.importJson(reader.result);
          state = merged;
          dirty = false;
          updateSaveButton();
          renderTab(); // 再読込
          toast('設定を読み込みました', 'success');
        } catch (e) {
          toast('読み込みに失敗しました: ' + (e && e.message ? e.message : '不正なファイル'), 'error');
        }
        importInput.value = '';
      };
      reader.onerror = function () { toast('ファイルの読み込みに失敗しました', 'error'); };
      reader.readAsText(f);
    });
    var importPanel = h('div', { class: 'panel' },
      h('h2', { text: '設定の読み込み' }),
      h('p', { class: 'panel-desc', text: 'JSONファイルを読み込んで設定を置き換えます(即座に保存されます)。' }),
      importInput
    );

    // 初期化
    var resetPanel = h('div', { class: 'panel' },
      h('h2', { text: '初期設定に戻す' }),
      h('p', { class: 'panel-desc', text: '保存済みの設定を消して、すべて初期状態に戻します。' }),
      h('button', {
        class: 'btn btn-danger', type: 'button', text: '初期設定に戻す',
        onClick: function () {
          if (confirm('本当に初期設定に戻しますか?保存済みの変更はすべて失われます。')) {
            SalonConfig.reset();
            state = SalonConfig.load();
            dirty = false;
            updateSaveButton();
            renderTab();
            toast('初期設定に戻しました', 'success');
          }
        }
      })
    );

    // 容量目安
    var usagePanel = h('div', { class: 'panel' }, h('h2', { text: '保存容量の目安' }));
    var u = storageUsage();
    var pct = Math.min(100, Math.round((u.bytes / u.limit) * 100));
    var barFill = h('span');
    barFill.style.width = pct + '%';
    if (pct >= 90) barFill.className = 'critical';
    else if (pct >= 70) barFill.className = 'high';
    append(usagePanel, [
      h('div', { class: 'usage', text: '使用量:約 ' + formatKB(u.bytes) + ' / 上限 約 ' + formatKB(u.limit) + '(' + pct + '%)' }),
      h('div', { class: 'usage-bar' }, barFill),
      h('div', { class: 'usage', text: '※ ブラウザのlocalStorage(通常5MB前後)を使用します。画像を多く登録すると上限に達することがあります。' })
    ]);

    append(root, [exportPanel, importPanel, resetPanel, usagePanel]);
  }

  /* ========== 共通UI部品 ========== */

  function emptyState(msg) {
    return h('div', { class: 'empty-state' },
      h('span', { class: 'empty-emoji', text: '📭' }),
      h('div', { text: msg })
    );
  }

  /* 配列の idx 要素を上下に動かすボタン(↑↓)。移動後 onDone で再描画。 */
  function orderButtons(arr, idx, onDone) {
    var up = h('button', { class: 'btn btn-icon', type: 'button', text: '↑', title: '上へ' });
    var down = h('button', { class: 'btn btn-icon', type: 'button', text: '↓', title: '下へ' });
    if (idx === 0) up.disabled = true;
    if (idx === arr.length - 1) down.disabled = true;
    up.addEventListener('click', function () { moveArr(arr, idx, -1); markDirty(); onDone(); });
    down.addEventListener('click', function () { moveArr(arr, idx, 1); markDirty(); onDone(); });
    return [up, down];
  }

  function removeButton(onClick, label) {
    return h('button', { class: 'btn btn-icon btn-danger', type: 'button', text: '✕', title: label || '削除', onClick: onClick });
  }

  function moveArr(arr, idx, delta) {
    var to = idx + delta;
    if (to < 0 || to >= arr.length) return;
    var tmp = arr[idx];
    arr[idx] = arr[to];
    arr[to] = tmp;
  }

  /* ========== ユーティリティ ========== */

  function statusLabel(status) {
    if (status === 'confirmed') return '確定';
    if (status === 'cancelled') return 'キャンセル';
    return '受付中';
  }

  function today() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  function formatDateTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '/' + p(d.getMonth() + 1) + '/' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function downloadConfig() {
    try {
      var json = SalonConfig.exportJson();
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = h('a', { href: url, download: 'salon-config.json' });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      toast('salon-config.json を書き出しました', 'success');
    } catch (e) {
      toast('書き出しに失敗しました', 'error');
    }
  }

  /* localStorage の使用量(バイト概算)。dataURLはほぼASCIIなので文字数≒バイト数。 */
  function storageUsage() {
    var total = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        var v = localStorage.getItem(k);
        total += (k ? k.length : 0) + (v ? v.length : 0);
      }
    } catch (e) { /* 無視 */ }
    return { bytes: total, limit: 5 * 1024 * 1024 };
  }

  function formatKB(bytes) {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  /* ========== ナビ・全体制御 ========== */

  function buildSidebar() {
    var sidebar = byId('sidebar');
    clear(sidebar);
    TABS.forEach(function (tab) {
      var btn = h('button', {
        class: 'nav-item' + (tab.id === activeTab ? ' active' : ''),
        type: 'button',
        onClick: function () { switchTab(tab.id); }
      },
        h('span', { class: 'nav-ico', text: tab.ico }),
        h('span', { text: tab.label })
      );
      btn.setAttribute('data-tab', tab.id);
      sidebar.appendChild(btn);
    });
  }

  function switchTab(id) {
    activeTab = id;
    // ナビのアクティブ状態を更新
    var items = byId('sidebar').querySelectorAll('.nav-item');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('active', items[i].getAttribute('data-tab') === id);
    }
    renderTab();
  }

  function renderTab() {
    var tab = tabById(activeTab);
    byId('contentTitle').textContent = tab.label;
    var body = byId('contentBody');
    clear(body);
    tab.render(body);
    // コンテンツ先頭へスクロール
    window.scrollTo(0, 0);
  }

  function init() {
    buildSidebar();
    renderTab();
    updateSaveButton();

    byId('saveBtn').addEventListener('click', save);

    // 未保存で離脱しようとしたら警告
    window.addEventListener('beforeunload', function (e) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    });

    // Ctrl/Cmd + S で保存
    window.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        save();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
