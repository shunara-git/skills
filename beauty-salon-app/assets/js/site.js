/*
 * site.js — 顧客向けサイトの描画エンジン
 *
 * SalonConfig.load() の設定を読み、全セクションをJSで動的に生成する。
 * config由来の文字列は必ず textContent / createElement 経由で挿入し、
 * innerHTML への直接連結は行わない(XSS対策)。
 */
(function () {
  'use strict';

  /* ---- 小さなDOMヘルパー ---- */

  /* 要素生成。text は textContent として安全に設定する。 */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== '') node.textContent = text;
    return node;
  }

  /* 複数の子要素をまとめて追加 */
  function append(parent) {
    for (var i = 1; i < arguments.length; i++) {
      if (arguments[i]) parent.appendChild(arguments[i]);
    }
    return parent;
  }

  /* ---- 整形ユーティリティ ---- */

  /* 4950 -> "¥4,950" */
  function formatPrice(n) {
    var num = Number(n) || 0;
    return '¥' + num.toLocaleString('ja-JP');
  }

  /* 60 -> "約60分" */
  function formatDuration(min) {
    var m = Number(min) || 0;
    return '約' + m + '分';
  }

  /* "2026-07-01" -> "2026.07.01"(パースできなければ原文) */
  function formatDate(str) {
    if (!str) return '';
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
    if (!m) return str;
    return m[1] + '.' + m[2] + '.' + m[3];
  }

  /* 今日を YYYY-MM-DD で返す(date入力の min 用) */
  function todayStr() {
    var d = new Date();
    var mm = ('0' + (d.getMonth() + 1)).slice(-2);
    var dd = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  function nonEmpty(v) {
    return typeof v === 'string' && v.trim() !== '';
  }

  /* ---- テーマ注入 ---- */

  function applyTheme(theme) {
    var root = document.documentElement;
    root.style.setProperty('--primary', theme.primaryColor || '#8a6d5c');
    root.style.setProperty('--accent', theme.accentColor || '#c9a86a');
    root.style.setProperty('--bg', theme.backgroundColor || '#faf7f2');
    root.style.setProperty('--text', theme.textColor || '#3a3330');
    /* 見出し書体:serif=明朝系 / sans=ゴシック系 */
    var serif = '"游明朝", "Yu Mincho", YuMincho, "Hiragino Mincho ProN", "HGS明朝E", serif';
    var sans = '"游ゴシック", "Yu Gothic", YuGothic, "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Meiryo", sans-serif';
    root.style.setProperty('--heading-font', theme.fontStyle === 'serif' ? serif : sans);
    root.setAttribute('data-font', theme.fontStyle === 'serif' ? 'serif' : 'sans');
  }

  /* ---- ヘッダー ---- */

  function renderHeader(config, enabledSections) {
    document.getElementById('brandName').textContent = config.meta.salonName || '';

    var nav = document.getElementById('siteNav');
    nav.textContent = '';
    enabledSections.forEach(function (s) {
      /* ナビはタイトルのあるセクションのみ。hero(タイトル空)は除外。 */
      if (!nonEmpty(s.title)) return;
      var a = el('a', 'nav-link', s.title);
      a.setAttribute('href', '#' + s.id);
      nav.appendChild(a);
    });

    /* ハンバーガー開閉 */
    var toggle = document.getElementById('navToggle');
    var header = document.getElementById('siteHeader');
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    /* ナビリンク押下でメニューを閉じる */
    nav.addEventListener('click', function (e) {
      if (e.target && e.target.classList.contains('nav-link')) {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- セクション外枠 ---- */

  /* section要素を生成。title があれば見出しを付ける。 */
  function makeSection(id, title, extraClass) {
    var sec = el('section', 'section reveal' + (extraClass ? ' ' + extraClass : ''));
    sec.id = id;
    var inner = el('div', 'section-inner');
    if (nonEmpty(title)) {
      var h = el('h2', 'section-title', title);
      inner.appendChild(h);
    }
    sec.appendChild(inner);
    return { section: sec, inner: inner };
  }

  /* ---- 各セクションの描画 ---- */

  function renderHero(config, section, bookingEnabled) {
    var hero = config.hero || {};
    var sec = el('section', 'hero reveal');
    sec.id = 'hero';
    if (nonEmpty(hero.image)) {
      sec.style.backgroundImage = 'url("' + hero.image + '")';
    }
    var overlay = el('div', 'hero-overlay');
    var box = el('div', 'hero-content');
    append(box,
      nonEmpty(hero.heading) ? el('h1', 'hero-heading', hero.heading) : null,
      nonEmpty(hero.subheading) ? el('p', 'hero-sub', hero.subheading) : null
    );
    /* CTA:bookingセクションが有効なときのみ表示 */
    if (bookingEnabled && nonEmpty(hero.ctaText)) {
      var cta = el('a', 'btn btn-primary hero-cta', hero.ctaText);
      cta.setAttribute('href', '#booking');
      box.appendChild(cta);
    }
    overlay.appendChild(box);
    sec.appendChild(overlay);
    return sec;
  }

  function renderConcept(config, section) {
    var c = config.concept || {};
    var built = makeSection('concept', section.title, 'concept');
    var grid = el('div', 'concept-grid');
    var textCol = el('div', 'concept-text');
    if (nonEmpty(config.meta.tagline)) {
      textCol.appendChild(el('p', 'concept-tagline', config.meta.tagline));
    }
    /* 改行(\n)を段落として反映 */
    if (nonEmpty(c.body)) {
      c.body.split('\n').forEach(function (line) {
        if (nonEmpty(line)) textCol.appendChild(el('p', 'concept-body', line));
      });
    }
    grid.appendChild(textCol);
    if (nonEmpty(c.image)) {
      var figure = el('div', 'concept-image');
      var img = el('img');
      img.setAttribute('src', c.image);
      img.setAttribute('alt', 'コンセプトイメージ');
      img.setAttribute('loading', 'lazy');
      figure.appendChild(img);
      grid.appendChild(figure);
    }
    built.inner.appendChild(grid);
    return built.section;
  }

  function renderMenu(config, section) {
    var menu = config.menu || {};
    var built = makeSection('menu', section.title, 'menu');
    var cats = el('div', 'menu-categories');
    (menu.categories || []).forEach(function (cat) {
      var block = el('div', 'menu-category');
      if (nonEmpty(cat.name)) block.appendChild(el('h3', 'menu-category-name', cat.name));
      var list = el('ul', 'menu-items');
      (cat.items || []).forEach(function (item) {
        var li = el('li', 'menu-item');
        var head = el('div', 'menu-item-head');
        var left = el('div', 'menu-item-left');
        left.appendChild(el('span', 'menu-item-name', item.name || ''));
        if (item.duration != null && item.duration !== '') {
          left.appendChild(el('span', 'menu-item-duration', formatDuration(item.duration)));
        }
        head.appendChild(left);
        head.appendChild(el('span', 'menu-item-price', formatPrice(item.price)));
        li.appendChild(head);
        if (nonEmpty(item.description)) {
          li.appendChild(el('p', 'menu-item-desc', item.description));
        }
        list.appendChild(li);
      });
      block.appendChild(list);
      cats.appendChild(block);
    });
    built.inner.appendChild(cats);
    if (nonEmpty(menu.note)) {
      built.inner.appendChild(el('p', 'menu-note', menu.note));
    }
    return built.section;
  }

  function renderStaff(config, section) {
    var built = makeSection('staff', section.title, 'staff');
    var grid = el('div', 'card-grid');
    (config.staff || []).forEach(function (s) {
      var card = el('article', 'card staff-card');
      if (nonEmpty(s.photo)) {
        var media = el('div', 'card-media');
        var img = el('img');
        img.setAttribute('src', s.photo);
        img.setAttribute('alt', s.name ? s.name + ' の写真' : 'スタッフ写真');
        img.setAttribute('loading', 'lazy');
        media.appendChild(img);
        card.appendChild(media);
      }
      var body = el('div', 'card-body');
      if (nonEmpty(s.name)) body.appendChild(el('h3', 'card-title', s.name));
      if (nonEmpty(s.role)) body.appendChild(el('p', 'card-role', s.role));
      if (nonEmpty(s.bio)) body.appendChild(el('p', 'card-text', s.bio));
      card.appendChild(body);
      grid.appendChild(card);
    });
    built.inner.appendChild(grid);
    return built.section;
  }

  function renderGallery(config, section) {
    var built = makeSection('gallery', section.title, 'gallery');
    var grid = el('div', 'gallery-grid');
    (config.gallery || []).forEach(function (g) {
      var fig = el('figure', 'gallery-item');
      if (nonEmpty(g.photo)) {
        var img = el('img');
        img.setAttribute('src', g.photo);
        img.setAttribute('alt', g.caption || 'スタイル写真');
        img.setAttribute('loading', 'lazy');
        fig.appendChild(img);
      }
      if (nonEmpty(g.caption)) {
        fig.appendChild(el('figcaption', 'gallery-caption', g.caption));
      }
      grid.appendChild(fig);
    });
    built.inner.appendChild(grid);
    return built.section;
  }

  function renderNews(config, section) {
    var built = makeSection('news', section.title, 'news');
    var list = el('div', 'news-list');
    (config.news || []).forEach(function (n) {
      var item = el('article', 'news-item');
      var head = el('div', 'news-head');
      if (nonEmpty(n.date)) head.appendChild(el('time', 'news-date', formatDate(n.date)));
      if (nonEmpty(n.title)) head.appendChild(el('h3', 'news-title', n.title));
      item.appendChild(head);
      if (nonEmpty(n.body)) item.appendChild(el('p', 'news-body', n.body));
      list.appendChild(item);
    });
    built.inner.appendChild(list);
    return built.section;
  }

  function renderAccess(config, section) {
    var a = config.access || {};
    var built = makeSection('access', section.title, 'access');
    var grid = el('div', 'access-grid');
    var info = el('div', 'access-info');

    if (nonEmpty(a.address)) {
      var addr = el('div', 'access-row');
      addr.appendChild(el('span', 'access-label', '住所'));
      addr.appendChild(el('span', 'access-value', a.address));
      info.appendChild(addr);
    }
    if (nonEmpty(a.phone)) {
      var tel = el('div', 'access-row');
      tel.appendChild(el('span', 'access-label', '電話'));
      var telLink = el('a', 'access-value access-link', a.phone);
      telLink.setAttribute('href', 'tel:' + a.phone.replace(/[^0-9+]/g, ''));
      tel.appendChild(telLink);
      info.appendChild(tel);
    }
    /* 営業時間テーブル */
    if (Array.isArray(a.businessHours) && a.businessHours.length) {
      var hoursRow = el('div', 'access-row access-row-block');
      hoursRow.appendChild(el('span', 'access-label', '営業時間'));
      var table = el('table', 'hours-table');
      var tbody = el('tbody');
      a.businessHours.forEach(function (h) {
        var tr = el('tr');
        tr.appendChild(el('th', 'hours-label', h.label || ''));
        tr.appendChild(el('td', 'hours-time', h.time || ''));
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      hoursRow.appendChild(table);
      info.appendChild(hoursRow);
    }
    if (nonEmpty(a.closedDays)) {
      var closed = el('div', 'access-row');
      closed.appendChild(el('span', 'access-label', '定休日'));
      closed.appendChild(el('span', 'access-value', a.closedDays));
      info.appendChild(closed);
    }
    if (nonEmpty(a.note)) {
      info.appendChild(el('p', 'access-note', a.note));
    }
    grid.appendChild(info);

    /* 地図(mapEmbedUrlが非空のときのみ) */
    if (nonEmpty(a.mapEmbedUrl)) {
      var mapWrap = el('div', 'access-map');
      var iframe = el('iframe');
      iframe.setAttribute('src', a.mapEmbedUrl);
      iframe.setAttribute('title', '地図');
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      mapWrap.appendChild(iframe);
      grid.appendChild(mapWrap);
    }
    built.inner.appendChild(grid);
    return built.section;
  }

  function renderBooking(config, section) {
    var b = config.booking || {};
    var built = makeSection('booking', section.title, 'booking');

    if (nonEmpty(b.notice)) {
      built.inner.appendChild(el('p', 'booking-notice', b.notice));
    }

    /* フォーム予約 */
    if (b.formEnabled) {
      var formWrap = el('div', 'booking-form-wrap');
      var form = buildBookingForm(config);
      formWrap.appendChild(form);
      built.inner.appendChild(formWrap);
    }

    /* 外部予約導線 */
    var links = el('div', 'booking-links');
    if (nonEmpty(b.lineUrl)) {
      var line = el('a', 'btn btn-outline', 'LINEで予約');
      line.setAttribute('href', b.lineUrl);
      line.setAttribute('target', '_blank');
      line.setAttribute('rel', 'noopener noreferrer');
      links.appendChild(line);
    }
    if (nonEmpty(b.hotpepperUrl)) {
      var hp = el('a', 'btn btn-outline', 'ホットペッパーで予約');
      hp.setAttribute('href', b.hotpepperUrl);
      hp.setAttribute('target', '_blank');
      hp.setAttribute('rel', 'noopener noreferrer');
      links.appendChild(hp);
    }
    if (b.phoneBooking && nonEmpty((config.access || {}).phone)) {
      var phone = config.access.phone;
      var telBtn = el('a', 'btn btn-outline', 'お電話で予約 ' + phone);
      telBtn.setAttribute('href', 'tel:' + phone.replace(/[^0-9+]/g, ''));
      links.appendChild(telBtn);
    }
    if (links.childNodes.length) {
      built.inner.appendChild(el('p', 'booking-links-label', 'その他のご予約方法'));
      built.inner.appendChild(links);
    }
    return built.section;
  }

  /* 予約フォーム本体を生成 */
  function buildBookingForm(config) {
    var form = el('form', 'booking-form');
    form.setAttribute('novalidate', '');

    /* 1つの入力行を作る汎用関数 */
    function field(labelText, control, required) {
      var wrap = el('div', 'form-field');
      var label = el('label', 'form-label', labelText);
      if (required) {
        var mark = el('span', 'req', '*');
        label.appendChild(mark);
      }
      if (control.id) label.setAttribute('for', control.id);
      wrap.appendChild(label);
      wrap.appendChild(control);
      var err = el('p', 'field-error');
      err.setAttribute('data-error-for', control.id || '');
      wrap.appendChild(err);
      return wrap;
    }

    /* 氏名 */
    var name = el('input');
    name.type = 'text';
    name.id = 'bk-name';
    name.name = 'name';
    name.setAttribute('autocomplete', 'name');
    form.appendChild(field('お名前', name, true));

    /* 電話 */
    var phone = el('input');
    phone.type = 'tel';
    phone.id = 'bk-phone';
    phone.name = 'phone';
    phone.setAttribute('autocomplete', 'tel');
    phone.setAttribute('placeholder', '09000000000');
    form.appendChild(field('電話番号', phone, true));

    /* 希望メニュー(config の menu 全項目) */
    var menuSel = el('select');
    menuSel.id = 'bk-menu';
    menuSel.name = 'menu';
    menuSel.appendChild(makeOption('', '選択してください'));
    (config.menu && config.menu.categories || []).forEach(function (cat) {
      (cat.items || []).forEach(function (item) {
        if (nonEmpty(item.name)) {
          var label = cat.name ? cat.name + ' / ' + item.name : item.name;
          menuSel.appendChild(makeOption(item.name, label));
        }
      });
    });
    form.appendChild(field('ご希望メニュー', menuSel, false));

    /* 指名スタッフ */
    var staffSel = el('select');
    staffSel.id = 'bk-staff';
    staffSel.name = 'staff';
    staffSel.appendChild(makeOption('指名なし', '指名なし'));
    (config.staff || []).forEach(function (s) {
      if (nonEmpty(s.name)) staffSel.appendChild(makeOption(s.name, s.name));
    });
    form.appendChild(field('ご指名スタッフ', staffSel, false));

    /* 希望日 */
    var date = el('input');
    date.type = 'date';
    date.id = 'bk-date';
    date.name = 'date';
    date.setAttribute('min', todayStr());
    form.appendChild(field('ご希望日', date, false));

    /* 希望時間 */
    var time = el('input');
    time.type = 'time';
    time.id = 'bk-time';
    time.name = 'time';
    form.appendChild(field('ご希望時間', time, false));

    /* ご要望 */
    var msg = el('textarea');
    msg.id = 'bk-message';
    msg.name = 'message';
    msg.rows = 4;
    form.appendChild(field('ご要望・ご相談', msg, false));

    var submit = el('button', 'btn btn-primary form-submit', 'この内容で予約する');
    submit.type = 'submit';
    form.appendChild(submit);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleBookingSubmit(form);
    });
    return form;
  }

  function makeOption(value, label) {
    var opt = el('option', null, label);
    opt.value = value;
    return opt;
  }

  /* バリデーション + 送信 */
  function handleBookingSubmit(form) {
    var name = form.querySelector('#bk-name');
    var phone = form.querySelector('#bk-phone');
    var valid = true;

    /* エラー表示をクリア */
    Array.prototype.forEach.call(form.querySelectorAll('.field-error'), function (n) {
      n.textContent = '';
    });
    Array.prototype.forEach.call(form.querySelectorAll('.has-error'), function (n) {
      n.classList.remove('has-error');
    });

    function fail(input, message) {
      valid = false;
      input.classList.add('has-error');
      var err = form.querySelector('[data-error-for="' + input.id + '"]');
      if (err) err.textContent = message;
    }

    if (!nonEmpty(name.value)) fail(name, 'お名前を入力してください。');
    if (!nonEmpty(phone.value)) {
      fail(phone, '電話番号を入力してください。');
    } else if (!/[0-9]/.test(phone.value)) {
      fail(phone, '正しい電話番号を入力してください。');
    }

    if (!valid) {
      var firstErr = form.querySelector('.has-error');
      if (firstErr) firstErr.focus();
      return;
    }

    var booking = {
      name: name.value.trim(),
      phone: phone.value.trim(),
      menu: (form.querySelector('#bk-menu') || {}).value || '',
      staff: (form.querySelector('#bk-staff') || {}).value || '指名なし',
      date: (form.querySelector('#bk-date') || {}).value || '',
      time: (form.querySelector('#bk-time') || {}).value || '',
      message: (form.querySelector('#bk-message') || {}).value || ''
    };

    try {
      window.SalonBookings.add(booking);
    } catch (err) {
      /* 保存失敗時もユーザーには受付表示(プロトタイプ) */
    }

    /* フォームを成功メッセージに差し替え */
    var success = el('div', 'booking-success');
    success.appendChild(el('div', 'booking-success-icon', '✓'));
    success.appendChild(el('p', 'booking-success-text', 'ご予約を受け付けました。確認のご連絡をお待ちください。'));
    form.parentNode.replaceChild(success, form);
    /* 成功表示へスクロール */
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---- フッター ---- */

  function renderFooter(config) {
    var footer = document.getElementById('siteFooter');
    footer.textContent = '';
    var inner = el('div', 'footer-inner');

    var brand = el('div', 'footer-brand');
    if (nonEmpty(config.meta.salonName)) {
      brand.appendChild(el('p', 'footer-name', config.meta.salonName));
    }
    if (nonEmpty((config.access || {}).address)) {
      brand.appendChild(el('p', 'footer-address', config.access.address));
    }
    inner.appendChild(brand);

    /* SNS(非空のみ) */
    var sns = config.sns || {};
    var snsWrap = el('div', 'footer-sns');
    var snsDefs = [
      { key: 'instagram', label: 'Instagram' },
      { key: 'x', label: 'X' },
      { key: 'line', label: 'LINE' }
    ];
    snsDefs.forEach(function (def) {
      if (nonEmpty(sns[def.key])) {
        var a = el('a', 'footer-sns-link', def.label);
        a.setAttribute('href', sns[def.key]);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        snsWrap.appendChild(a);
      }
    });
    if (snsWrap.childNodes.length) inner.appendChild(snsWrap);

    footer.appendChild(inner);
    var year = new Date().getFullYear();
    footer.appendChild(el('p', 'footer-copy', '© ' + year + ' ' + (config.meta.salonName || '')));
  }

  /* ---- スクロール連動フェードイン ---- */

  function setupReveal() {
    var targets = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(targets, function (t) { t.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(targets, function (t) { io.observe(t); });
  }

  /* ---- 描画テーブル ---- */

  var RENDERERS = {
    concept: renderConcept,
    menu: renderMenu,
    staff: renderStaff,
    gallery: renderGallery,
    news: renderNews,
    access: renderAccess,
    booking: renderBooking
  };

  /* ---- メイン ---- */

  function main() {
    var config = window.SalonConfig.load();

    applyTheme(config.theme || {});
    document.title = config.meta.salonName || 'Salon';

    var sections = Array.isArray(config.sections) ? config.sections : [];
    var enabled = sections.filter(function (s) { return s && s.enabled; });
    var bookingEnabled = enabled.some(function (s) { return s.id === 'booking'; });

    renderHeader(config, enabled);

    var mainEl = document.getElementById('main');
    mainEl.textContent = '';
    mainEl.id = 'main';
    /* 先頭アンカー */
    var top = el('span');
    top.id = 'top';
    mainEl.appendChild(top);

    enabled.forEach(function (s) {
      var node = null;
      if (s.id === 'hero') {
        node = renderHero(config, s, bookingEnabled);
      } else if (RENDERERS[s.id]) {
        node = RENDERERS[s.id](config, s);
      }
      if (node) mainEl.appendChild(node);
    });

    renderFooter(config);
    setupReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
