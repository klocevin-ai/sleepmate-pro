# 🔥 SLEEPMATE Pro — Trạng thái Firebase (ĐÃ HOÀN TẤT)

> **Cập nhật:** v3.2.1 — Firebase đã được cấu hình xong và **đang chạy thật** trên
> https://klocevin-ai.github.io/sleepmate-pro/
>
> Tài liệu này giờ là **bản ghi cấu hình hiện tại + cách bảo trì**, không cần làm lại từ đầu.

---

## 1. Cấu hình đang dùng

| Hạng mục | Giá trị |
|---|---|
| Firebase project | `sleepmate-pro` |
| Project number | `274398455799` |
| Auth | Email/Password — **đã bật** |
| Firestore | Native mode, database `(default)`, location `nam5 (United States)` |
| Web app | `SLEEPMATE Pro Web` → appId `1:274398455799:web:81e5d45fd111c412e1b0f2` |
| Admin | **klocevin@gmail.com** |
| Authorized domains | `localhost`, `sleepmate-pro.firebaseapp.com`, `sleepmate-pro.web.app`, `klocevin-ai.github.io` |

Cấu hình nằm trong 1 file duy nhất: [`firebase-config.js`](./firebase-config.js) —
cả app (`index.html`) và trang quản trị (`admin.html`) đều đọc từ đây.

```js
window.SLEEPMATE_FB_CONFIG = {
  apiKey: "AIzaSyDPSx_R0M0vPkHjUxUkMU3GvJIDeZNjY84",
  authDomain: "sleepmate-pro.firebaseapp.com",
  projectId: "sleepmate-pro",
  storageBucket: "sleepmate-pro.firebasestorage.app",
  messagingSenderId: "274398455799",
  appId: "1:274398455799:web:81e5d45fd111c412e1b0f2",
  measurementId: "G-ZZNKZE81PL"
};
window.SLEEPMATE_ADMIN_EMAILS = ["klocevin@gmail.com"];
```

> `apiKey` của Firebase Web **không phải bí mật** (nó chỉ định danh project).
> Quyền truy cập thật do **Firestore Security Rules** quyết định.

---

## 2. Cách dùng (người dùng & admin)

### Người dùng
1. Mở https://klocevin-ai.github.io/sleepmate-pro/ (hoặc app APK)
2. Màn hình chặn bắt buộc đăng nhập → bấm **Đăng ký** → nhập Họ tên, Email, Mật khẩu
3. Dùng app bình thường. Dữ liệu tự đẩy lên cloud **mỗi 45 giây** và khi sang ngày mới
4. Tin nhắn Admin hiện ở **chip tài khoản → Tin nhắn từ Admin** (có badge đỏ)

### Admin (bạn)
1. Vào https://klocevin-ai.github.io/sleepmate-pro/admin.html
2. Đăng nhập bằng **klocevin@gmail.com** + mật khẩu bạn đã đặt khi đăng ký trên app
3. Xem: tổng người dùng, hoạt động 24h, **tỷ lệ hoàn hảo TB**, mức tham gia hôm nay
4. Bảng xếp hạng: sắp theo tỷ lệ hoàn hảo / điểm kỷ luật / hoạt động gần nhất
5. Bấm 1 dòng → xem 14 đêm gần nhất, lịch sử khoá máy, **gửi nhắc nhở riêng**
6. **Gửi nhắc nhở cho tất cả** → gửi vào hộp thư mọi thành viên
7. **Luật chung cho cả nhóm** → đặt giờ giới nghiêm, hạn mức phút, khoá cứng ban đêm
   → mọi thành viên nhận trong vài giây (realtime)

**Định nghĩa chỉ số:**
- **Hoàn hảo** = đêm đó vừa trong hạn mức phút vừa đúng giờ giới nghiêm
- **Tham gia** = số ngày có dữ liệu trong 7 ngày gần nhất
- **Tỷ lệ hoàn hảo** = % đêm hoàn hảo trong 7 ngày

---

## 3. Bảo mật (Firestore Rules v3.2.1)

File: [`firestore.rules`](./firestore.rules) — **đã publish** lên Firebase.

| Đối tượng | Quyền |
|---|---|
| Thành viên | Chỉ đọc/ghi dữ liệu **của chính mình** (`users/{uid}` + subcollections) |
| Thành viên | **KHÔNG** xem được người khác, **KHÔNG** tự nâng thành admin |
| Admin (email trong danh sách) | Đọc mọi user, ghi `config/groupRules`, gửi `inbox`, xoá dữ liệu |
| Bất kỳ ai đã đăng nhập | Đọc `config/groupRules` (để nhận luật nhóm) |

Đã kiểm thử thực tế trên project thật:
- Thành viên liệt kê toàn bộ users → `permission-denied` ✅
- Thành viên đọc hồ sơ người khác → `permission-denied` ✅
- Thành viên tự đổi `role` thành `admin` → `permission-denied` ✅
- Thành viên sửa `config/groupRules` → `permission-denied` ✅
- Thành viên ghi dữ liệu của mình → OK ✅
- Admin ghi rules/gửi inbox/xoá dữ liệu → OK ✅

> ⚠️ **Quy tắc bất di bất dịch:** nếu đổi email admin, phải sửa **đồng thời 2 chỗ**:
> `firebase-config.js` (`SLEEPMATE_ADMIN_EMAILS`) **và** `firestore.rules` (`in: ['...']`),
> rồi Publish rules. Sửa 1 chỗ sẽ khiến admin bị khoá hoặc rules chặn nhầm.

---

## 4. Cấu trúc dữ liệu

```
users/{uid}
  ├─ uid, email, name, role ('member' | 'admin'), createdAt, lastSeenAt
  ├─ days/{sleepDay}      activeSec, lateSec, idleSec, opens, leaves,
  │                       lockouts, limitOk, curfewOk, perfect, discipline,
  │                       hourly, curfew, screenLimitMin, sleepDay
  ├─ locks/{autoId}       at, reason, label, source
  └─ inbox/{autoId}       at, text, read            (Admin ghi, user đọc)

config/groupRules
  ├─ enabled, curfew ('HH:MM'), screenLimitMin (15–240), note
  ├─ week { enabled, days: { "0":[block…] … "6":[block…] } }
  └─ updatedAt, updatedBy
```

> ⚠️ **`week.days` là MAP, không phải mảng lồng mảng.** Firestore cấm nested array;
> code đã chuyển sang dạng `{"0": [...], "1": [...], …}`. `normalizeWeek()` trong app
> đọc được **cả hai** dạng để tương thích dữ liệu cũ.

---

## 5. Bảo trì thường gặp

### Đổi mật khẩu admin
Trên app → chip tài khoản → Đăng xuất → **Đăng nhập** → (nếu quên) dùng
"Quên mật khẩu" của Firebase hoặc reset trong Console → Authentication → Users.

### Thêm người làm admin thứ 2
1. `firebase-config.js`: `window.SLEEPMATE_ADMIN_EMAILS = ["klocevin@gmail.com", "email2@..."];`
2. `firestore.rules`: `... in ['klocevin@gmail.com', 'email2@...']`
3. Publish rules (Console → Firestore → Rules → Publish)
4. Deploy lại: chạy `node sync-all.js "<thư mục dự án>"` → `node rebuild-packages.js ...`
5. Người đó đăng ký tài khoản trên app **trước**, rồi mới vào được `admin.html`

### Xoá một thành viên
Firebase Console → Firestore → `users` → chọn doc → xoá (kèm subcollections
`days`, `locks`, `inbox`). Rules cho phép admin xoá cả 3 subcollection.

### Xem dữ liệu trực tiếp
Console → Firestore Database → Data → `users` / `config`.

### Kiểm tra chi phí
Gói **Spark (miễn phí)**: 50k reads + 20k writes + 20k deletes / ngày,
1 GiB lưu trữ. Với quy mô 1 lớp (~40 người, sync 45s) vẫn nằm trong hạn mức.

---

## 6. Nếu cần làm lại từ đầu (project khác)

1. Console → tạo project mới → bật **Authentication → Email/Password**
2. **Firestore Database → Create database** → Standard edition → Production mode
3. **Project settings → Your apps → `</>` (Web)** → lấy `firebaseConfig`
4. Dán vào `firebase-config.js`, đặt `SLEEPMATE_ADMIN_EMAILS`
5. Dán `firestore.rules` vào Console → Rules → **Publish**
6. **Authentication → Settings → Authorized domains** → thêm `klocevin-ai.github.io`
7. Deploy: `node sync-all.js "<root>"` → `node rebuild-packages.js "<root>"` →
   `node push-with-cred.js klocevin-ai/sleepmate-pro "<gh-stage>" "<message>"`

---

## 7. Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| `auth/operation-not-allowed` | Chưa bật Email/Password | Authentication → Sign-in method |
| `auth/unauthorized-domain` | Domain chưa authorize | Authentication → Settings → Authorized domains |
| `permission-denied` khi đọc list users | Đăng nhập bằng tài khoản không phải admin | Đúng email trong `SLEEPMATE_ADMIN_EMAILS` |
| Nút "Lưu & áp dụng" báo lỗi | (Đã sửa ở v3.2.1) nested array | Cập nhật bản mới |
| Admin vào `admin.html` bị "Không có quyền" | Email chưa khớp danh sách | Sửa cả 2 file như mục 5 |
