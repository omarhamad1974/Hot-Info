/* word-import.js
   Automatic Word (.docx) to Markdown conversion, done in the browser. The file never leaves the computer.
   Uses the free "mammoth" library (loaded from jsDelivr the first time a .docx is chosen).

   How a Word file is read:
   - Heading 1/2/3, bold, italic, bullet and numbered lists, tables and links become Markdown.
   - Pictures inside the Word file are skipped (upload pictures in the admin and name them with "image:").
   - At the top of each item you may type plain lines like  "type: blog"  "title: ..."  "excerpt: ..."  "category: ..."  "date: ..."
     (no --- lines needed: Word turns --- into a line). Several items in one file are separated by a line containing ===.
   - A file with no such lines is read with the default type chosen on the import screen: one item per "Heading 1".
   Works in the browser (window.KWord) and in Node for tests (needs a DOM passed in). */
(function (root) {
  'use strict';

  const MAMMOTH_URL = 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js';
  const KEYS = ['type', 'title', 'name', 'country', 'slug', 'id', 'lang', 'status', 'excerpt', 'short', 'description', 'image', 'category', 'author', 'date',
    'icon', 'page', 'price', 'role', 'position', 'code', 'tag', 'tagline', 'group', 'order', 'cta_text', 'cta_link', 'seo_title', 'seo_description'];

  function loadMammoth() {
    if (root.mammoth) return Promise.resolve(root.mammoth);
    return new Promise(function (res, rej) {
      const s = document.createElement('script');
      s.src = MAMMOTH_URL; s.async = true;
      s.onload = function () { root.mammoth ? res(root.mammoth) : rej(new Error('The Word converter did not load.')); };
      s.onerror = function () { rej(new Error('Could not load the Word converter (check the internet connection).')); };
      document.head.appendChild(s);
    });
  }

  /* ---------- HTML (from mammoth) to Markdown ---------- */
  function htmlToMd(rootEl) {
    const out = [];
    const clean = function (t) { return t.replace(/ /g, ' ').replace(/[ \t]+/g, ' '); };

    function inline(node) {
      let s = '';
      node.childNodes.forEach(function (c) {
        if (c.nodeType === 3) { s += clean(c.nodeValue); return; }
        if (c.nodeType !== 1) return;
        const tag = c.tagName.toLowerCase();
        const inner = inline(c);
        if (tag === 'strong' || tag === 'b') s += inner.trim() ? '**' + inner.trim() + '** ' : '';
        else if (tag === 'em' || tag === 'i') s += inner.trim() ? '*' + inner.trim() + '* ' : '';
        else if (tag === 'a') { const h = c.getAttribute('href'); s += h && /^(https?:|mailto:|tel:)/.test(h) && inner.trim() ? '[' + inner.trim() + '](' + h + ')' : inner; }
        else if (tag === 'br') s += ' ';
        else if (tag === 'img') { /* skipped */ }
        else s += inner;
      });
      return s;
    }
    const tidy = function (s) { return s.replace(/\*\*\s*\*\*/g, '').replace(/ +\n/g, '\n').replace(/\s+([.,;:!?،؛])/g, '$1').replace(/ {2,}/g, ' ').trim(); };

    function list(el, depth, ordered) {
      let n = 0;
      el.childNodes.forEach(function (li) {
        if (li.nodeType !== 1 || li.tagName.toLowerCase() !== 'li') return;
        n++;
        const clone = li.cloneNode(true);
        clone.querySelectorAll('ul,ol').forEach(function (x) { x.remove(); });
        const t = tidy(inline(clone));
        if (t) out.push('  '.repeat(depth) + (ordered ? n + '. ' : '- ') + t);
        li.querySelectorAll(':scope > ul, :scope > ol').forEach(function (sub) { list(sub, depth + 1, sub.tagName.toLowerCase() === 'ol'); });
      });
      out.push('');
    }

    function block(node) {
      node.childNodes.forEach(function (c) {
        if (c.nodeType === 3) { const t = c.nodeValue.trim(); if (t) { out.push(clean(t)); out.push(''); } return; }
        if (c.nodeType !== 1) return;
        const tag = c.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) { const t = tidy(inline(c)).replace(/\*\*/g, ''); if (t) { out.push('#'.repeat(+tag[1]) + ' ' + t); out.push(''); } }
        else if (tag === 'p') { const t = tidy(inline(c)); if (t) { out.push(t); out.push(''); } }
        else if (tag === 'ul' || tag === 'ol') list(c, 0, tag === 'ol');
        else if (tag === 'table') {
          c.querySelectorAll('tr').forEach(function (tr) {
            const cells = Array.from(tr.children).map(function (td) { return tidy(inline(td)).replace(/\|/g, '/'); });
            if (cells.some(Boolean)) out.push('| ' + cells.join(' | ') + ' |');
          });
          out.push('');
        }
        else if (tag === 'blockquote') block(c);
        else block(c);
      });
    }
    block(rootEl);
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  /* ---------- Word text (type: / title: lines at the top of each item) to the Markdown the importer reads ---------- */
  const MULTI_TYPES = ['faq', 'items', 'item', 'cards', 'card', 'gallery'];
  const META = new RegExp('^\\**(' + KEYS.join('|') + ')\\s*:\\**\\s*(.*)$', 'i');
  const straight = function (s) { return s.replace(/[“”„]/g, '"').replace(/[‘’]/g, "'").replace(/ /g, ' '); };

  function chunkToItem(lines, defaultType) {
    const meta = []; let i = 0;
    while (i < lines.length && !lines[i].trim()) i++;
    for (; i < lines.length; i++) {
      const l = straight(lines[i]).trim();
      if (!l) continue; // Word puts a blank line between paragraphs
      const m = l.match(META);
      if (!m) break;
      /* Word turns a typed web address into a link, which arrives as [address](address): keep just the address */
      let val = m[2].replace(/^\*+|\*+$/g, '').trim();
      const lk = val.match(/^\[[^\]]*\]\(\s*([^)\s]+)\s*\)$/);
      if (lk) val = lk[1];
      meta.push(m[1].toLowerCase() + ': ' + val);
    }
    return { meta: meta, body: lines.slice(i).join('\n').trim() };
  }

  /* md: markdown from htmlToMd. opts.group: group name for faq / items / gallery Word files. opts.defaultType: 'blog' | 'service' | 'country' | 'about' ...  */
  function normalize(md, opts) {
    opts = opts || {};
    const text = String(md).replace(/^﻿/, '').trim();
    if (/^---\s*\n/.test(text)) return text; // already in the normal MD format
    const defaultType = opts.defaultType || 'blog';
    const chunks = text.split(/^\s*={3,}\s*$/m);
    const items = [];
    chunks.forEach(function (ch) {
      if (!ch.trim()) return;
      const it = chunkToItem(ch.split('\n'), defaultType);
      const hasType = it.meta.some(function (m) { return /^type:/.test(m); });
      const typeLine = (it.meta.filter(function (m) { return /^type:/.test(m); })[0] || '').replace(/^type:\s*/, '').toLowerCase();
      const eff = hasType ? typeLine : defaultType;
      if (MULTI_TYPES.indexOf(eff) >= 0) {
        /* faq / items / gallery: the whole block is ONE group. Heading 1 or 2 starts an entry (faq, items). */
        const meta = it.meta.slice();
        if (!hasType) meta.unshift('type: ' + defaultType);
        if (!meta.some(function (m) { return /^group:/.test(m); })) meta.push('group: ' + (opts.group || 'general'));
        const body = eff === 'gallery' ? it.body : it.body.replace(/^#{1,2}[ \t]+(?=\S)/gm, '## ');
        items.push({ meta: meta, body: body.trim() });
        return;
      }
      if (!it.meta.length && !hasType) {
        /* no metadata: one item per Heading 1 */
        const parts = it.body.split(/^(?=# [^#])/m).filter(function (p) { return p.trim(); });
        parts.forEach(function (p) { items.push({ meta: ['type: ' + defaultType], body: p.trim() }); });
        return;
      }
      if (!hasType) it.meta.unshift('type: ' + defaultType);
      items.push(it);
    });
    return items.map(function (it) { return '---\n' + it.meta.join('\n') + '\n---\n' + it.body; }).join('\n===\n');
  }

  /* ---------- the Word file ---------- */
  async function docxToHtml(file) {
    const m = await loadMammoth();
    const buf = await file.arrayBuffer();
    const opts = { arrayBuffer: buf, styleMap: ["p[style-name='Title'] => h1:fresh", "p[style-name='Subtitle'] => h2:fresh"] };
    opts.convertImage = m.images.imgElement(function () { return Promise.resolve({ src: '' }); });
    return m.convertToHtml(opts);
  }

  /* returns { md, note } : md has no type/frontmatter handling yet (call normalize with the chosen default type) */
  async function docxToMd(file, parseHtml) {
    const r = await docxToHtml(file);
    const doc = (parseHtml || function (h) { return new DOMParser().parseFromString(h, 'text/html'); })(r.value);
    const pics = doc.querySelectorAll('img').length;
    const md = htmlToMd(doc.body);
    let note = 'Converted from Word.';
    if (pics) note += ' ' + pics + ' picture' + (pics === 1 ? '' : 's') + ' inside the Word file ' + (pics === 1 ? 'was' : 'were') + ' skipped: upload pictures separately.';
    if (!md) throw new Error('The Word file has no text.');
    return { md: md, note: note };
  }

  const api = { docxToMd: docxToMd, htmlToMd: htmlToMd, normalize: normalize, KEYS: KEYS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KWord = api;
})(typeof window !== 'undefined' ? window : globalThis);
