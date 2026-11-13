/* ============================================================================
   SLEEPMATE Pro — BỘ ĐẾM LƯỢT TRUY CẬP (dùng chung cho index.html & admin.html)
   ----------------------------------------------------------------------------
   Mục đích: đếm số người vào app để Admin báo cáo (VD: 500 lượt).

   Cách hoạt động:
     1. Mỗi lượt vào = 1 "visitor" gắn với mã máy (localStorage, tồn tại 400 ngày).
        → Cùng 1 người mở nhiều lần KHÔNG bị đếm trùng.
     2. Ghi vào Firestore:
          visits/{visitorId}          — hồ sơ người truy cập (ngày đầu, cuối, số lần mở)
          visits/{visitorId}/sessions — mỗi phiên mở app 1 document (đếm phiên, giờ, thiết bị)
          visitsDaily/{yyyy-mm-dd}    — tổng hợp theo ngày (khách mới / quay lại / thiết bị)
     3. Đăng nhập ẩn danh (Firebase Anonymous Auth) để rules cho phép ghi.
        → Không cần email/mật khẩu, không làm phiền người dùng.

   Nếu project chưa bật Anonymous Auth: bộ đếm tự tắt (không lỗi, không chặn app).
   Ghi 1 lần rồi thôi (không listen) → tốn rất ít lượt đọc.
   ========================================================================== */
window.SLEEPMATE_TRACK = (function () {
  'use strict';

  const CONFIG = window.SLEEPMATE_FB_CONFIG || null;
  const CONFIGURED = !!(CONFIG && CONFIG.projectId &&
    !/DAN_VAO_DAY|YOUR_|xxx/i.test(String(CONFIG.projectId)));

  const LS_ID = 'sm_visitor_id';
  const LS_FIRST = 'sm_visitor_first';
  const LS_LAST = 'sm_visit_last';
  const LS_ONCE = 'sm_visit_once_v1';   // đánh dấu đã đếm lượt truy cập của máy này

  let db = null, auth = null;
  let started = false;
  let anonMode = '';   // 'anonymous' | 'guest'

  const $ = (s) => { try { return localStorage.getItem(s); } catch (e) { return null; } };
  const $$ = (s, v) => { try { localStorage.setItem(s, v); } catch (e) {} };

  const pad2 = (n) => String(n).padStart(2, '0');
  function dayKey(d = new Date()) {
    const x = new Date(d);
    if (x.getHours() < 4) x.setDate(x.getDate() - 1);
    return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`;
  }

  /* Mã máy: ngẫu nhiên, không chứa thông tin cá nhân */
  function visitorId() {
    let id = $(LS_ID);
    if (!id) {
      const rnd = (window.crypto && window.crypto.randomUUID)
        ? window.crypto.randomUUID().replace(/-/g, '')
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      id = 'v_' + rnd.slice(0, 20);
      $$(LS_ID, id);
      $$(LS_FIRST, String(Date.now()));
    }
    return id;
  }

  /* Thiết bị / trình duyệt — chỉ để chia nhóm thống kê, không định danh */
  function deviceInfo() {
    const ua = navigator.userAgent || '';
    const os = /iPhone|iPad|iPod/i.test(ua) ? 'iOS'
      : /Android/i.test(ua) ? 'Android'
        : /Windows/i.test(ua) ? 'Windows'
          : /Mac OS X/i.test(ua) ? 'macOS'
            : /Linux/i.test(ua) ? 'Linux' : 'Khác';
    const browser = /Edg\//i.test(ua) ? 'Edge'
      : /OPR\/|Opera/i.test(ua) ? 'Opera'
        : /Chrome\//i.test(ua) ? 'Chrome'
          : /Firefox\//i.test(ua) ? 'Firefox'
            : /Safari\//i.test(ua) ? 'Safari' : 'Khác';
    const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
      || window.navigator.standalone === true;
    return {
      os, browser,
      mode: standalone ? 'pwa' : 'browser',
      screen: (window.screen && window.screen.width ? window.screen.width + 'x' + window.screen.height : ''),
      lang: navigator.language || ''
    };
  }

  /* Nguồn truy cập: đọc từ ?src= hoặc referrer */
  function sourceOf() {
    try {
      const p = new URLSearchParams(location.search);
      const src = (p.get('src') || p.get('utm_source') || '').trim();
      if (src) return src.slice(0, 40);
      const ref = document.referrer || '';
      if (!ref) return 'direct';
      const h = new URL(ref).hostname.replace(/^www\./, '');
      if (h === location.hostname) return 'internal';
      if (/facebook|fb\./i.test(h)) return 'facebook';
      if (/zalo/i.test(h)) return 'zalo';
      if (/google/i.test(h)) return 'google';
      if (/tiktok/i.test(h)) return 'tiktok';
      if (/youtube/i.test(h)) return 'youtube';
      if (/github/i.test(h)) return 'github';
      return h.slice(0, 40);
    } catch (e) { return 'unknown'; }
  }

  /* ------------------------- đăng nhập ẩn danh ------------------------- */
  /* Dùng Firebase APP RIÊNG (không phải app mặc định) để không đụng vào
     trạng thái đăng nhập của app chính — nếu không app sẽ tưởng khách
     đã đăng nhập và mở khoá toàn bộ giao diện. */
  const TRACKER_APP = 'sm-tracker';

  async function ensureAnon() {
    if (!CONFIGURED || !window.firebase) return null;
    const fb = window.firebase;

    let app;
    try {
      app = (fb.apps || []).find((a) => a.name === TRACKER_APP)
        || fb.initializeApp(CONFIG, TRACKER_APP);
    } catch (e) {
      try { app = fb.app(TRACKER_APP); } catch (e2) { return null; }
    }

    auth = app.auth();
    db = app.firestore();

    if (auth.currentUser) return auth.currentUser;
    // Chờ trạng thái auth sẵn sàng (nếu đã có phiên từ lần trước)
    const existing = await new Promise((resolve) => {
      let done = false;
      const finish = (u) => { if (!done) { done = true; resolve(u); } };
      const un = auth.onAuthStateChanged((u) => { finish(u); try { un(); } catch (e) {} });
      setTimeout(() => finish(auth.currentUser || null), 3500);
    });
    if (existing) return existing;

    // 1) Ưu tiên đăng nhập ẩn danh (sạch nhất, không tạo tài khoản rác)
    try {
      const cred = await auth.signInAnonymously();
      anonMode = 'anonymous';
      return cred.user;
    } catch (e) {
      anonMode = 'guest';
      try { console.info('[SM track] Anonymous Auth chưa bật → dùng tài khoản khách tự động.', e && e.code); } catch (err) {}
    }

    // 2) Dự phòng: tài khoản khách gắn với máy (Email/Password đang bật sẵn).
    //    Mật khẩu sinh ngẫu nhiên, lưu trên máy → mỗi máy đúng 1 tài khoản, không cần người dùng nhập gì.
    return await guestSignIn();
  }

  /* Tài khoản khách: email + mật khẩu sinh tự động, gắn với mã máy */
  async function guestSignIn() {
    const vid = visitorId();
    const email = 'guest-' + vid.replace(/^v_/, '') + '@sleepmate-guest.local';
    const LS_PW = 'sm_visitor_pw';
    let pw = $(LS_PW);
    if (!pw) {
      const rnd = (window.crypto && window.crypto.getRandomValues)
        ? Array.from(window.crypto.getRandomValues(new Uint8Array(18))).map((b) => ('0' + b.toString(16)).slice(-2)).join('')
        : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      pw = 'Sm_' + rnd;
      $$(LS_PW, pw);
    }
    try {
      // Thử tạo mới trước
      const cred = await auth.createUserWithEmailAndPassword(email, pw);
      return cred.user;
    } catch (e) {
      const code = (e && e.code) || '';
      // Đã có tài khoản từ lần trước → đăng nhập lại
      if (/email-already-in-use|invalid-email|weak-password/i.test(code)) {
        try {
          const cred = await auth.signInWithEmailAndPassword(email, pw);
          return cred.user;
        } catch (e2) {
          try { console.warn('[SM track] không đăng nhập được tài khoản khách:', e2 && e2.code); } catch (err) {}
          return null;
        }
      }
      try { console.warn('[SM track] tạo tài khoản khách thất bại:', code); } catch (err) {}
      return null;
    }
  }

  /* Ghi có giới hạn thời gian — Firestore có thể treo khi hết quota (429).
     Không có timeout thì promise không bao giờ xong và treo luồng nền. */
  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms || 8000))
    ]);
  }

  /* ------------------------------ ghi nhận ------------------------------ */
  async function record() {
    const user = await ensureAnon();
    if (!user || !db) return;

    const vid = visitorId();
    const now = Date.now();
    const today = dayKey();
    const dev = deviceInfo();
    const source = sourceOf();
    const firstAt = Number($(LS_FIRST) || now);
    const isNewVisitor = !$(LS_ONCE);

    // 1) Hồ sơ người truy cập (upsert) — dùng set/merge để không cần đọc trước
    const vRef = db.collection('visits').doc(vid);
    const payload = {
      visitorId: vid,
      lastAt: now,
      lastDay: today,
      firstAt,
      firstDay: dayKey(firstAt),
      os: dev.os,
      browser: dev.browser,
      mode: dev.mode,
      screen: dev.screen,
      lang: dev.lang,
      source,
      uid: user.uid,
      ownerUid: user.uid
    };
    // Ghi hồ sơ (upsert, không cần đọc trước) rồi cộng 1 vào số lần mở.
    // FieldValue.increment trên field chưa tồn tại coi như 0 → lượt đầu tiên = 1.
    try {
      await withTimeout(vRef.set(payload, { merge: true }));
      await withTimeout(vRef.update({ visitsCount: window.firebase.firestore.FieldValue.increment(1) }));
    } catch (e) {
      try { console.warn('[SM track] ghi visits:', (e && e.code) || (e && e.message)); } catch (err) {}
    }

    // 2) Phiên mở app
    try {
      await withTimeout(vRef.collection('sessions').add({
        at: now, day: today, os: dev.os, browser: dev.browser,
        mode: dev.mode, source, newVisitor: isNewVisitor,
        ownerUid: user.uid
      }));
    } catch (e) { /* bỏ qua */ }

    // 3) Tổng hợp theo ngày (tăng dần, không cần đọc)
    try {
      const inc = window.firebase.firestore.FieldValue.increment;
      const dRef = db.collection('visitsDaily').doc(today);
      const dPayload = {
        day: today,
        sessions: inc(1),
        updatedAt: now
      };
      if (isNewVisitor) dPayload.newVisitors = inc(1);
      else dPayload.returning = inc(1);
      const osKey = 'os_' + dev.os.replace(/[^a-zA-Z]/g, '');
      dPayload[osKey] = inc(1);
      await withTimeout(dRef.set(dPayload, { merge: true }));
    } catch (e) { /* bỏ qua */ }

    $$(LS_ONCE, '1');
    $$(LS_LAST, String(now));
  }

  /* ------------------------------- API -------------------------------- */
  function start() {
    if (started) return;
    started = true;
    if (!CONFIGURED) return;
    // Không chặn giao diện: chạy nền sau khi trang đã sẵn sàng
    const run = () => { record().catch(() => {}); };
    if (document.readyState === 'complete') setTimeout(run, 800);
    else window.addEventListener('load', () => setTimeout(run, 800), { once: true });
  }

  return {
    start,
    dayKey,
    visitorId,
    isConfigured: () => CONFIGURED,
    /* Cho admin đọc lại mã máy hiện tại (debug) */
    peek: () => ({ id: $(LS_ID), first: $(LS_FIRST), last: $(LS_LAST) })
  };
})();
