# SLEEPMATE Pro 🌙

Ứng dụng kỷ luật giấc ngủ: đo thời gian dùng máy ban đêm, **lịch khóa theo tuần**, tự khóa giới nghiêm, nhắc nhở khi thoát app, thống kê thực tế và trợ lý AI.

**Dùng ngay:** mở link GitHub Pages của repo này bằng Chrome (Android) hoặc Safari (iPhone) rồi cài lên màn hình chính.

---

## 📲 Cài đặt

### iPhone / iPad (Safari)

1. Mở link bằng **Safari** (bắt buộc Safari — Chrome trên iOS không cài được PWA)
2. Bấm **Chia sẻ** → **Thêm vào MH chính** → **Thêm**
3. Mở app từ icon vừa tạo → tab **Câu Đố & Thông Báo** → **Bật thông báo** → **Cho phép**

Cần iOS 16.4+ để nhận thông báo hệ thống.

### Android — PWA (Chrome)

1. Mở link bằng **Chrome**
2. Bấm **Cài app** trong tab **Câu Đố & Thông Báo**, hoặc menu **⋮ → Cài đặt ứng dụng**
3. Mở app từ icon ngoài màn hình chính

### Android — APK (khuyên dùng, nhắc cả khi đóng app)

Tải **[`apk/SLEEPMATE-Pro-Android.apk`](apk/SLEEPMATE-Pro-Android.apk)** → mở file → bật *Cài từ nguồn không rõ* → **Cài đặt**.

Sau khi cài, vào **Cài đặt → Ứng dụng → SLEEPMATE Pro** và bật:
- Thông báo, Âm thanh, Rung, Hiển thị trên màn hình khóa
- **Báo thức chính xác** (Android 12+)
- **Pin → Không tối ưu hóa** (để hệ thống không trì hoãn báo thức)

> Bản APK chạy **hoàn toàn offline** — Tailwind, Font Awesome và font chữ đã nhúng sẵn trong APK, không cần mạng.

---

## 📅 Lịch khóa theo tuần (mới ở v3.1)

Mỗi thứ trong tuần có lịch khung giờ riêng:

- **Thêm nhiều khung mỗi ngày** — ví dụ Thứ 2 có "Giờ học 19:00–21:30" và "Ngủ đêm 23:00–06:00"
- **Bật/tắt từng khung** bằng checkbox, không cần xóa
- **Đặt tên khung** để biết mình đang bị khóa vì lý do gì
- **Khung qua nửa đêm** (23:00–06:00) tự động tính đúng cả ngày hôm sau
- **3 preset nhanh**: Ngủ đêm, Giờ học, Nghỉ trưa
- **Áp dụng ngày này cho cả tuần** — đặt 1 lần, dùng 7 ngày
- **Đếm ngược**: khung kế tiếp còn bao lâu, đang trong khung nào
- **Lịch sử khóa**: ghi lại 20 lần khóa gần nhất theo lịch

### Cơ chế khóa

| Tình huống | Hành vi |
|---|---|
| Đang trong khung giờ cấm | Đếm ngược 30 giây → phủ màn hình khóa + còi + rung |
| Giải đúng câu đố khi đang trong khung | Chỉ **hoãn 5 phút**, hết 5 phút khóa lại |
| Giải đúng khi khóa do hạn mức | Mở hoàn toàn (nếu không còn trong khung cấm) |
| Qua khung giờ | Tự mở, không cần thao tác |

---

## ✨ Tính năng

| | Android APK | Android PWA | iPhone PWA |
|---|---|---|---|
| Thông báo khi đang mở app | ✅ | ✅ | ✅ (iOS 16.4+) |
| Thông báo khi vừa thoát | ✅ | ✅ | ✅ |
| **Thông báo khi đã đóng hẳn app** | ✅ Báo thức hệ thống | ⚠️ HĐH có thể tạm dừng | ❌ Cần Web Push + server |
| Rung | ✅ | ✅ | ❌ iOS không hỗ trợ |
| **Lịch khóa theo tuần** | ✅ Kể cả khi đóng | ⚠️ Khi app chạy | ⚠️ Khi app chạy |
| Nhắc giới nghiêm hằng ngày | ✅ Kể cả khi đóng | ⚠️ Khi app chạy | ⚠️ Khi app chạy |
| Tự đặt lại báo thức sau reboot | ✅ | ❌ | ❌ |

**Trong app có:**
- Đo thời gian dùng máy thật (foreground / idle / background), biểu đồ 12 giờ, danh sách phiên, lịch sử 7 đêm
- **Lịch khóa tuần**: 7 thứ × tối đa 8 khung giờ, đặt tên, bật/tắt, preset, lịch sử khóa
- Khóa giới nghiêm + hạn mức 15/30/45/60 phút, phải giải câu đố mới mở
- Câu đố tùy chỉnh (tự đặt / toán / cam kết)
- Bám đuổi khi thoát app: nhắc lặp tới khi quay lại
- Cảm biến góc nghiêng phát hiện nằm bấm máy
- Trợ lý AI (offline + tùy chọn kết nối OpenAI/Gemini/Groq/DeepSeek/OpenRouter/Ollama bằng key của bạn)
- Lịch ngủ 4 nhóm đối tượng, tính chu kỳ 90 phút
- Nhật ký xả lo âu, thở 4-7-8, sóng não binaural
- Lọc ánh sáng xanh, chế độ ngủ

---

## 🗂 Cấu trúc repo

```
├── index.html                  # Toàn bộ app (1 file, không build step)
├── sw.js                       # Service Worker: cache offline + notificationclick
├── manifest.webmanifest        # PWA manifest
├── icon-192.png
├── icon-512.png
├── icon-maskable-512.png
├── apple-touch-icon.png
├── apk/
│   └── SLEEPMATE-Pro-Android.apk   # APK v3.1 (versionCode 2), offline, debug-signed
└── source/
    └── SLEEPMATE-full-source.zip   # Toàn bộ mã nguồn + dự án Gradle
```

---

## 🔒 Quyền riêng tư

Toàn bộ dữ liệu (thời gian dùng, câu đố, lịch khóa, nhật ký, API key) lưu trong `localStorage` trên máy bạn. Không có máy chủ trung gian, không thu thập dữ liệu.

Nếu bạn nhập API key cho trợ lý AI, key chỉ được gửi tới đúng Base URL bạn cấu hình.

---

## ⚠️ Giới hạn đã biết

- Ứng dụng **không đọc được** thời gian bạn dùng Facebook, TikTok… (cần quyền Usage Access trên Android; iOS không cho phép). App đo thời gian bạn ở trong SLEEPMATE và thời gian bạn rời đi.
- Lịch khóa tuần chỉ chặn **bên trong SLEEPMATE**, không chặn app khác. Muốn chặn toàn máy cần quyền Device Admin / Screen Time của hệ điều hành.
- Một số máy tối ưu pin mạnh (Xiaomi, OPPO, vivo, Samsung) có thể trì hoãn báo thức Android nếu không tắt tối ưu pin.
- APK ký bằng **debug key** để cài trực tiếp, không phải bản phát hành Play Store.
- Trợ lý AI có thể trả lời sai. Không dùng thay cho lời khuyên y khoa.

---

## 🛠 Tự build

Yêu cầu: JDK 17, Android SDK (platform 34, build-tools 34), Gradle 8.7.

```bash
# Giải nén source/SLEEPMATE-full-source.zip
export JAVA_HOME=/path/to/jdk-17
export ANDROID_HOME=/path/to/android-sdk
cd android
gradle assembleDebug --no-daemon
# APK: app/build/outputs/apk/debug/app-debug.apk
```

> Gradle không build được từ đường dẫn có dấu tiếng Việt (`Bad pathname`). Copy thư mục sang đường dẫn ASCII thuần trước khi build.

Chi tiết kiến trúc, khác biệt giữa các bản HTML và cách cập nhật app: xem `README.md` bên trong `source/SLEEPMATE-full-source.zip`.
