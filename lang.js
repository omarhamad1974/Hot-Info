/* KHIP language layer: English (LTR) and Arabic (RTL).
   - The admin chooses which languages the site offers: English only, Arabic only, or both
     ("languages" in app-data.json). With both, visitors switch with the button in the header.
   - Arabic content lives in app-data.ar.json, which mirrors app-data.json. Any field left empty
     there falls back to the English text, so the site is never blank.
   - Short interface words (menu, buttons) come from the table below; the admin can edit the Arabic
     ones under Arabic > Interface text.
   Load this file in <head> (it sets lang/dir before the page paints). */
window.KLang=(function(){
  const LS='khip-lang',CS='khip-langs',AR_FILE='./app-data.ar.json';
  const DICT={
    en:{
      brand:'Intellectual Properties',nav_about:'About',nav_jur:'HOT News',nav_services:'IP Services',nav_news:'News',nav_files:'My files',
      bar_home:'Home',bar_services:'IP Services',bar_news:'News',bar_jur:'HOT News',bar_about:'About',bar_files:'My files',bar_tenders:'Tenders',tn_new:'{x} new tenders in your sectors',tn_new1:'1 new tender in your sectors',tn_view:'View tenders',
      more:'More',jur_title:'HOT News',svc_title:'IP Services',news_title:'Latest news',testi_title:'Client endorsements',
      load_err:"We couldn't load the latest content.",try_again:'Try again',close:'Close',
      no_country:'No matching country. Message us and we will check for you.',ip_guidelines:'IP guidelines available upon inquiry.',
      view_req:'View Filing Requirements',pct:'PCT Filing Guidelines',copy_link:'Copy link',link_copied:'Link copied',related:'Related news',
      more_info:'More information',inquire_about:'Inquire about {x}',wa_service:'Hello KHIP! I would like to inquire about {x}.',
      wa_jur:'IP filings and legal procedures in {x}',general:'General',msg_wa:'Message HOT INFORMATION on WhatsApp',send:'Send',
      switch_to:'العربية',flag_aria:'{x} flag',testimonial_n:'Testimonial {x}',news_n:'News {x}',
      nav_scope:'Our Regional Scope',nav_value:'Value',nav_adv:'Advantages',nav_team:'Team',nav_contact:'Contact',
      follow_li:'Follow us on LinkedIn',address:'Address',hot_more:'More',hot_less:'Close',hot_pause:'Pause automatic changes',hot_play:'Resume automatic changes',hot_pub:'Published',hot_entity:'Publishing entity',hot_gov:'Governorate',hot_session:'Session date',hot_gone:'This tender is no longer available.',hot_sub_only:'Booklet price, bid bond and documents are available to subscribers.',hot_n:'{x} active tenders',hot_n1:'1 active tender',hot_cta:'See all tenders',hot_note:'Full details are available to subscribers.',phone:'Phone',email:'Email',open_maps:'Open in Google Maps',filing_guidelines:'Filing guidelines',
      wa_us:'WhatsApp us',team_prev:'Previous team members',team_next:'Next team members',
      nav_directory:'Directory',bar_directory:'Directory',dir_title:'Directory',dir_sub:'Companies, institutions and freelancers. Search, filter and contact them directly on WhatsApp.',
      dir_search:'Search',dir_search_ph:'Name, city or phone',dir_sector:'Sector',dir_all_sectors:'All sectors',dir_all:'All',dir_company:'Company',dir_companies:'Companies',dir_institution:'Institution',dir_institutions:'Institutions',dir_freelancer:'Freelancer',dir_freelancers:'Freelancers',
      dir_offers_only:'Special offers only',dir_count:'{x} results',dir_count1:'1 result',dir_clear:'Clear filters',dir_filters:'Filters',dir_remove:'Remove filter',dir_none:'No matches. Try another word or clear the filters.',dir_empty:'The directory is being prepared. Please check back soon.',
      dir_wa:'WhatsApp',dir_website:'Website',dir_social:'Social media',dir_more:'Show more',dir_err:"We couldn't load the directory.",dir_wa_msg:'Hello, I found you in the HOT Info directory.',
      dir_details:'Details',dir_share:'Share',dir_copied:'Link copied',dir_submit:'Add your business',dir_s_title:'Add your business to the directory',dir_s_sub:'Fill in the form. Our team reviews every submission before it appears. Fields marked * are required.',dir_s_name:'Name',dir_s_name_ar:'Name in Arabic',dir_s_type:'Type',dir_s_sector:'Business sector',dir_s_pick:'Choose a sector',dir_s_city:'City',dir_s_address:'Address',dir_s_phones:'Phone numbers (one per line)',dir_s_wa:'WhatsApp number (with country code)',dir_s_email:'Email',dir_s_web:'Website',dir_s_social:'Social media page',dir_s_desc:'About you (what you do, services)',dir_s_offer:'Special offer for HOT Info visitors (optional)',dir_s_otitle:'Short title',dir_s_otext:'Offer details',dir_s_oends:'Valid until (empty = no end date)',dir_s_contact:'Your contact details (private: only our team sees them)',dir_s_cname:'Your name',dir_s_cphone:'Your phone',dir_s_cemail:'Your email',dir_s_contact_hint:'Give a phone or an email so we can reach you.',dir_s_send:'Send for review',dir_s_sending:'Sending...',dir_s_ok_title:'Thank you!',dir_s_ok_text:'We received your details. Our team will review them and publish your entry after approval.',dir_s_again:'Add another',dir_s_err:'We could not send the form. Please try again.',dir_s_req:'Please fill in the required fields.',dir_s_bad_wa:'The WhatsApp number does not look right.',dir_s_bad_mail:'An email address does not look right.',dir_s_bad_url:'A website or social link does not look right.',dir_s_bad_contact:'Please give a phone or an email so we can reach you.',dir_s_limit:'Too many submissions right now. Please try again later.',dir_s_exists:'This business is already in the directory or waiting for review.',dir_back:'Back to the directory',dir_about:'About',dir_offer:'Special offer',dir_valid_until:'Valid until {x}',dir_contact:'Contact',dir_call:'Call',dir_email:'Email',dir_address:'Address',dir_map:'Open in Google Maps',dir_notfound:'This entry is not available',dir_notfound_sub:'It may have been removed or is not published yet.',dir_no_info:'More information will be added soon.',
      pay_nav:"Subscribe",
      pay_title:"Subscribe",
      pay_sub:"Create an account, pick a package for each sector you want, pay in your own banking or wallet app, then upload the receipt. We activate your sectors after we confirm your payment.",
      pay_signin:"Please sign in",
      pay_signin_sub:"Sign in or create an account to subscribe.",
      pay_login:"Login",
      pay_step1:"1. Choose your sectors and packages",
      pay_step2:"Check your order",
      pay_step3:"2. Choose how to pay",
      pay_step4:"3. Upload your receipt",
      pay_free:"Free",
      pay_per_sector:"per sector",
      pay_free_note:"This package is free. No payment is needed: we approve it after you send the request.",
      pay_active_until:"Active until {x}",
      pay_renew_note:"Renewal: the new period starts after your current one ends.",
      pay_total:"Total",
      pay_sel_n:"{x} sector(s) in your order",
      pay_pick_pkg:"Choose a package.",
      pay_pick_sec:"Choose a package for at least one sector.",
      pay_method:"Pay with",
      pay_amount:"Amount to pay",
      pay_account_name:"Account name",
      pay_account_no:"Account / number",
      pay_copy:"Copy",
      pay_copied:"Copied",
      pay_scan:"Scan the QR code",
      pay_paid_hint:"Pay the exact amount in your own app (outside this website). Copy the details below, then come back and upload the receipt.",
      pay_none_methods:"Online payment is not available yet. Please contact us.",
      pay_receipt:"Receipt or QR screenshot",
      pay_receipt_hint:"JPG, PNG, WebP or PDF, up to 5 MB.",
      pay_note:"Note (optional)",
      pay_send:"Send request",
      pay_sending:"Sending...",
      pay_sent:"Request sent. Your payment is waiting for our confirmation. Your sectors are activated once we approve it.",
      pay_my:"My requests",
      pay_none_req:"You have no requests yet.",
      pay_ref:"Request #{x}",
      pay_pending:"Waiting for approval",
      pay_approved:"Approved",
      pay_rejected:"Rejected",
      pay_cancelled:"Cancelled",
      pay_cancel:"Cancel request",
      pay_cancel_ask:"Cancel this request?",
      pay_reason:"Note from us",
      pay_sent_on:"Sent {x}",
      pay_err_receipt:"Please attach your receipt or QR screenshot.",
      pay_err_method:"Choose how you paid.",
      pay_err_type:"Use a JPG, PNG, WebP or PDF file.",
      pay_err_size:"The file is over 5 MB.",
      pay_err_load:"We couldn't load this page. Please refresh and try again.",
      pay_open_files:"Go to My files",
      pay_subscribe_btn:"Subscribe or renew",
      pay_egp:"EGP",
      pay_sectors:"Sectors",
      pay_no_pkgs:"No packages are available right now.",
      pay_used:"Already used",
      pay_in_review:"Request waiting",
      pay_files_hint:"Once approved, your sectors appear in My files.",
      pay_create:"Create account",
      pay_sec_hint:"Tap a package under each sector you want. Tap it again to remove it.",
      pay_starts:"Starts {x}",
      pay_ends:"ends {x}",
      pay_renews:"Renewal: starts the day after your current period ends ({x}).",
      pay_date_note:"Dates are counted from today. Your period actually starts on the day we approve your payment.",
      pay_order:"Your order",
      pay_period:"Period",
      pay_price:"Price",
      pay_empty_order:"Your order is empty. Choose a package under a sector.",
      pay_send_paid:"I have paid: send for approval",
      pay_receipt_req:"Required before you can send",
      pay_receipt_ok:"Receipt attached",
      pay_copy_amount:"Copy amount",
      pay_open_page:"Open the payment page",
      pay_open_hint:"Pay on the official page, then come back and upload your receipt.",
      pay_wait_title:"Waiting for our confirmation",
      pay_wait_sub:"We check your receipt, then activate your sectors. You can follow the status in My requests below.",
      pay_none_pkg:"None",
      pay_pay_exact:"Pay exactly this amount",
      pay_renew_for:"Renewing {x}. Choose a package to continue.",
      pay_tt_dm:"about {x} days",
      pay_tt_df:"about {x} days",
      pay_tt_d2:"about 2 days",
      pay_tt_d1:"about a day",
      pay_tt_hm:"about {x} hours",
      pay_tt_hf:"about {x} hours",
      pay_tt_h2:"about 2 hours",
      pay_tt_h1:"about an hour",
      pay_tl_typ:"Typical approval time: {x}",
      pay_tl_cancelled:"Cancelled",
      pay_tl_rejected:"Not approved",
      pay_tl_approved:"Approved: sectors active",
      pay_tl_decide:"Approval",
      pay_tl_review:"Under review",
      pay_tl_sent:"Request sent",
      pay_stp_aria:"Step {x} of 3",
      pay_stp_free:"Not needed (free)",
      pay_stp_upload:"Upload receipt",
      pay_stp_pay:"Pay",
      pay_stp_choose:"Choose",
      ago_today:"today",
      ago_yday:"yesterday",
      ago_days:"{x} days ago",
      tdr_title_tag:"Tenders | HOT INFORMATION",
      tdr_sub:"Tenders in the sectors you subscribe to, newest first.",
      tdr_filter_aria:"Filter tenders",
      tdr_search_ph:"Search entity or subject",
      tdr_search:"Search",
      tdr_filters:"Filters",
      tdr_entity:"Publishing entity",
      tdr_sector:"Sector",
      tdr_all_sectors:"All my sectors",
      tdr_by:"Filter dates by",
      tdr_published:"Published",
      tdr_session:"Session",
      tdr_from:"From",
      tdr_to:"To",
      tdr_clear:"Clear",
      tdr_active:"Active filters",
      tdr_rm:"Remove filter: {x}",
      tdr_last7:"Last 7 days",
      tdr_new:"New",
      tdr_pub_on:"Published {x}",
      tdr_pg:"p. {x}",
      tdr_f_session:"Session",
      tdr_f_price:"Booklet price",
      tdr_f_bond:"Bid bond",
      tdr_passed:"passed",
      tdr_view:"View",
      tdr_source:"Source",
      tdr_h_recent:"Published in the last 7 days",
      tdr_none_recent_f:"No tenders from the last 7 days match your filters.",
      tdr_none_recent:"No tenders were published in the last 7 days.",
      tdr_more_recent:"Show more recent tenders ({x} left)",
      tdr_more_older:"More tenders",
      tdr_older_hint:"Shows tenders published more than 7 days ago",
      tdr_h_older:"Earlier tenders",
      tdr_none_older_f:"No earlier tenders match your filters.",
      tdr_none_older:"There are no earlier tenders yet.",
      tdr_more_left:"More tenders ({x} left)",
      tdr_count:"Tenders: {x}",
      tdr_rcount:"Recent tenders: {x}",
      tdr_load_err:"We could not load the tenders",
      tdr_not_setup:"The tenders page is not set up yet. Please try again later.",
      tdr_not_setup_t:"The tenders page is not set up yet",
      tdr_refresh:"Please refresh the page and try again.",
      tdr_loading:"Loading...",
      tdr_more_fail:"Sorry, more tenders could not be loaded.",
      tdr_popup:"Please allow pop-ups for this site to view the tender, or try again.",
      tdr_opening:"Opening the tender...",
      tdr_open_fail:"Sorry, this tender could not be opened.",
      tdr_signin_na:"Sign-in is not set up yet",
      tdr_later:"Please try again later.",
      tdr_signin_txt:"Sign in to see the tenders in your sectors.",
      tdr_please:"Please sign in",
      tdr_private:"Tenders are private to subscribers.",
      tdr_login:"Login",
      tdr_no_sub:"No active subscriptions yet",
      tdr_no_sub_sub:"Once you are subscribed to a sector, its tenders appear here. Get in touch with us to subscribe.",
      tdr_who1:"Tenders in {x}, newest first.",
      tdr_whon:"Tenders in your {x} sectors, newest first.",
      tdr_nt_count:"{n} new tender(s)",
      tdr_nt_rest:" in your sectors since your last visit{d}. They are marked ",
      tdr_nt_end:" below.",
      mf_title_tag:"My files | HOT INFORMATION",
      mf_sub:"Your sector libraries, ready to open or download.",
      mf_subscribe:"Subscribe or renew",
      mf_where:"Where you are",
      mf_search_ph:"Search in this folder",
      mf_search:"Search files",
      mf_sort:"Sort",
      mf_name:"Name",
      mf_newest:"Newest first",
      mf_tender_issues:"Tender issues",
      mf_issue:"Issue {x}",
      mf_all:"All my sectors",
      mf_welcome:"Welcome back, {x}. Pick a sector to see its documents.",
      mf_pick:"Pick a sector to see its documents.",
      mf_err_sectors:"We could not load your sectors",
      mf_refresh:"Please refresh the page and try again.",
      mf_none:"No active subscriptions yet",
      mf_none_sub:"Once you are subscribed to a sector, its documents appear here. Press Subscribe or renew above to get started.",
      mf_active:"Active sectors: {x}",
      mf_open_docs:"Open documents",
      mf_ends_today:"Ends today",
      mf_1day:"1 day left",
      mf_days:"{x} days left",
      mf_until:"until {x}",
      mf_review:"Renewal under review",
      mf_renew:"Renew",
      mf_renew_aria:"Renew {x}",
      mf_err_files:"We could not load these files",
      mf_empty:"Nothing here yet",
      mf_empty_sub:"New documents appear in this folder as soon as they are published.",
      mf_nomatch:"No match",
      mf_nomatch_sub:"Nothing in this folder matches \"{x}\".",
      mf_folders:"Folders",
      mf_docs:"Documents",
      mf_new:"New",mf_u_b:"B",mf_u_kb:"KB",mf_u_mb:"MB",mf_k_image:"Image",mf_k_file:"File",mf_k_word:"Word",mf_k_excel:"Excel",mf_k_ppt:"PowerPoint",nav_main:"Main",
      mf_added:"Added {x}",
      mf_open:"Open",
      mf_download:"Download",
      mf_open_aria:"Open {x}",
      mf_dl_aria:"Download {x}",
      mf_popup:"Please allow pop-ups for this site to open files, or use Download.",
      mf_opening:"Opening your file...",
      mf_open_fail:"Sorry, this file could not be opened.",
      mf_preparing:"Preparing...",
      mf_dl_fail:"Sorry, this file could not be downloaded.",
      mf_signin_txt:"Sign in to see your sector libraries.",
      mf_private:"Your documents are private to your account.",
      mf_access:"{name} · your access runs until {x}",
      bc_label:"Breadcrumb",
      offers_title:"Limited offers",
      offers_sub:"Exclusive deals from our partner entities",
      offers_all:"All offers",
      offers_cta:"View offer",
      offers_ends_today:"Ends today",
      offers_1day:"1 day left",
      offers_days:"{x} days left",
      offers_until:"Until {x}",
      offers_open:"Ongoing offer",
      prompts:["Hello HOT INFORMATION, I'd like to subscribe to tender updates","How long does a patent filing take in the UAE?","Can you translate my patent into Arabic?","What documents do I need for a PCT national phase entry?"]
    },
    ar:{
      brand:'للملكية الفكرية',nav_about:'من نحن',nav_jur:'أخبار HOT',nav_services:'خدمات الملكية الفكرية',nav_news:'الأخبار',nav_files:'ملفاتي',
      bar_home:'الرئيسية',bar_services:'الخدمات',bar_news:'الأخبار',bar_jur:'أخبار HOT',bar_about:'من نحن',bar_files:'ملفاتي',bar_tenders:'المناقصات',tn_new:'{x} مناقصات جديدة في قطاعاتك',tn_new1:'مناقصة جديدة في قطاعاتك',tn_view:'عرض المناقصات',
      more:'المزيد',jur_title:'أخبار HOT',svc_title:'خدمات الملكية الفكرية',news_title:'آخر الأخبار',testi_title:'آراء العملاء',
      load_err:'تعذر تحميل أحدث المحتوى.',try_again:'حاول مرة أخرى',close:'إغلاق',
      no_country:'لا توجد دولة مطابقة. راسلنا وسنتحقق لك.',ip_guidelines:'إرشادات الملكية الفكرية متاحة عند الاستفسار.',
      view_req:'عرض متطلبات التسجيل',pct:'إرشادات تقديم طلبات معاهدة التعاون بشأن البراءات (PCT)',copy_link:'نسخ الرابط',link_copied:'تم نسخ الرابط',related:'أخبار ذات صلة',
      more_info:'مزيد من المعلومات',inquire_about:'استفسر عن {x}',wa_service:'مرحباً KHIP! أود الاستفسار عن {x}.',
      wa_jur:'إجراءات تسجيل الملكية الفكرية والإجراءات القانونية في {x}',general:'عام',msg_wa:'راسل HOT INFORMATION عبر واتساب',send:'إرسال',
      switch_to:'English',flag_aria:'علم {x}',testimonial_n:'الرأي {x}',news_n:'الخبر {x}',
      nav_scope:'نطاقنا الإقليمي',nav_value:'القيمة',nav_adv:'المزايا',nav_team:'الفريق',nav_contact:'اتصل بنا',
      follow_li:'تابعنا على لينكدإن',address:'العنوان',hot_more:'المزيد',hot_less:'إغلاق',hot_pause:'إيقاف التغيير التلقائي',hot_play:'استئناف التغيير التلقائي',hot_pub:'تاريخ النشر',hot_entity:'الجهة المعلنة',hot_gov:'المحافظة',hot_session:'موعد الجلسة',hot_gone:'هذه المناقصة لم تعد متاحة.',hot_sub_only:'ثمن الكراسة والتأمين والمستندات متاحة للمشتركين.',hot_n:'{x} مناقصات سارية',hot_n1:'مناقصة سارية واحدة',hot_cta:'عرض كل المناقصات',hot_note:'التفاصيل الكاملة متاحة للمشتركين.',phone:'الهاتف',email:'البريد الإلكتروني',open_maps:'افتح في خرائط جوجل',filing_guidelines:'إرشادات التسجيل',
      wa_us:'راسلنا عبر واتساب',team_prev:'أعضاء الفريق السابقون',team_next:'أعضاء الفريق التاليون',
      nav_directory:'الدليل',bar_directory:'الدليل',dir_title:'الدليل',dir_sub:'شركات وجهات ومستقلون. ابحث وصفِّ وتواصل معهم مباشرة عبر واتساب.',
      dir_search:'بحث',dir_search_ph:'الاسم أو المدينة أو الهاتف',dir_sector:'القطاع',dir_all_sectors:'كل القطاعات',dir_all:'الكل',dir_company:'شركة',dir_companies:'شركات',dir_institution:'جهة',dir_institutions:'جهات',dir_freelancer:'مستقل',dir_freelancers:'مستقلون',
      dir_offers_only:'العروض الخاصة فقط',dir_count:'{x} نتيجة',dir_count1:'نتيجة واحدة',dir_clear:'مسح التصفية',dir_filters:'التصفية',dir_remove:'إزالة التصفية',dir_none:'لا توجد نتائج. جرّب كلمة أخرى أو امسح التصفية.',dir_empty:'الدليل قيد الإعداد. يرجى العودة قريباً.',
      dir_wa:'واتساب',dir_website:'الموقع الإلكتروني',dir_social:'وسائل التواصل',dir_more:'عرض المزيد',dir_err:'تعذر تحميل الدليل.',dir_wa_msg:'مرحباً، وجدتكم في دليل HOT Info.',
      dir_details:'التفاصيل',dir_share:'مشاركة',dir_copied:'تم نسخ الرابط',dir_submit:'أضف نشاطك',dir_s_title:'أضف نشاطك إلى الدليل',dir_s_sub:'املأ النموذج. يراجع فريقنا كل طلب قبل ظهوره. الحقول المعلّمة بـ * مطلوبة.',dir_s_name:'الاسم',dir_s_name_ar:'الاسم بالعربية',dir_s_type:'النوع',dir_s_sector:'قطاع النشاط',dir_s_pick:'اختر القطاع',dir_s_city:'المدينة',dir_s_address:'العنوان',dir_s_phones:'أرقام الهاتف (رقم في كل سطر)',dir_s_wa:'رقم واتساب (مع كود الدولة)',dir_s_email:'البريد الإلكتروني',dir_s_web:'الموقع الإلكتروني',dir_s_social:'صفحة التواصل الاجتماعي',dir_s_desc:'نبذة عنكم (النشاط والخدمات)',dir_s_offer:'عرض خاص لزوار HOT Info (اختياري)',dir_s_otitle:'عنوان قصير',dir_s_otext:'تفاصيل العرض',dir_s_oends:'ساري حتى (فارغ = بدون تاريخ انتهاء)',dir_s_contact:'بيانات التواصل معك (خاصة: يراها فريقنا فقط)',dir_s_cname:'اسمك',dir_s_cphone:'هاتفك',dir_s_cemail:'بريدك الإلكتروني',dir_s_contact_hint:'اكتب رقم هاتف أو بريداً إلكترونياً لنتمكن من التواصل معك.',dir_s_send:'إرسال للمراجعة',dir_s_sending:'جارٍ الإرسال...',dir_s_ok_title:'شكراً لك!',dir_s_ok_text:'استلمنا بياناتك. سيراجعها فريقنا وينشر نشاطك بعد الموافقة.',dir_s_again:'إضافة نشاط آخر',dir_s_err:'تعذر إرسال النموذج. حاول مرة أخرى.',dir_s_req:'من فضلك املأ الحقول المطلوبة.',dir_s_bad_wa:'رقم واتساب غير صحيح.',dir_s_bad_mail:'عنوان بريد إلكتروني غير صحيح.',dir_s_bad_url:'رابط موقع أو صفحة تواصل غير صحيح.',dir_s_bad_contact:'من فضلك اكتب رقم هاتف أو بريداً إلكترونياً للتواصل معك.',dir_s_limit:'عدد الطلبات كبير الآن. حاول مرة أخرى لاحقاً.',dir_s_exists:'هذا النشاط موجود بالفعل في الدليل أو بانتظار المراجعة.',dir_back:'العودة إلى الدليل',dir_about:'نبذة',dir_offer:'عرض خاص',dir_valid_until:'ساري حتى {x}',dir_contact:'التواصل',dir_call:'اتصال',dir_email:'البريد الإلكتروني',dir_address:'العنوان',dir_map:'افتح في خرائط جوجل',dir_notfound:'هذه الصفحة غير متاحة',dir_notfound_sub:'ربما تمت إزالتها أو لم يتم نشرها بعد.',dir_no_info:'ستتم إضافة المزيد من المعلومات قريباً.',
      pay_nav:"اشترك",
      pay_title:"الاشتراك",
      pay_sub:"أنشئ حساباً، واختر باقة لكل قطاع تريده، وادفع من تطبيق البنك أو المحفظة الخاص بك، ثم ارفع الإيصال. نفعّل قطاعاتك بعد أن نؤكد الدفع.",
      pay_signin:"يرجى تسجيل الدخول",
      pay_signin_sub:"سجّل الدخول أو أنشئ حساباً للاشتراك.",
      pay_login:"تسجيل الدخول",
      pay_step1:"١. اختر القطاعات والباقات",
      pay_step2:"\u0631\u0627\u062c\u0639 \u0637\u0644\u0628\u0643",
      pay_step3:"\u0662. \u0627\u062e\u062a\u0631 \u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639",
      pay_step4:"\u0663. \u0627\u0631\u0641\u0639 \u0627\u0644\u0625\u064a\u0635\u0627\u0644",
      pay_free:"مجاني",
      pay_per_sector:"لكل قطاع",
      pay_free_note:"هذه الباقة مجانية. لا حاجة للدفع: نوافق عليها بعد إرسال الطلب.",
      pay_active_until:"ساري حتى {x}",
      pay_renew_note:"التجديد: تبدأ الفترة الجديدة بعد انتهاء الفترة الحالية.",
      pay_total:"الإجمالي",
      pay_sel_n:"{x} قطاع في طلبك",
      pay_pick_pkg:"اختر باقة.",
      pay_pick_sec:"اختر باقة لقطاع واحد على الأقل.",
      pay_method:"ادفع عبر",
      pay_amount:"المبلغ المطلوب",
      pay_account_name:"اسم الحساب",
      pay_account_no:"الحساب / الرقم",
      pay_copy:"نسخ",
      pay_copied:"تم النسخ",
      pay_scan:"امسح رمز QR",
      pay_paid_hint:"ادفع المبلغ المطلوب بالضبط من تطبيقك (خارج هذا الموقع). انسخ البيانات بالأسفل، ثم عد وارفع الإيصال.",
      pay_none_methods:"الدفع الإلكتروني غير متاح حالياً. يرجى التواصل معنا.",
      pay_receipt:"الإيصال أو لقطة شاشة رمز QR",
      pay_receipt_hint:"JPG أو PNG أو WebP أو PDF، حتى 5 ميجابايت.",
      pay_note:"ملاحظة (اختياري)",
      pay_send:"إرسال الطلب",
      pay_sending:"جارٍ الإرسال...",
      pay_sent:"تم إرسال الطلب. دفعتك بانتظار تأكيدنا. يتم تفعيل قطاعاتك بعد موافقتنا.",
      pay_my:"طلباتي",
      pay_none_req:"ليس لديك طلبات بعد.",
      pay_ref:"الطلب رقم {x}",
      pay_pending:"بانتظار الموافقة",
      pay_approved:"تمت الموافقة",
      pay_rejected:"مرفوض",
      pay_cancelled:"ملغى",
      pay_cancel:"إلغاء الطلب",
      pay_cancel_ask:"هل تريد إلغاء هذا الطلب؟",
      pay_reason:"ملاحظة منا",
      pay_sent_on:"أُرسل {x}",
      pay_err_receipt:"يرجى إرفاق الإيصال أو لقطة شاشة رمز QR.",
      pay_err_method:"اختر طريقة الدفع.",
      pay_err_type:"استخدم ملف JPG أو PNG أو WebP أو PDF.",
      pay_err_size:"حجم الملف أكبر من 5 ميجابايت.",
      pay_err_load:"تعذر تحميل الصفحة. يرجى التحديث والمحاولة مرة أخرى.",
      pay_open_files:"اذهب إلى ملفاتي",
      pay_subscribe_btn:"اشترك أو جدّد",
      pay_egp:"ج.م",
      pay_sectors:"القطاعات",
      pay_no_pkgs:"لا توجد باقات متاحة حالياً.",
      pay_used:"تم استخدامها",
      pay_in_review:"طلب قيد المراجعة",
      pay_files_hint:"بعد الموافقة تظهر قطاعاتك في ملفاتي.",
      pay_create:"إنشاء حساب",
      pay_sec_hint:"اضغط على باقة تحت كل قطاع تريده. اضغط عليها مرة أخرى لإزالتها.",
      pay_starts:"يبدأ {x}",
      pay_ends:"وينتهي {x}",
      pay_renews:"تجديد: يبدأ في اليوم التالي لانتهاء فترتك الحالية ({x}).",
      pay_date_note:"التواريخ محسوبة من اليوم. تبدأ فترتك فعلياً في يوم موافقتنا على الدفع.",
      pay_order:"طلبك",
      pay_period:"الفترة",
      pay_price:"السعر",
      pay_empty_order:"طلبك فارغ. اختر باقة تحت أحد القطاعات.",
      pay_send_paid:"لقد دفعت: أرسل للموافقة",
      pay_receipt_req:"مطلوب قبل الإرسال",
      pay_receipt_ok:"تم إرفاق الإيصال",
      pay_copy_amount:"نسخ المبلغ",
      pay_open_page:"فتح صفحة الدفع",
      pay_open_hint:"ادفع من خلال الصفحة الرسمية، ثم عُد وارفع الإيصال.",
      pay_wait_title:"بانتظار تأكيدنا",
      pay_wait_sub:"نراجع إيصالك ثم نفعّل قطاعاتك. يمكنك متابعة الحالة في طلباتي بالأسفل.",
      pay_none_pkg:"بدون",
      pay_pay_exact:"ادفع هذا المبلغ بالضبط",
      pay_renew_for:"\u062a\u062c\u062f\u064a\u062f {x}. \u0627\u062e\u062a\u0631 \u0628\u0627\u0642\u0629 \u0644\u0644\u0645\u062a\u0627\u0628\u0639\u0629.",
      pay_tt_dm:"\u0646\u062d\u0648 {x} \u064a\u0648\u0645\u064b\u0627",
      pay_tt_df:"\u0646\u062d\u0648 {x} \u0623\u064a\u0627\u0645",
      pay_tt_d2:"\u0646\u062d\u0648 \u064a\u0648\u0645\u064a\u0646",
      pay_tt_d1:"\u0646\u062d\u0648 \u064a\u0648\u0645",
      pay_tt_hm:"\u0646\u062d\u0648 {x} \u0633\u0627\u0639\u0629",
      pay_tt_hf:"\u0646\u062d\u0648 {x} \u0633\u0627\u0639\u0627\u062a",
      pay_tt_h2:"\u0646\u062d\u0648 \u0633\u0627\u0639\u062a\u064a\u0646",
      pay_tt_h1:"\u0646\u062d\u0648 \u0633\u0627\u0639\u0629",
      pay_tl_typ:"\u0648\u0642\u062a \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0645\u0639\u062a\u0627\u062f: {x}",
      pay_tl_cancelled:"\u062a\u0645 \u0627\u0644\u0625\u0644\u063a\u0627\u0621",
      pay_tl_rejected:"\u0644\u0645 \u062a\u062a\u0645 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629",
      pay_tl_approved:"\u062a\u0645\u062a \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0648\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0642\u0637\u0627\u0639\u0627\u062a",
      pay_tl_decide:"\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629",
      pay_tl_review:"\u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629",
      pay_tl_sent:"\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628",
      pay_stp_aria:"\u0627\u0644\u062e\u0637\u0648\u0629 {x} \u0645\u0646 3",
      pay_stp_free:"\u063a\u064a\u0631 \u0645\u0637\u0644\u0648\u0628 (\u0645\u062c\u0627\u0646\u064a)",
      pay_stp_upload:"\u0627\u0631\u0641\u0639 \u0627\u0644\u0625\u064a\u0635\u0627\u0644",
      pay_stp_pay:"\u0627\u062f\u0641\u0639",
      pay_stp_choose:"\u0627\u062e\u062a\u0631",
      ago_today:"اليوم",
      ago_yday:"أمس",
      ago_days:"منذ {x} يوم",
      tdr_title_tag:"المناقصات | HOT INFORMATION",
      tdr_sub:"المناقصات في القطاعات المشترك بها، الأحدث أولاً.",
      tdr_filter_aria:"تصفية المناقصات",
      tdr_search_ph:"ابحث عن الجهة أو الموضوع",
      tdr_search:"بحث",
      tdr_filters:"التصفية",
      tdr_entity:"الجهة المعلنة",
      tdr_sector:"القطاع",
      tdr_all_sectors:"كل قطاعاتي",
      tdr_by:"تصفية التواريخ حسب",
      tdr_published:"تاريخ النشر",
      tdr_session:"تاريخ الجلسة",
      tdr_from:"من",
      tdr_to:"إلى",
      tdr_clear:"مسح",
      tdr_active:"عوامل التصفية المفعّلة",
      tdr_rm:"إزالة التصفية: {x}",
      tdr_last7:"آخر 7 أيام",
      tdr_new:"جديد",
      tdr_pub_on:"نُشرت {x}",
      tdr_pg:"ص {x}",
      tdr_f_session:"الجلسة",
      tdr_f_price:"ثمن الكراسة",
      tdr_f_bond:"التأمين",
      tdr_passed:"انتهت",
      tdr_view:"عرض",
      tdr_source:"المصدر",
      tdr_h_recent:"نُشرت في آخر 7 أيام",
      tdr_none_recent_f:"لا توجد مناقصات من آخر 7 أيام تطابق التصفية.",
      tdr_none_recent:"لم تُنشر مناقصات في آخر 7 أيام.",
      tdr_more_recent:"عرض المزيد من المناقصات الحديثة (المتبقي {x})",
      tdr_more_older:"المزيد من المناقصات",
      tdr_older_hint:"تعرض المناقصات المنشورة قبل أكثر من 7 أيام",
      tdr_h_older:"مناقصات سابقة",
      tdr_none_older_f:"لا توجد مناقصات سابقة تطابق التصفية.",
      tdr_none_older:"لا توجد مناقصات سابقة بعد.",
      tdr_more_left:"المزيد من المناقصات (المتبقي {x})",
      tdr_count:"المناقصات: {x}",
      tdr_rcount:"المناقصات الحديثة: {x}",
      tdr_load_err:"تعذر تحميل المناقصات",
      tdr_not_setup:"صفحة المناقصات غير مهيأة بعد. يرجى المحاولة لاحقاً.",
      tdr_not_setup_t:"صفحة المناقصات غير مهيأة بعد",
      tdr_refresh:"يرجى تحديث الصفحة والمحاولة مرة أخرى.",
      tdr_loading:"جارٍ التحميل...",
      tdr_more_fail:"عذراً، تعذر تحميل المزيد من المناقصات.",
      tdr_popup:"يرجى السماح بالنوافذ المنبثقة لهذا الموقع لعرض المناقصة، أو حاول مرة أخرى.",
      tdr_opening:"جارٍ فتح المناقصة...",
      tdr_open_fail:"عذراً، تعذر فتح هذه المناقصة.",
      tdr_signin_na:"تسجيل الدخول غير مهيأ بعد",
      tdr_later:"يرجى المحاولة لاحقاً.",
      tdr_signin_txt:"سجّل الدخول لرؤية المناقصات في قطاعاتك.",
      tdr_please:"يرجى تسجيل الدخول",
      tdr_private:"المناقصات متاحة للمشتركين فقط.",
      tdr_login:"تسجيل الدخول",
      tdr_no_sub:"لا توجد اشتراكات فعّالة بعد",
      tdr_no_sub_sub:"بمجرد اشتراكك في قطاع ستظهر مناقصاته هنا. تواصل معنا للاشتراك.",
      tdr_who1:"المناقصات في قطاع {x}، الأحدث أولاً.",
      tdr_whon:"المناقصات في قطاعاتك الـ {x}، الأحدث أولاً.",
      tdr_nt_count:"مناقصات جديدة ({n})",
      tdr_nt_rest:" في قطاعاتك منذ زيارتك الأخيرة{d}. وتظهر بعلامة ",
      tdr_nt_end:" أدناه.",
      mf_title_tag:"ملفاتي | HOT INFORMATION",
      mf_sub:"مكتبات قطاعاتك، جاهزة للفتح أو التنزيل.",
      mf_subscribe:"اشترك أو جدّد",
      mf_where:"موقعك الحالي",
      mf_search_ph:"ابحث في هذا المجلد",
      mf_search:"البحث في الملفات",
      mf_sort:"الترتيب",
      mf_name:"الاسم",
      mf_newest:"الأحدث أولاً",
      mf_tender_issues:"أعداد المناقصات",
      mf_issue:"العدد {x}",
      mf_all:"كل قطاعاتي",
      mf_welcome:"أهلاً بعودتك يا {x}. اختر قطاعاً لعرض مستنداته.",
      mf_pick:"اختر قطاعاً لعرض مستنداته.",
      mf_err_sectors:"تعذر تحميل قطاعاتك",
      mf_refresh:"يرجى تحديث الصفحة والمحاولة مرة أخرى.",
      mf_none:"لا توجد اشتراكات فعّالة بعد",
      mf_none_sub:"بمجرد اشتراكك في قطاع ستظهر مستنداته هنا. اضغط «اشترك أو جدّد» أعلاه للبدء.",
      mf_active:"القطاعات الفعّالة: {x}",
      mf_open_docs:"فتح المستندات",
      mf_ends_today:"ينتهي اليوم",
      mf_1day:"باقٍ يوم واحد",
      mf_days:"باقٍ {x} يوم",
      mf_until:"حتى {x}",
      mf_review:"التجديد قيد المراجعة",
      mf_renew:"جدّد",
      mf_renew_aria:"تجديد {x}",
      mf_err_files:"تعذر تحميل هذه الملفات",
      mf_empty:"لا يوجد شيء هنا بعد",
      mf_empty_sub:"تظهر المستندات الجديدة في هذا المجلد فور نشرها.",
      mf_nomatch:"لا توجد نتائج",
      mf_nomatch_sub:"لا شيء في هذا المجلد يطابق \"{x}\".",
      mf_folders:"المجلدات",
      mf_docs:"المستندات",
      mf_new:"جديد",mf_u_b:"بايت",mf_u_kb:"ك.ب",mf_u_mb:"م.ب",mf_k_image:"صورة",mf_k_file:"ملف",mf_k_word:"وورد",mf_k_excel:"إكسل",mf_k_ppt:"باوربوينت",nav_main:"التنقل الرئيسي",
      mf_added:"أُضيف {x}",
      mf_open:"فتح",
      mf_download:"تنزيل",
      mf_open_aria:"فتح {x}",
      mf_dl_aria:"تنزيل {x}",
      mf_popup:"يرجى السماح بالنوافذ المنبثقة لفتح الملفات، أو استخدم التنزيل.",
      mf_opening:"جارٍ فتح ملفك...",
      mf_open_fail:"عذراً، تعذر فتح هذا الملف.",
      mf_preparing:"جارٍ التحضير...",
      mf_dl_fail:"عذراً، تعذر تنزيل هذا الملف.",
      mf_signin_txt:"سجّل الدخول لرؤية مكتبات قطاعاتك.",
      mf_private:"مستنداتك خاصة بحسابك.",
      mf_access:"{name} · اشتراكك ساري حتى {x}",
      bc_label:"مسار التنقل",
      offers_title:"عروض خاصة لعملاء هوت",
      offers_sub:"خصومات حصرية من الجهات الشريكة",
      offers_all:"كل العروض",
      offers_cta:"عرض التفاصيل",
      offers_ends_today:"ينتهي اليوم",
      offers_1day:"باقٍ يوم واحد",
      offers_days:"باقٍ {x} يوم",
      offers_until:"حتى {x}",
      offers_open:"عرض مستمر",
      prompts:['مرحباً HOT INFORMATION، أود الاشتراك في تحديثات المناقصات','كم يستغرق تقديم طلب براءة اختراع في الإمارات؟','هل يمكنكم ترجمة براءة الاختراع الخاصة بي إلى العربية؟','ما المستندات المطلوبة لدخول المرحلة الوطنية لمعاهدة PCT؟']
    }
  };
  if(document.currentScript&&document.currentScript.hasAttribute('data-passive'))return {DICT}; // admin page: word lists only, no language switching
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const put=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
  let langs=['en','ar','both'].includes(get(CS))?get(CS):'en',ui={};
  function pick(){
    if(langs==='ar')return 'ar';
    if(langs==='en')return 'en';
    const q=new URLSearchParams(location.search).get('lang');
    if(q==='ar'||q==='en'){put(LS,q);return q}
    return get(LS)==='ar'?'ar':'en';
  }
  const PH='المحتوى العربي'; // placeholder shown wherever the admin has not entered Arabic yet (About, service pages, team, testimonials)
  const K={DICT,AR_FILE,PH,lang:pick(),rtl:false,EN:null,AR:null};
  function fonts(){
    if(document.getElementById('khip-ar-fonts'))return;
    const l=document.createElement('link');l.id='khip-ar-fonts';l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600&family=Noto+Naskh+Arabic:wght@500;600&display=swap';
    document.head.appendChild(l);
  }
  function apply(){
    K.rtl=K.lang==='ar';
    const h=document.documentElement;h.lang=K.lang;h.dir=K.rtl?'rtl':'ltr';
    if(K.rtl)fonts();
  }
  apply();
  K.t=(key,vars)=>{
    let v=(K.rtl&&ui[key]!=null&&String(ui[key]).trim()!==''?ui[key]:null)??DICT[K.lang][key]??DICT.en[key]??key;
    if(typeof v==='string'&&vars)for(const n in vars)v=v.split('{'+n+'}').join(vars[n]);
    return v;
  };
  K.dom=(root=document)=>{
    root.querySelectorAll('[data-i18n]').forEach(e=>{e.textContent=K.t(e.dataset.i18n)});
    root.querySelectorAll('[data-i18n-attr]').forEach(e=>e.dataset.i18nAttr.split(';').forEach(p=>{const [a,k]=p.split(':');if(a&&k)e.setAttribute(a.trim(),K.t(k.trim()))}));
  };
  // The admin's language choice. Returns true when the language shown has just changed.
  K.settings=v=>{
    const n=['en','ar','both'].includes(v)?v:'en';
    langs=n;put(CS,n);const old=K.lang;K.lang=pick();apply();K.mount();
    return old!==K.lang;
  };
  K.langs=()=>langs;
  K.set=l=>{put(LS,l);const u=new URL(location.href);u.searchParams.delete('lang');location.href=u.pathname+u.search+u.hash;location.reload()};
  // The EN | AR button: any element with id="lang-switch" (only filled when both languages are on)
  K.mount=()=>{
    document.querySelectorAll('#lang-switch').forEach(e=>{
      if(langs!=='both'){e.innerHTML='';return}
      e.innerHTML=`<button type="button" class="lang-btn" lang="${K.rtl?'en':'ar'}" aria-label="${K.rtl?'Switch to English':'التبديل إلى العربية'}">${DICT[K.lang].switch_to}</button>`;
      e.firstChild.onclick=()=>K.set(K.rtl?'en':'ar');
    });
  };
  const JSON_GET=async u=>{const r=await fetch(u,{cache:'no-cache'});if(!r.ok)throw new Error(r.status);return r.json()};
  const txt=v=>typeof v==='string'&&v.trim()!=='';
  const PHF={testimonials:['name','role','text'],employees:['name','position']};
  const NEUTRAL=new Set(['id','image','icon','page','code','flag','date','category']);
  // Arabic over English, field by field; empty Arabic fields keep the English text.
  K.merge=(en,ar)=>{
    ui=(ar&&ar.ui)||{};
    if(!K.rtl)return en;
    const o=JSON.parse(JSON.stringify(en));
    (o.jurisdictions||[]).forEach(j=>{j.enCountry=j.country});
    o.chatPrompts=ar&&Array.isArray(ar.chatPrompts)&&ar.chatPrompts.some(txt)?ar.chatPrompts.filter(txt):DICT.ar.prompts;
    (o.services||[]).forEach(s=>{s.enTitle=s.title});
    ar=ar||{};
    for(const k of ['aboutMainText','about'])if(txt(ar[k]))o[k]=ar[k];
    const enC=en.newsCategories||[],arC=ar.newsCategories||[],cm={};
    enC.forEach((c,i)=>{if(txt(arC[i]))cm[c]=arC[i]});
    o.newsCategories=enC.map(c=>cm[c]||c);
    for(const sec of ['carousel','jurisdictions','news','services','testimonials','employees','products']){
      const a=ar[sec];if(!Array.isArray(a)||!Array.isArray(o[sec]))continue;
      const by=new Map(a.filter(x=>x&&x.id!=null).map(x=>[String(x.id),x]));
      o[sec].forEach((it,i)=>{const x=by.get(String(it.id))||(it.id==null?a[i]:null);if(!x)return;
        for(const [k,v] of Object.entries(x))if(!NEUTRAL.has(k)&&txt(v))it[k]=v});
    }
    // Team and testimonials: Arabic only. Anything the admin has not written shows the placeholder, never English.
    for(const [sec,fs] of Object.entries(PHF)){
      const a=Array.isArray(ar[sec])?ar[sec]:[],by=new Map(a.filter(x=>x&&x.id!=null).map(x=>[String(x.id),x]));
      (o[sec]||[]).forEach((it,i)=>{const x=by.get(String(it.id))||(it.id==null?a[i]:null)||{};fs.forEach(f=>{it[f]=txt(x[f])?x[f]:PH})});
    }
    (o.news||[]).forEach(n=>{if(cm[n.category])n.category=cm[n.category]});
    return o;
  };
  // ---- Phase 2 helpers: About page, service pages ----
  // Arabic field of one item (by id), or the placeholder when the admin has not written it.
  K.arOr=(sec,id,field)=>{const a=((K.AR&&K.AR[sec])||[]).find(x=>x&&String(x.id)===String(id));return a&&txt(a[field])?a[field]:PH};
  // Text blocks marked data-t="key" take their Arabic from app-data.ar.json > pageText > <page> > key.
  // (the page's file name without .html, eg "about"). The admin writes them under Arabic > Page text. Service names marked data-svc-page="patents.html" follow the service's Arabic title.
  K.fill=(root=document)=>{
    if(!K.rtl)return;
    const file=(location.pathname.split('/').pop()||'index').replace(/\.html$/,''),pt=((K.AR&&K.AR.pageText)||{})[file]||{};
    root.querySelectorAll('[data-t]').forEach(e=>{const v=pt[e.dataset.t];e.textContent=txt(v)?v:PH});
    root.querySelectorAll('[data-svc-page]').forEach(e=>{
      const sv=((K.EN&&K.EN.services)||[]).find(x=>x.page===e.dataset.svcPage);
      e.textContent=sv?K.arOr('services',sv.id,'title'):PH;
    });
    if(pt._title&&txt(pt._title))document.title=pt._title;
    document.documentElement.setAttribute('data-ar-ready','1');
  };
  // Loads app-data.json (always: it holds the settings), then the Arabic file when Arabic is showing.
  K.data=async(url='./app-data.json')=>{
    const en=await JSON_GET(url);
    K.settings(en.languages);
    let ar=null;
    if(K.rtl){try{ar=await JSON_GET(AR_FILE)}catch{}}
    K.EN=en;K.AR=ar;
    return K.merge(en,ar);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',K.mount);else K.mount();
  return K;
})();
