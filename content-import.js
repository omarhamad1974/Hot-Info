/* content-import.js
   Fill the site content from Markdown files (frontmatter + body).
   Adapted from the content-system parser, but it writes into the site's own app-data.json shape
   (news, services, testimonials, employees, jurisdictions, about text) instead of Supabase tables.
   No dependencies. Works in the browser (window.KImport) and in Node (require).

   One file can hold many items: separate them with a line of === followed by a new --- block.
   lang: ar goes to the Arabic file (app-data.ar.json), lang: en to the main file. */
(function (root) {
  'use strict';

  const LANGS = ['ar', 'en'];

  /* type name (and its aliases) -> the site section it fills */
  const TYPE_ALIASES = {
    blog: 'news', news: 'news', article: 'news',
    service: 'services', services: 'services',
    testimonial: 'testimonials', testimonials: 'testimonials',
    team: 'employees', employee: 'employees', employees: 'employees',
    country: 'jurisdictions', jurisdiction: 'jurisdictions', jurisdictions: 'jurisdictions',
    carousel: 'carousel', slide: 'carousel', slides: 'carousel',
    pagetext: 'pagetext', 'page-text': 'pagetext', pagetexts: 'pagetext',
    about: 'about',
    faq: 'faq', faqs: 'faq',
    items: 'cards', item: 'cards', cards: 'cards', card: 'cards',
    gallery: 'gallery'
  };
  const PAGE_STEMS = ['about', 'patents', 'trademarks', 'translation'];
  const NOT_USED = ['section', 'site'];
  /* types where one file block holds many entries */
  const MULTI = { faq: 'headings', cards: 'headings', gallery: 'lines' };
  const ENTRY_FIELDS = { icon: 'icon', image: 'image', link: 'link', badge: 'badge', price: 'price', cta_text: 'ctaText', cta_link: 'ctaLink', id: 'id' };

  /* the field the item is matched by (to update instead of duplicate) and the fields that are translated */
  const SECTIONS = {
    news:           { title: 'title',   ar: ['title', 'excerpt', 'text'], label: 'News' },
    services:       { title: 'title',   ar: ['title', 'description', 'details', 'pageContent'], label: 'Services' },
    testimonials:   { title: 'name',    ar: ['name', 'role', 'text'], label: 'Testimonials' },
    employees:      { title: 'name',    ar: ['name', 'position'], label: 'Team' },
    carousel:       { title: 'title',   ar: ['title', 'subtitle', 'tag'], label: 'Carousel' },
    jurisdictions:  { title: 'country', ar: ['country', 'tag', 'brief', 'details'], label: 'Countries' },
    faq:            { title: 'question', ar: ['question', 'answer'], label: 'FAQ' },
    cards:          { title: 'title',   ar: ['title', 'description', 'badge', 'ctaText'], label: 'Cards' },
    gallery:        { title: 'image',   ar: ['caption', 'alt'], label: 'Gallery' }
  };

  /* ---------- helpers ---------- */
  function slugify(s) {
    return String(s == null ? '' : s).normalize('NFKC').toLowerCase().trim()
      .replace(/[^\p{L}\p{N}\p{M}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  }

  function parseValue(raw) {
    const v = String(raw).trim();
    if (v === '') return '';
    if (v.length >= 2 && ((v[0] === '"' && v[v.length - 1] === '"') || (v[0] === "'" && v[v.length - 1] === "'"))) return v.slice(1, -1);
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(v)) return Number(v); // numbers, but not 0100... phone-like values
    return v;
  }

  const SEPARATOR = /^={3,}[ \t]*\r?\n(?=\s*---[ \t]*\r?\n)/m;

  function splitFrontmatter(chunk) {
    const lines = chunk.replace(/^﻿/, '').split(/\r?\n/);
    let i = 0;
    while (i < lines.length && lines[i].trim() === '') i++;
    if (!lines[i] || lines[i].trim() !== '---') return { error: 'Missing frontmatter: each item must start with a --- block' };
    const fm = {};
    let j = i + 1;
    for (; j < lines.length && lines[j].trim() !== '---'; j++) {
      const line = lines[j];
      if (!line.trim() || line.trim().startsWith('#')) continue;
      const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/); // first colon only
      if (m) fm[m[1].toLowerCase()] = parseValue(m[2]);
    }
    if (j >= lines.length) return { error: 'Frontmatter is not closed with ---' };
    return { fm, body: lines.slice(j + 1).join('\n').trim() };
  }

  /* Markdown body -> the site's own text format: ## subtitle, **bold**, - bullet, plain paragraphs.
     Fonts, colours and sizes always come from the site, so nothing visual is imported.
     Returns { title, body } where title is a first "# Heading" line. */
  function mdToKhip(src, o) {
    const keep = !!(o && o.keepLines); // keep single line breaks inside a paragraph (About text)
    const t = String(src).replace(/^﻿/, '').replace(/\r\n?/g, '\n').replace(/^---\n[\s\S]*?\n---\n/, '');
    const inl = function (x) {
      return x.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`([^`]+)`/g, '$1')
        .replace(/(\*\*|__)(.+?)\1/g, '**$2**').replace(/(^|[^*\w])\*(?![\s*])([^*]+?)\*(?!\*)/g, '$1$2')
        .replace(/(^|[\s(])_(?!\s)([^_]+?)_(?=[\s).,;:!?]|$)/g, '$1$2').replace(/~~(.+?)~~/g, '$1').replace(/<[^>]+>/g, '').trim();
    };
    const out = []; let para = [], fence = false, title = '';
    const flush = function () { if (para.length) { const x = inl(para.join(keep ? '\n' : ' ')); if (x) out.push({ p: x }); para = []; } };
    for (let line of t.split('\n')) {
      if (/^\s*(```|~~~)/.test(line)) { flush(); fence = !fence; continue; }
      if (fence) { if (line.trim()) out.push({ p: line.trim() }); continue; }
      line = line.replace(/^\s*>\s?/, '');
      if (!line.trim()) { flush(); continue; }
      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { flush(); continue; }
      let m = line.match(/^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/);
      if (m) {
        flush(); const h = inl(m[2]).replace(/\*\*/g, '');
        if (!title && !out.length && m[1].length === 1) title = h; else if (h) out.push({ h: h });
        continue;
      }
      m = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?(.*)$/);
      if (m) { flush(); const x = inl(m[1]); if (x) out.push({ li: x }); continue; }
      if (/^\s*\|/.test(line)) {
        flush(); if (/^[\s:|-]+$/.test(line)) continue;
        const x = inl(line.trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); }).filter(Boolean).join(' - '));
        if (x) out.push({ p: x }); continue;
      }
      if (/^\s+\S/.test(line) && !para.length && out.length && out[out.length - 1].li != null) { out[out.length - 1].li += ' ' + inl(line); continue; }
      para.push(line.trim());
    }
    flush();
    let s = '', prev = null;
    for (const b of out) {
      const k = b.h != null ? 'h' : b.li != null ? 'li' : 'p';
      if (prev) s += (prev === 'li' && k === 'li') || prev === 'h' ? '\n' : '\n\n';
      s += k === 'h' ? '## ' + b.h : k === 'li' ? '- ' + b.li : b.p; prev = k;
    }
    return { title: title, body: s };
  }

  function inlineText(x) { return mdToKhip(String(x)).body.replace(/^##\s*/, '').replace(/\*\*/g, '').trim(); }

  /* first plain paragraph of a converted body, used when a short summary was not written */
  function firstParagraph(body, max) {
    const p = String(body || '').split(/\n\n+/).map(function (x) { return x.trim(); })
      .find(function (x) { return x && !/^(##|- )/.test(x); }) || '';
    const plain = p.replace(/\*\*/g, '');
    if (plain.length <= max) return plain;
    const cut = plain.slice(0, max); const sp = cut.lastIndexOf(' ');
    return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:.\-–]+$/, '') + '…';
  }

  function normDate(v) {
    const s = String(v == null ? '' : v).trim();
    if (!s) return { ok: true, value: '' };
    let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    let y, mo, d;
    if (m) { y = +m[1]; mo = +m[2]; d = +m[3]; }
    else if ((m = s.match(/^(\d{1,2})[-/.,](\d{1,2})[-/.,](\d{2}|\d{4})$/))) { d = +m[1]; mo = +m[2]; y = +m[3]; if (y < 100) y += 2000; }
    else return { ok: false, value: '' };
    const dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return { ok: false, value: '' };
    return { ok: true, value: y + '-' + String(mo).padStart(2, '0') + '-' + String(d).padStart(2, '0') };
  }

  function cleanImage(v) {
    return String(v == null ? '' : v).trim().replace(/^\.?\/?assets\//, '').replace(/^\.\//, '');
  }

  /* split "brief" text from "Filing details" for a country: a "## Details" style heading starts the details part */
  const DETAILS_HEAD = /^##\s*(filing\s+details|details|تفاصيل\s+التقديم|التفاصيل)\s*$/im;
  function splitCountry(body) {
    const m = DETAILS_HEAD.exec(body);
    if (!m) return { brief: body.trim(), details: '' };
    return { brief: body.slice(0, m.index).trim(), details: body.slice(m.index + m[0].length).trim() };
  }

  /* ---------- main parser ---------- */
  /* opts: defaultLang ('ar'), knownImages (Set of lowercase file names, optional), categories (news category labels, optional) */
  function parseContent(text, opts) {
    opts = opts || {};
    const defaultLang = opts.defaultLang || 'ar';
    const known = opts.knownImages || null;
    const cats = (opts.categories || []).filter(Boolean);
    let items = []; const issues = [];

    const chunks = String(text).split(SEPARATOR).filter(function (c) { return c.trim(); });
    if (!chunks.length) issues.push({ chunk: 0, level: 'error', message: 'The file is empty' });

    chunks.forEach(function (chunk, ci) {
      const add = function (level, message) { issues.push({ chunk: ci + 1, level: level, message: message }); };
      const parsed = splitFrontmatter(chunk);
      if (parsed.error) return add('error', parsed.error);
      const fm = parsed.fm, body = parsed.body;

      const rawType = String(fm.type == null ? '' : fm.type).toLowerCase();
      if (NOT_USED.indexOf(rawType) >= 0) return add('warning', '"' + rawType + '" is not used by this site, so it was skipped');
      const kind = TYPE_ALIASES[rawType];
      if (!kind) return add('error', 'Unknown type "' + (fm.type == null ? '' : fm.type) + '". Use one of: blog, service, testimonial, team, country, carousel, about, pagetext, faq, items, gallery');

      const lang = String(fm.lang == null ? defaultLang : fm.lang).toLowerCase();
      if (LANGS.indexOf(lang) < 0) return add('error', 'lang must be ar or en (got "' + fm.lang + '")');
      if (String(fm.status || 'published').toLowerCase() === 'draft') return add('warning', 'Skipped (status: draft)' + (fm.title || fm.name || fm.country ? ': ' + (fm.title || fm.name || fm.country) : ''));

      const base = { kind: kind, lang: lang, id: fm.id == null || fm.id === '' ? '' : String(fm.id), _chunk: ci + 1 };
      const upd = !!base.id;   // an item with an id updates an existing one, so partly filled items are fine
      const conv = mdToKhip(body, { keepLines: kind === 'about' });          // a first "# Heading" in the body is treated as the title when none is given
      const text0 = conv.body;
      const checkImg = function (img, t) {
        if (img && known && !known.has(String(img).toLowerCase())) add('warning', '"' + t + '": image "' + img + '" is not in assets yet. Choose the picture on the import screen or upload it in the admin.');
      };

      if (kind === 'pagetext') {
        const stem = String(fm.page || '').toLowerCase();
        const keys = opts.pageKeys || null;       // {about:[keys], ...} read from the page files (optional)
        if (!stem) return add('error', 'pagetext: missing "page:" (about, patents, trademarks or translation)');
        if (PAGE_STEMS.indexOf(stem) < 0) return add('error', 'pagetext: unknown page "' + stem + '". Use one of: ' + PAGE_STEMS.join(', '));
        if (lang !== 'ar') return add('warning', 'pagetext "' + stem + '": the fixed page text is only translated into Arabic, so this English item was skipped');
        const entries = {}; let cur = null, n = 0;
        body.split(/\r?\n/).forEach(function (l) {
          const h = l.match(/^##\s+(\S+)\s*$/);
          if (h) { cur = h[1]; entries[cur] = []; return; }
          if (cur && !/^\s*<!--.*-->\s*$/.test(l)) entries[cur].push(l);
        });
        const clean = {};
        Object.keys(entries).forEach(function (k) {
          const v = entries[k].join('\n').trim();
          if (!v) return;
          if (keys && keys[stem] && keys[stem].length && keys[stem].indexOf(k) < 0) { add('warning', 'pagetext "' + stem + '": "' + k + '" is not a text of that page, so it was skipped'); return; }
          clean[k] = v; n++;
        });
        if (!n) return add('error', 'pagetext "' + stem + '": no "## key" entries with text found');
        items.push(Object.assign(base, { slug: 'pagetext-' + stem, title: 'Page text: ' + stem + ' (' + n + ')', fields: { page: stem, entries: clean } }));
        return;
      }

      if (kind === 'about') {
        const f = {};
        if (text0) f.aboutMainText = text0;
        if (fm.tagline) f.about = String(fm.tagline);
        if (!Object.keys(f).length) return add('error', 'about: write the text in the body and/or a "tagline:" line');
        items.push(Object.assign(base, { slug: 'about', title: 'About text', fields: f }));
        return;
      }

      if (MULTI[kind]) {
        const group = String(fm.group == null || String(fm.group).trim() === '' ? 'general' : fm.group).trim();
        const label = SECTIONS[kind].label;
        if (!fm.group) add('info', label + ': no "group:" line, the group name "general" was used');
        const push = function (t, f) {
          f.group = group;
          items.push({ kind: kind, lang: lang, id: f.id ? String(f.id) : '', _chunk: ci + 1, slug: groupKey(group) + '~' + slugify(t), title: t, fields: (delete f.id, f) });
        };
        let n = 0;
        if (MULTI[kind] === 'lines') {
          body.split(/\r?\n/).forEach(function (line) {
            if (!line.trim()) return;
            const p = line.split('|').map(function (x) { return x.trim(); });
            const img = cleanImage(p[0]);
            if (!img) return;
            const f = { image: img, caption: p[1] || '', alt: p[2] || '' };
            checkImg(img, label + ' "' + group + '"'); push(img, f); n++;
          });
          if (!n) add('error', 'Gallery "' + group + '": no picture lines found (format: file.jpg | caption | alt text)');
        } else {
          const parts = ('\n' + body).split(/\n(?=##[ \t]+\S)/).map(function (x) { return x.replace(/^\n/, ''); }).filter(function (x) { return /^##[ \t]/.test(x); });
          if (/^[^#\s]/.test(body) && !/^##[ \t]/.test(body)) add('warning', label + ' "' + group + '": text before the first "## heading" was ignored');
          parts.forEach(function (part) {
            const lines = part.split('\n');
            const heading = inlineText(lines.shift().replace(/^##[ \t]+/, ''));
            const f = {};
            /* lines at the very end such as "icon: star" or "image: a.jpg" become fields */
            while (lines.length) {
              const last = lines[lines.length - 1];
              if (!last.trim()) { lines.pop(); continue; }
              const m = last.match(/^\s*([A-Za-z_]+)\s*:\s*(.*)$/);
              if (m && ENTRY_FIELDS[m[1].toLowerCase()] && (kind === 'cards' || m[1].toLowerCase() === 'id')) { f[ENTRY_FIELDS[m[1].toLowerCase()]] = String(parseValue(m[2])); lines.pop(); } else break;
            }
            const text = mdToKhip(lines.join('\n')).body;
            if (!heading) return;
            if (kind === 'faq') {
              f.question = heading; f.answer = text;
              if (!text) add('warning', 'FAQ "' + heading + '" has no answer text');
            } else {
              f.title = heading; f.description = text.replace(/\n+/g, ' ').trim();
              if (f.image) { f.image = cleanImage(f.image); checkImg(f.image, heading); }
            }
            push(heading, f); n++;
          });
          if (!n) add('error', label + ' "' + group + '": no "## heading" entries found');
        }
        return;
      }

      const sec = SECTIONS[kind];
      const title = String(fm[sec.title] || fm.title || conv.title || '').trim();
      if (!title) return add('error', sec.label + ': missing "' + sec.title + ':"');
      const f = {}; f[sec.title] = title;

      if (kind === 'news') {
        f.text = text0;
        let ex = fm.excerpt ? String(fm.excerpt) : firstParagraph(text0, 220);
        if (!fm.excerpt) { if (ex) add('info', '"' + title + '": short summary was taken from the first paragraph'); }
        if (!ex && !upd) return add('error', 'News "' + title + '": needs an "excerpt:" line or some body text');
        f.excerpt = ex;
        if (!text0) add('warning', 'News "' + title + '" has no article text');
        if (fm.category) {
          f.category = String(fm.category);
          if (cats.length && cats.indexOf(f.category) < 0) add('warning', '"' + title + '": category "' + f.category + '" is not in the news category list (' + cats.join(', ') + ')');
        }
        if (fm.date) {
          const d = normDate(fm.date);
          if (d.ok) f.date = d.value; else add('warning', '"' + title + '": date "' + fm.date + '" was not understood. Use 2026-11-10 or 10-11-2026.');
        }
        if (fm.image) { f.image = cleanImage(fm.image); checkImg(f.image, title); }
      } else if (kind === 'services') {
        f.details = text0;
        const brief = fm.short || fm.description || fm.excerpt;
        f.description = brief ? String(brief) : firstParagraph(text0, 260);
        if (!brief && f.description) add('info', '"' + title + '": the brief was taken from the first paragraph');
        if (!f.description && !upd) return add('error', 'Service "' + title + '": needs a "short:" line or some body text');
        if (fm.icon) f.icon = String(fm.icon);
        if (fm.page) f.page = String(fm.page);
        if (fm.image) add('warning', '"' + title + '": services have no picture field, "image" was ignored');
      } else if (kind === 'testimonials') {
        f.text = text0.replace(/\n+/g, ' ').trim();
        if (!f.text && !upd) return add('error', 'Testimonial "' + title + '": the body is empty');
        if (fm.role) f.role = String(fm.role);
      } else if (kind === 'employees') {
        const pos = fm.role || fm.position;
        if (!pos && !upd) return add('error', 'Team member "' + title + '": missing "role:"');
        f.position = pos ? String(pos) : '';
        if (fm.image) { f.image = cleanImage(fm.image); checkImg(f.image, title); }
        if (text0) add('info', '"' + title + '": the site has no biography field, so the body text was ignored');
      } else if (kind === 'carousel') {
        const sub = fm.subtitle || fm.short || firstParagraph(text0, 160);
        if (sub) f.subtitle = String(sub);
        if (fm.tag) f.tag = String(fm.tag);
        if (fm.image) { f.image = cleanImage(fm.image); checkImg(f.image, title); } else add('warning', 'Slide "' + title + '" has no image');
      } else if (kind === 'jurisdictions') {
        const sp = splitCountry(text0);
        f.brief = sp.brief; if (sp.details) f.details = sp.details;
        if (!f.brief && !upd) return add('error', 'Country "' + title + '": the body (overview) is empty');
        if (fm.code) f.code = String(fm.code).toLowerCase();
        if (fm.tag) f.tag = String(fm.tag);
      }

      items.push(Object.assign(base, { slug: slugify(fm.slug || title), title: title, fields: f }));
    });

    /* same section + title + language twice in one batch: the later one wins */
    const seen = new Map();
    for (const it of items) {
      const key = it.kind + '|' + (it.id || it.slug) + '|' + it.lang;
      if (seen.has(key)) issues.push({ chunk: it._chunk, level: 'warning', message: 'Duplicate "' + it.title + '" (' + it.lang + '): the later one is used' });
      seen.set(key, it);
    }
    items = Array.from(seen.values());
    return { items: items, issues: issues, ok: !issues.some(function (i) { return i.level === 'error'; }), summary: summarize(items) };
  }

  function summarize(items) {
    const o = {};
    for (const it of items) { const k = it.kind + ' (' + it.lang + ')'; o[k] = (o[k] || 0) + 1; }
    return o;
  }

  /* ---------- apply to the site data ---------- */
  /* en: the main data object (app-data.json). ar: the Arabic file object (app-data.ar.json), changed in place.
     Returns a report [{action:'add'|'update', kind, lang, title}]. Nothing is written to GitHub here. */
  function applyContent(items, en, ar, opts) {
    opts = opts || {};
    const report = [];
    const nextId = function (arr) { return String(Math.max.apply(null, [0].concat(arr.map(function (x) { return +x.id || 0; }))) + 1); };
    const has = function (v) { return String(v == null ? '' : v).trim() !== ''; };

    for (const it of items) {
      if (it.kind === 'pagetext') {
        ar.pageText = ar.pageText || {};
        ar.pageText[it.fields.page] = Object.assign(ar.pageText[it.fields.page] || {}, it.fields.entries);
        report.push({ action: 'update', kind: 'pagetext', lang: 'ar', title: it.title });
        continue;
      }
      if (it.kind === 'about') {
        const target = it.lang === 'ar' ? ar : en;
        Object.assign(target, it.fields);
        report.push({ action: 'update', kind: 'about', lang: it.lang, title: it.title });
        continue;
      }
      const sec = SECTIONS[it.kind];
      en[it.kind] = en[it.kind] || [];
      const list = en[it.kind];
      const tf = sec.title;
      const slug = slugify(it.fields[tf]);
      let row = null;

      const same = function (x) { return slugify(x[tf]) === slug && (!GROUPED[it.kind] || groupKey(x.group) === groupKey(it.fields.group)); };
      if (it.id) row = list.find(function (x) { return String(x.id) === it.id; }) || null;
      if (!row) row = list.find(same) || null;

      if (it.lang === 'en') {
        if (row) {
          for (const k of Object.keys(it.fields)) if (has(it.fields[k])) row[k] = it.fields[k];
          report.push({ action: 'update', kind: it.kind, lang: 'en', title: it.title });
        } else {
          const o = { id: nextId(list) };
          const blank = SECTIONS_BLANK[it.kind];
          blank.forEach(function (k) { o[k] = ''; });
          for (const k of Object.keys(it.fields)) o[k] = it.fields[k];
          if (it.kind === 'news' && !o.category) o.category = (opts.categories || []).filter(Boolean)[0] || 'General';
          fillRequired(it.kind, o);
          list.push(o);
          report.push({ action: 'add', kind: it.kind, lang: 'en', title: it.title });
        }
        continue;
      }

      /* Arabic: fill the translated fields in the Arabic file. A matching English item is found by id or by name. */
      ar[it.kind] = ar[it.kind] || [];
      if (!row) {
        const orow = ar[it.kind].find(function (x) { return slugify(x[tf]) === slug && (!GROUPED[it.kind] || groupKey(x.group || it.fields.group) === groupKey(it.fields.group)); });
        if (orow) row = list.find(function (x) { return String(x.id) === String(orow.id); }) || null;
      }
      let action = 'update';
      if (!row) { /* no English counterpart: make the item (Arabic text in the main file too, so it exists in both) */
        row = { id: nextId(list) };
        SECTIONS_BLANK[it.kind].forEach(function (k) { row[k] = ''; });
        for (const k of Object.keys(it.fields)) if (k !== 'pageContent') row[k] = it.fields[k];
        if (it.kind === 'news' && !row.category) row.category = (opts.categories || []).filter(Boolean)[0] || 'General';
        fillRequired(it.kind, row);
        list.push(row);
        action = 'add';
      } else {
        /* non-translated fields (image, date, icon, page, code, category) still come along when the file has them */
        for (const k of Object.keys(it.fields)) if (sec.ar.indexOf(k) < 0 && has(it.fields[k])) row[k] = it.fields[k];
      }
      let o = ar[it.kind].find(function (x) { return String(x.id) === String(row.id); });
      if (!o) { o = { id: row.id }; ar[it.kind].push(o); }
      for (const k of sec.ar) if (has(it.fields[k])) o[k] = it.fields[k];
      report.push({ action: action, kind: it.kind, lang: 'ar', title: it.title });
    }
    return report;
  }

  /* the admin refuses to save an item with an empty required field, so a new item gets a sensible fill */
  function fillRequired(kind, o) {
    const e = function (k, from) { if (!String(o[k] || '').trim()) o[k] = o[from] || '-'; };
    if (kind === 'news') e('excerpt', 'title'); else if (kind === 'services') e('description', 'title');
    else if (kind === 'testimonials') e('text', 'name'); else if (kind === 'employees') e('position', 'name');
    else if (kind === 'faq') e('answer', 'question');
  }

  const SECTIONS_BLANK = {
    news: ['title', 'image', 'excerpt', 'text', 'category'],
    services: ['title', 'description', 'icon', 'page', 'details', 'pageContent'],
    testimonials: ['name', 'role', 'text'],
    employees: ['name', 'position', 'image'],
    carousel: ['title', 'subtitle', 'tag', 'image'],
    jurisdictions: ['country', 'code', 'tag', 'brief', 'details'],
    faq: ['group', 'question', 'answer'],
    cards: ['group', 'title', 'description', 'icon', 'image', 'link', 'badge', 'price', 'ctaText', 'ctaLink'],
    gallery: ['group', 'image', 'caption', 'alt']
  };
  /* these sections are kept in named groups; an entry is matched by group + title */
  const GROUPED = { faq: 1, cards: 1, gallery: 1 };
  const groupKey = function (g) { return slugify(g == null || String(g).trim() === '' ? 'general' : g); };


  /* ---------- export: the current site content back to the same Markdown format ---------- */
  const one = function (v) { return String(v == null ? '' : v).replace(/\s*\n\s*/g, ' ').trim(); };
  /* sections: array of 'carousel','news','services','testimonials','employees','jurisdictions','about'; lang: 'en' | 'ar'
     Returns { md, items:[{lang, meta:[lines], body}], skipped } . Arabic export only includes items that have Arabic text. */
  function exportContent(en, ar, opts) {
    opts = opts || {};
    const lang = opts.lang === 'en' ? 'en' : 'ar';
    const want = opts.sections || Object.keys(SECTIONS).concat(['about', 'pagetext']);
    const out = []; let skipped = 0;
    const ovl = function (kind, row) {
      if (lang === 'en') return Object.assign({}, row);
      const o = ((ar && ar[kind]) || []).find(function (x) { return String(x.id) === String(row.id); });
      if (!o) return null;
      const r = Object.assign({}, row);
      SECTIONS[kind].ar.forEach(function (k) { if (String(o[k] == null ? '' : o[k]).trim()) r[k] = o[k]; else if (k !== 'pageContent') r[k] = ''; });
      return r;
    };
    const meta = function (type, id, pairs) {
      const m = ['type: ' + type];
      if (id !== '' && id != null) m.push('id: ' + id);
      pairs.forEach(function (p) { if (one(p[1]) !== '') m.push(p[0] + ': ' + one(p[1])); });
      m.push('lang: ' + lang);
      return m;
    };
    const order = ['carousel', 'news', 'services', 'testimonials', 'employees', 'jurisdictions'];
    order.forEach(function (kind) {
      if (want.indexOf(kind) < 0) return;
      ((en && en[kind]) || []).forEach(function (row0) {
        const r = ovl(kind, row0);
        if (!r) { skipped++; return; }
        let m, body = '';
        if (kind === 'carousel') m = meta('carousel', r.id, [['title', r.title], ['subtitle', r.subtitle], ['tag', r.tag], ['image', r.image]]);
        else if (kind === 'news') { m = meta('blog', r.id, [['title', r.title], ['excerpt', r.excerpt], ['category', r.category], ['date', r.date], ['image', r.image]]); body = r.text; }
        else if (kind === 'services') { m = meta('service', r.id, [['title', r.title], ['short', r.description], ['icon', r.icon], ['page', r.page]]); body = r.details; }
        else if (kind === 'testimonials') { m = meta('testimonial', r.id, [['name', r.name], ['role', r.role]]); body = r.text; }
        else if (kind === 'employees') m = meta('team', r.id, [['name', r.name], ['role', r.position], ['image', r.image]]);
        else { m = meta('country', r.id, [['country', r.country], ['code', r.code], ['tag', r.tag]]); body = String(r.brief || '') + (String(r.details || '').trim() ? '\n\n## ' + (lang === 'ar' ? 'تفاصيل التقديم' : 'Filing details') + '\n' + r.details : ''); }
        out.push({ lang: lang, kind: kind, meta: m, body: String(body || '').trim() });
      });
    });
    /* faq, cards (type: items) and gallery: one block per group */
    ['faq', 'cards', 'gallery'].forEach(function (kind) {
      if (want.indexOf(kind) < 0) return;
      const groups = new Map();
      ((en && en[kind]) || []).forEach(function (row0) {
        const r = ovl(kind, row0);
        if (!r) { skipped++; return; }
        const g = String(r.group || '').trim() || 'general';
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g).push(r);
      });
      groups.forEach(function (rows, g) {
        const type = kind === 'cards' ? 'items' : kind;
        const m = ['type: ' + type, 'group: ' + g, 'lang: ' + lang];
        const demote = function (t) { return String(t || '').trim().replace(/^##(?=\s)/gm, '###'); };
        let body;
        if (kind === 'gallery') body = rows.map(function (r) { return [r.image, one(r.caption), one(r.alt)].join(' | ').replace(/(\s\|\s*)+$/, ''); }).join('\n');
        else if (kind === 'faq') body = rows.map(function (r) { return '## ' + one(r.question) + '\n' + demote(r.answer) + '\nid: ' + r.id; }).join('\n\n');
        else body = rows.map(function (r) {
          const extra = [['icon', r.icon], ['image', r.image], ['link', r.link], ['badge', r.badge], ['price', r.price], ['cta_text', r.ctaText], ['cta_link', r.ctaLink]]
            .filter(function (p) { return one(p[1]) !== ''; }).map(function (p) { return p[0] + ': ' + one(p[1]); });
          return ['## ' + one(r.title)].concat(demote(r.description) ? [demote(r.description)] : [], extra, ['id: ' + r.id]).join('\n');
        }).join('\n\n');
        out.push({ lang: lang, kind: kind, meta: m, body: body });
      });
    });
    if (want.indexOf('about') >= 0) {
      const src = lang === 'en' ? en : ar;
      if (src && (String(src.aboutMainText || '').trim() || String(src.about || '').trim())) {
        out.push({ lang: lang, kind: 'about', meta: ['type: about'].concat(one(src.about) ? ['tagline: ' + one(src.about)] : [], ['lang: ' + lang]), body: String(src.aboutMainText || '').trim() });
      } else skipped++;
    }
    if (want.indexOf('pagetext') >= 0 && opts.pageTexts) {   // opts.pageTexts: {stem: [[key, English text], ...]}
      Object.keys(opts.pageTexts).forEach(function (stem) {
        const have = ((ar && ar.pageText) || {})[stem] || {};
        const rows = opts.pageTexts[stem].filter(function (r) { return r[0] !== '_title' || true; });
        if (!rows.length) { skipped++; return; }
        const body = rows.map(function (r) {
          const val = lang === 'ar' ? String(have[r[0]] || '').trim() : String(r[1] || '').trim();
          const eng = lang === 'ar' ? '<!-- EN: ' + one(r[1]) + ' -->\n' : '';
          return '## ' + r[0] + '\n' + eng + val;
        }).join('\n\n');
        out.push({ lang: lang, kind: 'pagetext', meta: ['type: pagetext', 'page: ' + stem, 'lang: ' + lang], body: body });
      });
    }
    const md = out.map(function (it) { return '---\n' + it.meta.join('\n') + '\n---\n' + it.body; }).join('\n===\n') + (out.length ? '\n' : '');
    return { md: md, items: out, skipped: skipped };
  }

  /* the site's own text format (## subtitle, **bold**, - bullet) -> simple HTML, used for the Word (.doc) export */
  function khipToHtml(body) {
    const e = function (x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    const b = function (x) { return e(x).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); };
    const out = []; let list = false;
    String(body || '').split('\n').forEach(function (l) {
      let m;
      if ((m = l.match(/^- (.*)$/))) { if (!list) { out.push('<ul>'); list = true; } out.push('<li>' + b(m[1]) + '</li>'); return; }
      if (list) { out.push('</ul>'); list = false; }
      if ((m = l.match(/^## (.*)$/))) out.push('<h2>' + b(m[1]) + '</h2>');
      else if (l.trim()) out.push('<p>' + b(l) + '</p>');
    });
    if (list) out.push('</ul>');
    return out.join('');
  }
  function exportWordHtml(items) {
    const e = function (x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    const parts = items.map(function (it) {
      const dir = it.lang === 'ar' ? 'rtl' : 'ltr';
      return '<div dir="' + dir + '" style="direction:' + dir + ';text-align:' + (dir === 'rtl' ? 'right' : 'left') + '">' + it.meta.map(function (m) { return '<p>' + e(m) + '</p>'; }).join('') + khipToHtml(it.body) + '</div>';
    });
    return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;font-size:12pt}</style></head><body>' + parts.join('<p>===</p>') + '</body></html>';
  }

  const api = { exportContent: exportContent, exportWordHtml: exportWordHtml, khipToHtml: khipToHtml, parseContent: parseContent, applyContent: applyContent, mdToKhip: mdToKhip, slugify: slugify, summarize: summarize, SECTIONS: SECTIONS, TYPE_ALIASES: TYPE_ALIASES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KImport = api;
})(typeof window !== 'undefined' ? window : globalThis);
