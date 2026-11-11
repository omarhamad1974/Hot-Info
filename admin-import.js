/* admin-import.js
   "Import from files" screen of the admin (Website content). Reads .md files and .docx Word files (converted to Markdown
   in the browser), optionally uploads the pictures they mention, shows a preview of what will be added or updated,
   then applies it to the content in the page. Text is not written to GitHub until the usual "Save to GitHub" button is pressed.
   Pictures are uploaded to assets/ when you press "Add to the website content" (same as the normal picture upload).
   The screen has its own English / Arabic switch (button inside the screen).
   Uses globals of admin.html (D, DEN, DAR, lang, S, sha, shaAR, ASSETS, FIT, fit, shrink, toast, mark, tabs, view, api, b64, mirror, compact, arPath, unb64, $, esc)
   and KImport (content-import.js), KWord (word-import.js). */
(function () {
  'use strict';
  const KIMP = window.KIMP = { pending: false, enTouched: false, arTouched: false };
  const MAX = 2 * 1048576;  // 2 MB per text file
  let files = [];           // [{name, text | raw, isWord, note, error}]
  let pics = [];            // [{name, file}] pictures chosen on the screen
  let result = null;        // {items, issues, ok, report}
  let dlang = 'ar';         // language of files with no lang: line
  let wgroup = '';          // group name used for Word files of type faq / items / gallery
  let wtype = 'blog';       // what a Word file without "type:" lines is read as
  let ul = 'en';            // screen language
  let mode = '';            // '' = general import screen, 'blog' = the News "Import blogs" screen (every item is a news article by default)
  let dlpics = true;        // blog screen: copy pictures given as web links into the site when the website allows it
  const EXS = ['carousel', 'news', 'services', 'testimonials', 'employees', 'jurisdictions', 'faq', 'cards', 'gallery', 'about', 'pagetext'];
  const exSel = {}; EXS.forEach(k => { exSel[k] = true; });
  let exLang = 'ar', exOpen = false;

  /* ---------- screen texts ---------- */
  const T = {
    title: ['Import content from files', 'استيراد المحتوى من ملفات'],
    close: ['Close', 'إغلاق'],
    lang_lbl: ['Language of files that have no "lang:" line', 'لغة الملفات التي ليس بها سطر "lang:"'],
    arabic: ['Arabic', 'العربية'], english: ['English', 'الإنجليزية'],
    choose: ['Choose files', 'اختر الملفات'], more: ['Add more files', 'أضف ملفات أخرى'],
    help_md: ['Markdown (.md) files.', 'ملفات ماركداون (.md).'],
    help_word: ['Markdown (.md) and Word (.docx) files. Word files are converted to Markdown automatically.', 'ملفات ماركداون (.md) وملفات وورد (.docx). يتم تحويل ملفات وورد إلى ماركداون تلقائيا.'],
    help_more: ['One file can hold many items (see the templates). Importing the same file again updates the items instead of duplicating them.', 'يمكن للملف الواحد أن يحتوي عدة عناصر (انظر النماذج). استيراد نفس الملف مرة أخرى يحدّث العناصر ولا يكررها.'],
    guide: ['Guide and templates', 'الدليل والنماذج'],
    wtype: ['Word files without a "type:" line are read as', 'ملفات وورد التي ليس بها سطر "type:" تُقرأ على أنها'],
    w_blog: ['News articles (one per Heading 1)', 'أخبار (خبر لكل عنوان رئيسي)'], w_service: ['Services (one per Heading 1)', 'خدمات (خدمة لكل عنوان رئيسي)'],
    w_country: ['Countries (one per Heading 1)', 'دول (دولة لكل عنوان رئيسي)'], w_carousel: ['Carousel slides (one per Heading 1)', 'شرائح السلايدر (شريحة لكل عنوان رئيسي)'], w_about: ['About text', 'نص من نحن'],
    w_faq: ['FAQ (one question per Heading 1 or 2)', 'أسئلة شائعة (سؤال لكل عنوان رئيسي أو فرعي)'], w_items: ['Cards (one card per Heading 1 or 2)', 'بطاقات (بطاقة لكل عنوان رئيسي أو فرعي)'], w_gallery: ['Gallery (one line per picture: file | caption | alt)', 'معرض صور (سطر لكل صورة: ملف | تعليق | نص بديل)'],
    wgroup: ['Group name for FAQ / cards / gallery', 'اسم المجموعة للأسئلة / البطاقات / المعرض'], wgroup_ph: ['general', 'general'],
    dl_md: ['Download the converted Markdown file', 'تنزيل ملف الماركداون المحوّل'],
    pics_btn: ['Choose pictures', 'اختر الصور'], pics_none: ['Optional: choose the pictures the files mention (by file name). They are uploaded when you add the content.', 'اختياري: اختر الصور المذكورة في الملفات (بنفس اسم الملف). يتم رفعها عند إضافة المحتوى.'],
    pic_up: ['will be uploaded', 'سيتم رفعها'], pic_have: ['already in assets', 'موجودة بالفعل في assets'], pic_unused: ['not used by any item', 'غير مستخدمة في أي عنصر'],
    ready: ['ready', 'جاهز'], item: ['item', 'عنصر'], items: ['items', 'عناصر'],
    problems: ['problem(s), those parts are skipped', 'مشكلة، يتم تخطي هذه الأجزاء'],
    nothing: ['Nothing can be imported yet.', 'لا يوجد ما يمكن استيراده بعد.'],
    apply: ['Add to the website content', 'أضف إلى محتوى الموقع'],
    isnew: ['New', 'جديد'], upd: ['Update', 'تحديث'],
    s_news: ['News', 'الأخبار'], s_services: ['Services', 'الخدمات'], s_testimonials: ['Testimonials', 'آراء العملاء'], s_employees: ['Team', 'الفريق'],
    s_jurisdictions: ['Countries', 'الدول'], s_carousel: ['Carousel', 'السلايدر'], s_faq: ['FAQ', 'الأسئلة الشائعة'], s_cards: ['Cards (items)', 'البطاقات'], s_gallery: ['Gallery', 'المعرض'], s_about: ['About text', 'نص من نحن'], s_pagetext: ['Page text (About, Patents...)', 'نصوص الصفحات (من نحن، براءات...)'],
    t_done: ['Imported: {a} new, {u} updated. Check them, then press Save to GitHub.', 'تم الاستيراد: {a} جديد، {u} محدّث. راجعها ثم اضغط حفظ في GitHub.'],
    t_reload: ['Reload the page first.', 'أعد تحميل الصفحة أولا.'],
    t_pic_fail: ['Could not upload picture {n}: {e}', 'تعذر رفع الصورة {n}: {e}'],
    t_pic_big: ['Picture {n} is still over 3 MB. Compress it first.', 'الصورة {n} ما زالت أكبر من 3 ميجابايت. اضغطها أولا.'],
    saving: ['Saving...', 'جار الحفظ...'], saved: ['Saved. The site updates in a minute or two.', 'تم الحفظ. يتحدث الموقع خلال دقيقة أو دقيقتين.'],
    ex_title: ['Export current content to files', 'تصدير المحتوى الحالي إلى ملفات'],
    ex_help: ['Download what is on the site now, edit it offline, then import it again: items are matched by their id, so they are updated, not duplicated.', 'نزّل ما هو موجود الآن في الموقع، عدّله دون اتصال، ثم استورده مرة أخرى: تتم مطابقة العناصر برقم id فيتم تحديثها وليس تكرارها.'],
    ex_lang: ['Language to export', 'لغة التصدير'], ex_md: ['Download .md', 'تنزيل .md'], ex_word: ['Download for Word (.doc)', 'تنزيل لـ Word (.doc)'],
    ex_word_note: ['Open the .doc in Word and save it as .docx before importing it again.', 'افتح ملف .doc في Word واحفظه بصيغة .docx قبل استيراده مرة أخرى.'],
    ex_none: ['Nothing to export for that choice.', 'لا يوجد ما يمكن تصديره لهذا الاختيار.'],
    ex_skip: ['{n} item(s) have no Arabic text yet and were left out.', 'تم استبعاد {n} عنصر ليس له نص عربي بعد.'],
    b_title: ['Import blogs from a file', 'استيراد مجموعة مقالات من ملف'],
    b_help: ['One file (.md or .docx) can hold many blogs: each blog becomes one complete news article. Put the picture as a file name or a web link on the "image:" line.', 'يمكن للملف الواحد (.md أو .docx) أن يحتوي عدة مقالات: كل مقال يصبح خبرا كاملا. اكتب الصورة كاسم ملف أو رابط ويب في سطر "image:".'],
    b_tpl: ['Templates', 'النماذج'],
    b_dl: ['Save pictures given as web links into the site (if the website allows it; otherwise the link is kept)', 'احفظ الصور المعطاة كروابط داخل الموقع (إن سمح موقعها بذلك، وإلا يبقى الرابط)'],
    b_apply: ['Add to News', 'أضف إلى الأخبار'],
    b_col: ['Date', 'التاريخ'], b_cat: ['Category', 'التصنيف'], b_pic: ['Picture', 'الصورة'],
    b_link: ['web link', 'رابط'], b_file: ['file', 'ملف'], b_none: ['none', 'بلا'],
    t_dl_got: ['{n} picture(s) saved into the site.', 'تم حفظ {n} صورة داخل الموقع.'],
    t_dl_link: ['{n} picture(s) kept as web links (the website does not allow copying).', 'بقيت {n} صورة كروابط ويب (موقعها لا يسمح بالنسخ).'],
    switch: ['عربي', 'English']
  };
  const t = (k, o) => { let s = (T[k] || [k, k])[ul === 'ar' ? 1 : 0]; if (o) for (const x in o) s = s.replace('{' + x + '}', o[x]); return s; };

  /* messages written by the parser (English) -> Arabic */
  const SL = { News: 'الأخبار', Services: 'الخدمات', Testimonials: 'آراء العملاء', Team: 'الفريق', Countries: 'الدول', Carousel: 'السلايدر', FAQ: 'الأسئلة الشائعة', Cards: 'البطاقات', Gallery: 'المعرض' };
  const MSG = [
    [/^The file is empty$/, () => 'الملف فارغ'],
    [/^Missing frontmatter.*/, () => 'يجب أن يبدأ كل عنصر بكتلة --- (سطور type: و title:)'],
    [/^Frontmatter is not closed.*/, () => 'كتلة --- في بداية العنصر غير مغلقة'],
    [/^"(.+)" is not used by this site, so it was skipped$/, m => `النوع «${m[1]}» غير مستخدم في هذا الموقع وتم تخطيه`],
    [/^Unknown type "(.*)"\. Use one of: (.*)$/, m => `نوع غير معروف «${m[1]}». استخدم: ${m[2]}`],
    [/^lang must be ar or en \(got "(.*)"\)$/, m => `يجب أن تكون lang هي ar أو en (وجدت «${m[1]}»)`],
    [/^Skipped \(status: draft\)(.*)$/, m => 'تم التخطي (مسودة)' + m[1]],
    [/^about: write the text.*/, () => 'About: اكتب النص في المتن و/أو سطر tagline:'],
    [/^(News|Services|Testimonials|Team|Countries|Carousel|Cards): missing "(.+):"$/, m => `${SL[m[1]]}: ينقص سطر «${m[2]}:»`],
    [/^"(.+)": image "(.+)" is not in assets yet\..*$/, m => `«${m[1]}»: الصورة «${m[2]}» غير موجودة في assets. اخترها في هذه الشاشة أو ارفعها من الإدارة.`],
    [/^News "(.+)": needs an "excerpt:".*$/, m => `الخبر «${m[1]}»: يحتاج سطر excerpt: أو نصا في المتن`],
    [/^"(.+)": short summary was taken from the first paragraph$/, m => `«${m[1]}»: تم أخذ الملخص من الفقرة الأولى`],
    [/^News "(.+)" has no article text$/, m => `الخبر «${m[1]}» ليس له نص`],
    [/^"(.+)": category "(.+)" is not in the news category list \((.*)\)$/, m => `«${m[1]}»: التصنيف «${m[2]}» ليس ضمن تصنيفات الأخبار (${m[3]})`],
    [/^"(.+)": date "(.+)" was not understood\..*$/, m => `«${m[1]}»: التاريخ «${m[2]}» غير مفهوم. استخدم 2026-11-10 أو 10-11-2026.`],
    [/^"(.+)": the brief was taken from the first paragraph$/, m => `«${m[1]}»: تم أخذ الوصف المختصر من الفقرة الأولى`],
    [/^Service "(.+)": needs a "short:".*$/, m => `الخدمة «${m[1]}»: تحتاج سطر short: أو نصا في المتن`],
    [/^"(.+)": services have no picture field.*$/, m => `«${m[1]}»: الخدمات ليس لها صورة، تم تجاهل image`],
    [/^Testimonial "(.+)": the body is empty$/, m => `رأي العميل «${m[1]}»: النص فارغ`],
    [/^Team member "(.+)": missing "role:"$/, m => `عضو الفريق «${m[1]}»: ينقص سطر role:`],
    [/^"(.+)": the site has no biography field.*$/, m => `«${m[1]}»: لا توجد خانة سيرة ذاتية، تم تجاهل النص`],
    [/^Country "(.+)": the body \(overview\) is empty$/, m => `الدولة «${m[1]}»: النظرة العامة فارغة`],
    [/^Slide "(.+)" has no image$/, m => `الشريحة «${m[1]}» بلا صورة`],
    [/^(FAQ|Cards|Gallery): no "group:" line, the group name "general" was used$/, m => `${SL[m[1]]}: لا يوجد سطر group: فتم استخدام المجموعة «general»`],
    [/^(FAQ|Cards|Gallery) "(.+)": text before the first "## heading" was ignored$/, m => `${SL[m[1]]} «${m[2]}»: تم تجاهل النص الموجود قبل أول عنوان ##`],
    [/^(FAQ|Cards) "(.+)": no "## heading" entries found$/, m => `${SL[m[1]]} «${m[2]}»: لم يتم العثور على عناصر بعنوان ##`],
    [/^Gallery "(.+)": no picture lines found.*$/, m => `المعرض «${m[1]}»: لا توجد سطور صور (الصيغة: ملف.jpg | تعليق | نص بديل)`],
    [/^FAQ "(.+)" has no answer text$/, m => `السؤال «${m[1]}» ليس له إجابة`],
    [/^Duplicate "(.+)" \((ar|en)\): the later one is used$/, m => `«${m[1]}» مكرر (${m[2]}): يتم استخدام الأخير`],
    [/^Converted from Word\.(?: (\d+) pictures? inside the Word file (?:was|were) skipped: upload pictures separately\.)?$/, m => 'تم التحويل من وورد.' + (m[1] ? ` تم تخطي ${m[1]} صورة داخل ملف وورد: اخترها بشكل منفصل.` : '')],
    [/^pagetext: missing "page:".*$/, () => 'نصوص الصفحات: ينقص سطر page: (about أو patents أو trademarks أو translation)'],
    [/^pagetext: unknown page "(.*)"\. Use one of: (.*)$/, m => `نصوص الصفحات: صفحة غير معروفة «${m[1]}». استخدم: ${m[2]}`],
    [/^pagetext "(.+)": the fixed page text is only translated into Arabic.*$/, m => `نصوص الصفحات «${m[1]}»: النصوص الثابتة تُترجم للعربية فقط، تم تخطي هذا العنصر الإنجليزي`],
    [/^pagetext "(.+)": "(.+)" is not a text of that page, so it was skipped$/, m => `نصوص الصفحات «${m[1]}»: «${m[2]}» ليس من نصوص هذه الصفحة وتم تخطيه`],
    [/^pagetext "(.+)": no "## key" entries with text found$/, m => `نصوص الصفحات «${m[1]}»: لا توجد عناصر "## key" بها نص`],
    [/^"(.+)": no picture \(add an "image:" line.*$/, m => `«${m[1]}»: بلا صورة (أضف سطر image: باسم ملف أو رابط)`],
    [/^"(.+)": no date, today's date will be used$/, m => `«${m[1]}»: بلا تاريخ، سيتم استخدام تاريخ اليوم`],
    [/^Too large \(limit 2 MB\)\.$/, () => 'الملف كبير جدا (الحد 2 ميجابايت)'],
    [/^Not a \.md, \.markdown or \.txt file\.$/, () => 'ليس ملف .md أو .markdown أو .txt'],
    [/^Could not convert the Word file: (.*)$/, m => 'تعذر تحويل ملف وورد: ' + m[1]]
  ];
  const msg = s => { if (ul !== 'ar') return s; for (const [re, f] of MSG) { const m = s.match(re); if (m) return f(m); } return s; };

  const clone = o => JSON.parse(JSON.stringify(o || {}));
  const enData = () => (lang === 'ar' ? DEN : D);
  const catsOf = () => (enData().newsCategories || []).filter(Boolean).concat(((DAR && DAR.newsCategories) || []).filter(Boolean));
  const el = h => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; };
  const safeName = n => n.replace(/[^\w.\-]/g, '-');
  const sectionLabel = k => t('s_' + k);

  function close() { const m = document.getElementById('imp-modal'); if (m) m.remove(); files = []; pics = []; result = null; }

  async function ensurePT() { // the fixed texts of the About / Patents / Trademarks / Translation pages (read from the page files)
    try { if (typeof PT !== 'undefined' && PT === null) await loadPT(); } catch (_) { /* optional */ }
    return typeof PT !== 'undefined' && PT ? PT : {};
  }
  const pageKeys = pt => { const o = {}; Object.keys(pt).forEach(k => { o[k] = pt[k].map(r => r[0]); }); return o; };

  async function ensureAr() {
    if (DAR !== null) return;
    try { const j = await api(arPath(), { query: '?ref=' + encodeURIComponent(S.b) }); DAR = JSON.parse(unb64(j.content)); shaAR = j.sha; }
    catch (e) { if (e.status === 404) { DAR = {}; shaAR = ''; } else throw e; }
  }

  /* ---------- reading the chosen files ---------- */
  async function readFile(f) {
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    if (f.size > MAX) return { name: f.name, error: 'Too large (limit 2 MB).' };
    if (ext === 'md' || ext === 'markdown' || ext === 'txt') return { name: f.name, text: await f.text() };
    if (ext === 'docx' && window.KWord) {
      try { const r = await KWord.docxToMd(f); return { name: f.name, raw: r.md, isWord: true, note: r.note }; }
      catch (e) { return { name: f.name, error: 'Could not convert the Word file: ' + (e.message || e) }; }
    }
    return { name: f.name, error: 'Not a .md, .markdown or .txt file.' };
  }
  async function onFiles(list) { for (const f of list) files.push(await readFile(f)); await preview(); }
  async function onPics(list) {
    for (const f of list) if (/^image\//.test(f.type) && !pics.some(p => p.name.toLowerCase() === f.name.toLowerCase())) pics.push({ name: f.name, file: f });
    await preview();
  }

  /* ---------- preview (a dry run on copies, nothing changes yet) ---------- */
  const known = () => new Set(ASSETS.map(a => a.toLowerCase()).concat(pics.map(p => p.name.toLowerCase()).concat(pics.map(p => safeName(p.name).toLowerCase()))));
  async function preview() {
    const items = [], issues = [];
    const pk = pageKeys(await ensurePT());
    for (const f of files) {
      if (f.error) { issues.push({ file: f.name, level: 'error', message: f.error }); continue; }
      f.text = f.isWord ? KWord.normalize(f.raw, { defaultType: wtype, group: wgroup.trim() }) : f.text;
      const r = KImport.parseContent(f.text, { defaultLang: dlang, knownImages: known(), categories: catsOf(), pageKeys: pk, defaultType: mode === 'blog' ? 'blog' : '' });
      r.items.forEach(i => { i._file = f.name; items.push(i); });
      r.issues.forEach(i => issues.push({ file: f.name, level: i.level, message: i.message }));
      if (f.note) issues.push({ file: f.name, level: 'info', message: f.note });
    }
    let report = [];
    try { await ensureAr(); report = KImport.applyContent(items, clone(enData()), clone(DAR), { categories: catsOf() }); }
    catch (e) { issues.push({ file: '', level: 'error', message: e.message }); }
    result = { items, issues, report };
    draw();
  }

  /* what happens to each chosen picture */
  function picStatus() {
    const used = new Map(); // lowercase image name -> kind of the first item that uses it
    (result ? result.items : []).forEach(it => { const im = it.fields && it.fields.image; if (im && !/^https?:/i.test(im) && !used.has(im.toLowerCase())) used.set(im.toLowerCase(), it.kind); });
    const have = new Set(ASSETS.map(a => a.toLowerCase()));
    return pics.map(p => {
      const k = used.get(p.name.toLowerCase()) || used.get(safeName(p.name).toLowerCase());
      return { p, kind: k, state: !k ? 'unused' : have.has(safeName(p.name).toLowerCase()) ? 'have' : 'up' };
    });
  }

  const badge = a => a === 'add'
    ? `<span class="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">${t('isnew')}</span>`
    : `<span class="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">${t('upd')}</span>`;
  const lvl = { error: ['text-red-700', 'fa-circle-xmark'], warning: ['text-amber-800', 'fa-triangle-exclamation'], info: ['text-gray-600', 'fa-circle-info'] };
  const sel = 'mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-300 font-normal';
  const lbl = 'inline-flex items-center justify-center gap-1.5 text-xs bg-brand-50 text-brand-700 font-bold px-3 py-2.5 rounded-lg cursor-pointer hover:bg-brand-100';

  function draw() {
    const body = document.getElementById('imp-body'); if (!body) return;
    const modal = document.getElementById('imp-modal');
    modal.dir = ul === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('imp-title').textContent = t(mode === 'blog' ? 'b_title' : 'title');
    document.getElementById('imp-sw').textContent = t('switch');
    const n = result ? result.items.length : 0;
    const rows = result ? result.items.map((it, i) => {
      const rep = result.report[i] || {};
      if (mode === 'blog') {
        const im = (it.fields && it.fields.image) || '', f = it.fields || {};
        return `<tr class="border-t"><td class="py-1.5 px-1">${badge(rep.action)}</td><td class="px-1 font-bold text-sm break-words" dir="auto">${esc(it.title)}<span class="block text-xs font-normal text-gray-600">${it.lang === 'ar' ? 'عربي' : 'EN'}${f.category ? ' · ' + esc(f.category) : ''}${f.date ? ' · ' + esc(f.date) : ''}</span></td><td class="px-1 text-xs text-gray-600 whitespace-nowrap">${im ? (/^https?:/i.test(im) ? '<i class="fas fa-link"></i> ' + t('b_link') : '<i class="fas fa-image"></i> ' + t('b_file')) : t('b_none')}</td></tr>`;
      }
      return `<tr class="border-t"><td class="py-1.5 px-1">${badge(rep.action)}</td><td class="px-1 text-xs">${esc(sectionLabel(it.kind))} · ${it.lang === 'ar' ? 'عربي' : 'EN'}</td><td class="px-1 font-bold text-sm break-words" dir="auto">${esc(it.title)}</td><td class="px-1 text-xs text-gray-500 break-all" dir="ltr">${esc(it._file)}</td></tr>`;
    }).join('') : '';
    const iss = result ? result.issues.map(i => `<li class="flex gap-2 text-xs ${lvl[i.level][0]}"><i class="fas ${lvl[i.level][1]} mt-0.5"></i><span><b dir="ltr">${esc(i.file)}</b> ${esc(msg(i.message))}</span></li>`).join('') : '';
    const errs = result ? result.issues.filter(i => i.level === 'error').length : 0;
    const ps = picStatus();
    body.innerHTML = `
      <div class="grid grid-cols-2 gap-2 items-end">
        <label class="block text-xs font-bold">${t('lang_lbl')}<select id="imp-lang" class="${sel}"><option value="ar" ${dlang === 'ar' ? 'selected' : ''}>${t('arabic')}</option><option value="en" ${dlang === 'en' ? 'selected' : ''}>${t('english')}</option></select></label>
        <label class="${lbl}"><i class="fas fa-file-import"></i> ${files.length ? t('more') : t('choose')}<input id="imp-file" type="file" multiple accept="${window.KWord ? '.md,.markdown,.txt,.docx' : '.md,.markdown,.txt'}" class="hidden"></label>
      </div>
      ${files.some(f => f.isWord) && mode !== 'blog' ? `<div class="rounded-xl bg-gray-50 border border-gray-200 p-3 space-y-2">
        <label class="block text-xs font-bold">${t('wtype')}<select id="imp-wtype" class="${sel}">${['blog', 'service', 'country', 'carousel', 'about', 'faq', 'items', 'gallery'].map(o => `<option value="${o}" ${wtype === o ? 'selected' : ''}>${t('w_' + o)}</option>`).join('')}</select></label>
        ${['faq', 'items', 'gallery'].includes(wtype) ? `<label class="block text-xs font-bold">${t('wgroup')}<input id="imp-wgroup" type="text" dir="ltr" value="${esc(wgroup)}" placeholder="${t('wgroup_ph')}" class="${sel}"></label>` : ''}
        <div class="flex flex-wrap gap-2">${files.map((f, i) => f.isWord ? `<button data-impdl="${i}" class="text-xs bg-white border border-gray-300 hover:bg-gray-100 font-bold px-2.5 py-1.5 rounded-lg" title="${t('dl_md')}"><i class="fas fa-download"></i> <span dir="ltr">${esc(f.name.replace(/\.docx$/i, ''))}.md</span></button>` : '').join('')}</div></div>` : ''}
      ${mode === 'blog' ? `<p class="text-xs text-gray-600">${t('b_help')} <a href="content-templates/IMPORT-GUIDE.md" target="_blank" rel="noopener" class="text-brand-700 font-bold underline">${t('guide')}</a> · <a href="content-templates/blogs.md" target="_blank" rel="noopener" class="text-brand-700 font-bold underline">blogs.md</a> · <a href="content-templates/word-template-blogs.docx" class="text-brand-700 font-bold underline">word-template-blogs.docx</a></p>
      <label class="flex items-start gap-2 text-xs"><input type="checkbox" id="imp-dl" ${dlpics ? 'checked' : ''} class="mt-0.5"> <span>${t('b_dl')}</span></label>`
      : `<p class="text-xs text-gray-600">${window.KWord ? t('help_word') : t('help_md')} ${t('help_more')} <a href="content-templates/IMPORT-GUIDE.md" target="_blank" rel="noopener" class="text-brand-700 font-bold underline">${t('guide')}</a></p>`}
      <div class="rounded-xl border border-dashed border-gray-300 p-3 space-y-2">
        <div class="flex items-center gap-2 flex-wrap"><label class="${lbl}"><i class="fas fa-image"></i> ${t('pics_btn')}<input id="imp-pics" type="file" multiple accept="image/jpeg,image/png,image/webp" class="hidden"></label><span class="text-xs text-gray-600 flex-1 min-w-[12rem]">${t('pics_none')}</span></div>
        ${ps.length ? `<ul class="space-y-1">${ps.map(x => `<li class="flex items-center gap-2 text-xs"><i class="fas ${x.state === 'unused' ? 'fa-circle-minus text-gray-400' : x.state === 'have' ? 'fa-circle-check text-gray-500' : 'fa-cloud-arrow-up text-emerald-700'}"></i><span dir="ltr" class="font-bold break-all">${esc(x.p.name)}</span><span class="text-gray-600">${t('pic_' + x.state)}</span></li>`).join('')}</ul>` : ''}
      </div>
      ${result ? `
      <div class="rounded-xl border border-gray-200 overflow-hidden"><div class="px-3 py-2 bg-gray-50 text-xs font-bold">${n} ${n === 1 ? t('item') : t('items')} ${t('ready')}${errs ? ` · ${errs} ${t('problems')}` : ''}</div>
      ${n ? `<div class="px-2 overflow-x-auto"><table class="w-full" style="text-align:start">${rows}</table></div>` : `<p class="px-3 py-3 text-xs text-gray-600">${t('nothing')}</p>`}</div>
      ${iss ? `<ul class="space-y-1">${iss}</ul>` : ''}` : ''}
      ${mode === 'blog' ? '' : `<details class="rounded-xl border border-gray-200" ${exOpen ? 'open' : ''} id="imp-ex"><summary class="p-3 cursor-pointer font-bold text-sm">${t('ex_title')}</summary>
        <div class="p-3 pt-1 space-y-2 border-t">
          <p class="text-xs text-gray-600">${t('ex_help')}</p>
          <div class="flex flex-wrap gap-x-4 gap-y-1">${EXS.map(k => `<label class="inline-flex items-center gap-1.5 text-xs"><input type="checkbox" data-exsec="${k}" ${exSel[k] ? 'checked' : ''}> ${sectionLabel(k)}</label>`).join('')}</div>
          <label class="block text-xs font-bold">${t('ex_lang')}<select id="imp-exlang" class="${sel}"><option value="ar" ${exLang === 'ar' ? 'selected' : ''}>${t('arabic')}</option><option value="en" ${exLang === 'en' ? 'selected' : ''}>${t('english')}</option></select></label>
          <div class="flex flex-wrap gap-2"><button data-exgo="md" class="text-xs bg-brand-600 hover:bg-brand-700 text-white font-bold px-3 py-2 rounded-lg"><i class="fas fa-download"></i> ${t('ex_md')}</button><button data-exgo="doc" class="text-xs bg-white border border-gray-300 hover:bg-gray-100 font-bold px-3 py-2 rounded-lg"><i class="fas fa-file-word"></i> ${t('ex_word')}</button></div>
          <p class="text-xs text-gray-600">${t('ex_word_note')}</p>
        </div></details>`}
      <div class="flex gap-2 justify-end pt-1">
        <button id="imp-cancel" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-4 py-2.5 rounded-xl">${t('close')}</button>
        <button id="imp-apply" ${n ? '' : 'disabled'} class="text-xs bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-bold px-4 py-2.5 rounded-xl">${t(mode === 'blog' ? 'b_apply' : 'apply')}${n ? ' (' + n + ')' : ''}</button>
      </div>`;
  }

  /* ---------- pictures: shrink / crop like the normal upload, then store in assets/ under the name used in the file ---------- */
  async function uploadPictures() {
    const renamed = new Map(); // lowercase name in the file -> final name in assets
    for (const x of picStatus()) {
      if (x.state === 'unused') continue;
      const key = x.p.name.toLowerCase();
      let file = x.p.file;
      const fi = x.kind === 'carousel' ? 0 : x.kind === 'news' ? 1 : x.kind === 'employees' ? 2 : -1;
      file = fi >= 0 ? await fit(file, FIT[fi][1], FIT[fi][2]) : await shrink(file);
      if (file.size > 3e6) throw new Error(t('t_pic_big', { n: x.p.name }));
      const final = safeName(file.name);
      renamed.set(key, final); renamed.set(safeName(x.p.name).toLowerCase(), final);
      if (ASSETS.some(a => a.toLowerCase() === final.toLowerCase())) continue;
      try {
        await api('assets/' + final, { method: 'PUT', body: { message: 'Upload image via admin import', content: b64(new Uint8Array(await file.arrayBuffer())), branch: S.b } });
        ASSETS.push(final); const dl = $('assets'); if (dl) dl.innerHTML += `<option value="${esc(final)}">`;
      } catch (e) { throw new Error(t('t_pic_fail', { n: x.p.name, e: e.message })); }
    }
    return renamed;
  }

  /* ---------- blog screen: pictures given as web links ---------- */
  /* Tries to download each linked picture (the browser only allows it when that website permits it), shrink it like a normal
     news picture and store it in assets/. Returns { got, kept }. A link that cannot be copied is simply kept as a link. */
  async function copyLinkedPictures() {
    const done = new Map(); let got = 0, kept = 0, n = 0;
    for (const it of result.items) {
      const u = it.fields && it.fields.image;
      if (it.kind !== 'news' || !u || !/^https?:\/\//i.test(u)) continue;
      if (!done.has(u)) {
        let name = '';
        try {
          const r = await fetch(u, { mode: 'cors', credentials: 'omit' });
          if (!r.ok) throw new Error('http ' + r.status);
          const blob = await r.blob();
          if (!/^image\/(jpeg|png|webp)$/.test(blob.type)) throw new Error('not a jpg/png/webp picture');
          let file = new File([blob], 'blog-' + Date.now().toString(36) + '-' + (++n) + (blob.type === 'image/png' ? '.png' : blob.type === 'image/webp' ? '.webp' : '.jpg'), { type: blob.type });
          file = await fit(file, FIT[1][1], FIT[1][2]);
          if (file.size > 3e6) throw new Error('over 3 MB');
          const final = safeName(file.name);
          await api('assets/' + final, { method: 'PUT', body: { message: 'Upload image via admin import', content: b64(new Uint8Array(await file.arrayBuffer())), branch: S.b } });
          ASSETS.push(final); const dl = $('assets'); if (dl) dl.innerHTML += `<option value="${esc(final)}">`;
          name = final; got++;
        } catch (_) { kept++; }
        done.set(u, name);
      }
      if (done.get(u)) it.fields.image = done.get(u);
    }
    return { got, kept };
  }

  /* ---------- export ---------- */
  async function doExport(kind) {
    try {
      await ensureAr();
      const r = KImport.exportContent(enData(), DAR, { lang: exLang, sections: EXS.filter(k => exSel[k]), pageTexts: await ensurePT() });
      if (!r.items.length) return toast(t('ex_none'), false);
      const stamp = new Date().toISOString().slice(0, 10);
      const name = 'hot-info-content-' + exLang + '-' + stamp;
      const blob = kind === 'doc' ? new Blob(['\ufeff' + KImport.exportWordHtml(r.items)], { type: 'application/msword' }) : new Blob([r.md], { type: 'text/markdown' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + (kind === 'doc' ? '.doc' : '.md'); a.click();
      toast(r.items.length + ' ✓' + (r.skipped && exLang === 'ar' ? ' · ' + t('ex_skip', { n: r.skipped }) : ''));
    } catch (e) { toast(e.message || String(e), false); }
  }

  /* ---------- apply ---------- */
  async function apply() {
    if (!result || !result.items.length) return;
    const btn = document.getElementById('imp-apply'); if (btn) btn.disabled = true;
    try {
      await ensureAr();
      const renamed = pics.length ? await uploadPictures() : new Map();
      const lp = mode === 'blog' && dlpics ? await copyLinkedPictures() : { got: 0, kept: 0 };
      result.items.forEach(it => { const im = it.fields && it.fields.image; if (im && renamed.has(im.toLowerCase())) it.fields.image = renamed.get(im.toLowerCase()); });
      DEN = D; DAR = compact(DA); // unsaved Arabic typing is kept; the import is merged on top of it
      const rep = KImport.applyContent(result.items, DEN, DAR, { categories: catsOf() });
      KIMP.enTouched = KIMP.enTouched || rep.some(r => r.lang === 'en' || r.action === 'add' || (r.lang === 'ar' && r.kind !== 'about' && r.kind !== 'pagetext'));
      KIMP.arTouched = KIMP.arTouched || rep.some(r => r.lang === 'ar');
      KIMP.pending = true;
      D = DEN; DA = mirror(D, DAR);
      const a = rep.filter(r => r.action === 'add').length, u = rep.length - a;
      close(); mark(true); tabs(); view();
      toast(t('t_done', { a: a, u: u }) + (lp.got ? ' ' + t('t_dl_got', { n: lp.got }) : '') + (lp.kept ? ' ' + t('t_dl_link', { n: lp.kept }) : ''));
    } catch (e) { toast(e.message || String(e), false); if (btn) btn.disabled = false; }
  }

  KIMP.save = function () { return save(); }; // the normal Save writes both files (only the ones that changed)

  /* ---------- open ---------- */
  function open(m) {
    if (!D) return;
    mode = m === 'blog' ? 'blog' : '';
    if (mode === 'blog') wtype = 'blog';
    if (lang === 'ar' && DEN === null) return toast(t('t_reload'), false);
    dlang = (enData().languages === 'en') ? 'en' : 'ar'; exLang = dlang;
    try { ul = localStorage.getItem('imp-ui') || ''; } catch (_) { ul = ''; }
    if (ul !== 'ar' && ul !== 'en') ul = (document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar' || lang === 'ar') ? 'ar' : 'en';
    close();
    document.body.appendChild(el(`<div id="imp-modal" class="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center p-3 overflow-y-auto" role="dialog" aria-modal="true">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-4 space-y-3 my-auto">
        <div class="flex items-center gap-2"><h2 id="imp-title" class="font-extrabold text-lg flex-1"></h2><button id="imp-sw" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-lg"></button><button id="imp-x" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200" aria-label="Close"><i class="fas fa-xmark"></i></button></div>
        <div id="imp-body" class="space-y-3"></div>
      </div></div>`));
    draw();
    if (mode === 'blog') { const fi = document.getElementById('imp-file'); if (fi) fi.click(); }   // one press on the News button goes straight to choosing the file
  }

  document.addEventListener('click', function (e) {
    const dl = e.target.closest('[data-impdl]');
    if (dl) { const f = files[+dl.dataset.impdl]; if (f && f.text) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([f.text], { type: 'text/markdown' })); a.download = f.name.replace(/\.docx$/i, '') + '.md'; a.click(); } return; }
    const eg = e.target.closest('[data-exgo]');
    if (eg) { doExport(eg.dataset.exgo); return; }
    const b = e.target.closest('[data-act="import"],#imp-cancel,#imp-x,#imp-apply,#imp-sw');
    if (!b) return;
    if (b.dataset.act === 'import') open(b.dataset.mode);
    else if (b.id === 'imp-apply') apply();
    else if (b.id === 'imp-sw') { ul = ul === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('imp-ui', ul); } catch (_) {} draw(); }
    else close();
  });
  document.addEventListener('toggle', function (e) { if (e.target.id === 'imp-ex') exOpen = e.target.open; }, true);
  document.addEventListener('change', function (e) {
    const id = e.target.id;
    if (id === 'imp-file') { const l = Array.from(e.target.files || []); e.target.value = ''; if (l.length) onFiles(l); }
    else if (id === 'imp-pics') { const l = Array.from(e.target.files || []); e.target.value = ''; if (l.length) onPics(l); }
    else if (e.target.dataset && e.target.dataset.exsec) exSel[e.target.dataset.exsec] = e.target.checked;
    else if (id === 'imp-exlang') exLang = e.target.value;
    else if (id === 'imp-wtype') { wtype = e.target.value; preview(); }
    else if (id === 'imp-wgroup') { wgroup = e.target.value; preview(); }
    else if (id === 'imp-dl') dlpics = e.target.checked;
    else if (id === 'imp-lang') { dlang = e.target.value; if (files.length) preview(); }
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();
