# SLEEPMATE Pro — Bản PWA

Thư mục này là bản web (Progressive Web App) của SLEEPMATE Pro — chạy được trên iPhone và Android, cài lên màn hình chính như app thật.

## Chạy thử trên máy tính

```bash
npx serve .
# hoặc
npx http-server . -p 8080
```

Mở `http://localhost:8080`. **Không mở trực tiếp file `index.html`** — Service Worker và Notification chỉ hoạt động trong secure context (`https://` hoặc `localhost`).

## Deploy

Thư mục này tự chứa, deploy nguyên thư mục lên bất kỳ hosting tĩnh nào:

| Hosting | Cách làm |
|---|---|
| **GitHub Pages** | Đẩy toàn bộ file lên nhánh `main`, Settings → Pages → Source: `main / (root)` |
| **Netlify** | Kéo thả `sleepmate-pwa.zip` lên https://app.netlify.com/drop |
| **Cloudflare Pages** | Upload trực tiếp hoặc nối GitHub repo |
| **Vercel** | `vercel --prod` trong thư mục này |

Đều miễn phí và cho HTTPS tự động (bắt buộc để cài PWA).

## Cấu trúc

```
├── index.html              # Toàn bộ app — 1 file, không cần build
├── firebase-config.js      # Cấu hình Firebase + email Admin (dán thông số vào đây)
├── admin.html              # Bảng điều khiển Admin (thống kê, xếp hạng, nhắc nhở, luật)
├── firestore.rules         # Luật bảo mật dữ liệu (dán vào Firestore → Rules)
├── FIREBASE-SETUP.md       # Hướng dẫn bật Firebase từng bước
├── sw.js                   # Service Worker: cache offline, notificationclick, push
├── manifest.webmanifest    # Tên app, icon, màu, chế độ standalone
├── icon-192.png
├── icon-512.png
├── icon-maskable-512.png
└── apple-touch-icon.png
```

`index.html` là **bản sao byte-for-byte** của `sleepmate-pro.html` (file gốc trong dự án). Sửa app thì sửa file gốc rồi copy đè sang đây.

## Cài lên điện thoại

**iPhone / iPad** — phải dùng **Safari**:
1. Mở link HTTPS bằng Safari
2. Nút **Chia sẻ** → **Thêm vào MH chính** → **Thêm**
3. Mở app từ icon → tab **Câu Đố & Thông Báo** → **Bật thông báo** → **Cho phép**

Cần **iOS 16.4+** để nhận thông báo hệ thống. Bản PWA trên iPhone **không** nhắc được khi app đã bị đóng hẳn (Apple giới hạn — cần Web Push + máy chủ).

**Android** — dùng **Chrome**:
1. Mở link HTTPS bằng Chrome
2. Menu **⋮** → **Cài đặt ứng dụng** (hoặc bấm **Cài app** trong tab Câu Đố & Thông Báo)
3. Mở app từ icon ngoài màn hình chính

Muốn nhắc nhở hoạt động cả khi đã đóng hẳn app trên Android → dùng **APK** (`SLEEPMATE-Pro-Android.apk`), không dùng PWA.

## Cập nhật app

1. Sửa `../sleepmate-pro.html` (nguồn chân lý duy nhất)
2. Copy đè sang `index.html`
3. Nếu đổi logic hoặc thêm file vào app shell: tăng `CORE_CACHE` và `RUNTIME_CACHE` trong `sw.js` (hiện là `v7`) — bắt buộc, nếu không người dùng cũ vẫn chạy bản cache cũ
4. Deploy lại

## Tính năng mới ở v3.2.1 — Firebase đã bật thật

- **Firebase đã cấu hình xong** (`sleepmate-pro`) — app bắt buộc đăng nhập thật, dữ liệu lên cloud
- Admin: **klocevin@gmail.com**
- Sửa lỗi: nút "Lưu & áp dụng" luật nhóm thất bại do Firestore **cấm mảng lồng mảng**
  (`week.days` giờ lưu dạng map `{"0":[…], … "6":[…]}`) — `normalizeWeek()` đọc được cả 2 dạng
- Chế độ dùng thử **bị vô hiệu khi đã cấu hình Firebase** (tránh lách đăng nhập)
- Rules cho phép Admin xoá `days`/`locks`/`inbox` của thành viên
- Service worker cache `v7`
- APK `versionCode 4` / `versionName 3.2.1`

## Tính năng mới ở v3.2 — Nhiều người dùng & Admin

- **Bắt buộc đăng nhập** — mỗi người tự đăng ký tài khoản (Email + mật khẩu)
- Dữ liệu giấc ngủ **tự đồng bộ** lên Firebase mỗi 45 giây + lúc qua ngày mới
- **Trang Admin** (`admin.html`): danh sách người dùng, tỷ lệ hoàn hảo, mức tham gia,
  bảng xếp hạng, lịch sử khoá, chi tiết 14 đêm
- Admin **gửi nhắc nhở** cho từng người hoặc cả nhóm (hộp thư trong app)
- Admin **cài luật chung từ xa**: giới nghiêm, hạn mức phút, lịch khoá ban đêm
- Phân quyền bảo mật bằng `firestore.rules`
- Xem hướng dẫn bật Firebase từng bước trong `FIREBASE-SETUP.md`

Khi **chưa** cấu hình Firebase, app vẫn mở ở **Chế độ dùng thử** (dữ liệu chỉ lưu trên máy).

## Tính năng mới ở v3.1

**Lịch khóa theo tuần** — tab *Lịch Khóa Tuần*:
- 7 thứ, mỗi ngày tối đa 8 khung giờ
- Đặt tên khung, bật/tắt từng khung không cần xóa
- Khung qua nửa đêm (23:00–06:00) tính đúng cả ngày hôm sau
- Preset nhanh: Ngủ đêm / Giờ học / Nghỉ trưa
- Áp dụng 1 ngày cho cả tuần
- Đếm ngược khung kế tiếp + lịch sử 20 lần khóa gần nhất
- Đang trong khung cấm: giải đố chỉ hoãn được 5 phút

## Giới hạn

- Không đọc được thời gian dùng app khác (cần Usage Access trên Android, iOS không cho phép)
- Lịch khóa chỉ chặn bên trong SLEEPMATE
- iOS không hỗ trợ rung bằng Web API
- Trên PWA, thông báo khi đã đóng hẳn app phụ thuộc hệ điều hành — không đảm bảo
