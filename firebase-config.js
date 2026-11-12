/* ============================================================
   SLEEPMATE Pro — CẤU HÌNH FIREBASE (DÙNG CHUNG)
   ------------------------------------------------------------
   Bạn chỉ cần sửa ĐÚNG 1 CHỖ DUY NHẤT này, cả app người dùng
   (index.html) và trang quản trị (admin.html) đều đọc từ đây.

   CÁCH LẤY CONFIG:
   1. Vào https://console.firebase.google.com → Tạo project
      (tên ví dụ: sleepmate-pro).
   2. Menu bên trái: Build → Authentication → Get started →
      chọn "Email/Password" → Enable (bật).
   3. Build → Firestore Database → Create database →
      chọn vùng gần VN (ví dụ asia-southeast1) → Production mode.
   4. Click biểu tượng bánh răng (Project settings) →
      mục "Your apps" → chọn icon </> (Web) → đăng ký app.
   5. Firebase đưa cho bạn một khối `firebaseConfig = {...}`.
      SAO CHÉP TỪNG GIÁ TRỊ vào bên dưới (thay chỗ "DAN_VAO_DAY").

   6. Dán email admin của bạn vào ADMIN_EMAILS.
      Đây là tài khoản được phép vào trang quản trị.

   Sau khi sửa xong file này, đẩy lại toàn bộ lên GitHub Pages.
   ============================================================ */

window.SLEEPMATE_FB_CONFIG = {
  apiKey: "AIzaSyDPSx_R0M0vPkHjUxUkMU3GvJIDeZNjY84",
  authDomain: "sleepmate-pro.firebaseapp.com",
  projectId: "sleepmate-pro",
  storageBucket: "sleepmate-pro.firebasestorage.app",
  messagingSenderId: "274398455799",
  appId: "1:274398455799:web:81e5d45fd111c412e1b0f2",
  measurementId: "G-ZZNKZE81PL"
};

/* Email này sẽ là ADMIN — ví dụ: ["thayco@truong.edu.vn"] */
window.SLEEPMATE_ADMIN_EMAILS = ["klocevin@gmail.com"];

/* Tên hiển thị của hệ thống (tuỳ chọn) */
window.SLEEPMATE_SYSTEM_NAME = "SLEEPMATE Pro";