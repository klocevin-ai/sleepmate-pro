# 🔥 Hướng dẫn bật tài khoản & Admin cho SLEEPMATE Pro (Firebase)

SLEEPMATE Pro hiện có **hệ thống nhiều người dùng**: mỗi người tự đăng ký tài khoản,
dữ liệu giấc ngủ tự động gửi lên đám mây, và **bạn (Admin)** xem bảng tổng hợp,
tỷ lệ hoàn hảo, mức tham gia, xếp hạng, gửi nhắc nhở và cài luật cho cả nhóm.

Toàn bộ chạy miễn phí trên **Firebase** (không cần thuê máy chủ).
Bạn chỉ cần làm **1 lần**, khoảng 5–10 phút.

---

## Bước 1 — Tạo project Firebase

1. Mở https://console.firebase.google.com → **Tạo dự án** (Add project)
2. Đặt tên tùy ý, ví dụ `sleepmate-pro` → nhấn **Continue**
3. Có thể tắt Google Analytics (không bắt buộc) → **Create project**

## Bước 2 — Bật đăng nhập Email/Mật khẩu

1. Menu trái: **Build → Authentication → Get started**
2. Tab **Sign-in method** → chọn **Email/Password** → bật (Enable) → Save

## Bước 3 — Tạo Firestore Database

1. Menu trái: **Build → Firestore Database → Create database**
2. Chọn vùng gần Việt Nam nhất, ví dụ **asia-southeast1 (Singapore)**
   *(vùng khác cũng được, chỉ ảnh hưởng chút độ trễ)*
3. Chọn **Production mode** → **Create**
4. Mở tab **Rules** → xóa hết nội dung cũ → dán toàn bộ nội dung file
   [`firestore.rules`](./firestore.rules) vào → **Publish**

> ⚠️ Nhớ sửa email trong `firestore.rules` (xem Bước 5).

## Bước 4 — Lấy thông số kết nối Web app

1. Menu trái: biểu tượng **bánh răng ⚙️ → Project settings**
2. Cuộn xuống mục **Your apps** → click icon **`</>` (Web)** → đăng ký app
   (nickname tùy ý, bỏ tick Firebase Hosting)
3. Firebase hiện khối:
   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...firebaseapp.com",
     projectId: "...",
     ...
   };
   ```

## Bước 5 — Dán vào file `firebase-config.js`

Mở file [`firebase-config.js`](./firebase-config.js) (cùng thư mục app) và thay
từng chỗ `DAN_VAO_DAY` bằng giá trị tương ứng:

```js
window.SLEEPMATE_FB_CONFIG = {
  apiKey: "AIza...",            // thay DAN_VAO_DAY
  authDomain: "ten.firebaseapp.com",
  projectId: "ten",
  storageBucket: "ten.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc...",
  measurementId: ""
};

window.SLEEPMATE_ADMIN_EMAILS = ["admin@truong.edu.vn"];  // ← email Admin (bạn)
```

Và mở [`firestore.rules`](./firestore.rules) → thay `'DAN_VAO_DAY_EMAIL_ADMIN'`
bằng **đúng email Admin** ở trên (viết thường).

## Bước 6 — Cập nhật lại trang web (deploy)

1. `firebase-config.js` và `firestore.rules` đã sửa xong
2. Đẩy lại toàn bộ file lên GitHub (commit & push) — nếu dùng GitHub Pages,
   Pages sẽ tự deploy trong 1–2 phút

## Kiểm tra

| Việc | Kết quả mong đợi |
|---|---|
| Mở app | Hiện màn hình **Đăng nhập / Đăng ký** bắt buộc |
| Đăng ký tài khoản thường | Vào app bình thường, dữ liệu tự đồng bộ |
| Mở `admin.html` bằng email Admin | Vào **Bảng điều khiển Admin** |
| Mở `admin.html` bằng email thường | Bị chặn "Không có quyền truy cập" |

---

## ❓ Câu hỏi thường gặp

**Người dùng tự đăng ký được không?**
Được. Mỗi người tự tạo tài khoản (Email + mật khẩu + họ tên) ngay tại màn hình
đăng nhập. Tài khoản mới "tự nhảy về" danh sách người dùng trong trang Admin.

**Làm sao thêm ai đó làm Admin?**
Thêm email của họ vào `SLEEPMATE_ADMIN_EMAILS` trong `firebase-config.js` **và**
`firestore.rules`, rồi deploy lại.

**Dữ liệu có bảo mật không?**
Có. `firestore.rules` đảm bảo: mỗi người chỉ xem/ghi dữ liệu của chính mình,
không ai tự phong mình thành Admin, và chỉ Admin mới xem được toàn bộ.

**APK Android có dùng được Firebase không?**
Có. APK đã nhúng sẵn thư viện Firebase (không cần tải từ gstatic), chỉ cần máy
có mạng (Wi‑Fi/4G) để đồng bộ dữ liệu, giống bản web.

**Chưa cấu hình Firebase thì sao?**
App vẫn mở được ở **Chế độ dùng thử** (dữ liệu chỉ lưu trên máy, không gửi cho
Admin). Đây là hành vi tạm để bạn kiểm tra giao diện.