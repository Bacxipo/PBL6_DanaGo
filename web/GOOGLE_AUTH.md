# Đăng nhập Google trên web

## App Flutter gọi trực tiếp NestJS

App gọi `POST /identity/auth/google/mobile` trên NestJS cổng 5000
với JSON `{ "idToken": "<Google ID token>" }`.
NestJS xác minh qua Supabase rồi cấp JWT DanaGo. App không cần Next.js hay cấu hình Supabase.
Chi tiết Google Client ID và Android SHA-1 ở [hướng dẫn app](../DanaGo/GOOGLE_AUTH.md).
Luồng web `/api/auth/google/start` và `/api/auth/google/exchange` được giữ nguyên.

## Cấu hình

### Docker

Compose nạp biến Supabase từ `web/.env.local` vào container web.
`API_URL=http://api:5000` dùng mạng nội bộ Docker; không dùng localhost để gọi container API khác.
`WEB_ORIGIN=http://localhost:3000` là địa chỉ trình duyệt truy cập, dùng để kiểm tra Origin,
tạo callback và xác định cookie HTTPS. Khi triển khai domain/HTTPS, đổi WEB_ORIGIN cho đúng.
Không tắt kiểm tra Origin để khắc phục lỗi Docker.

Trong `.env.local` của web:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

Có thể dùng `SUPABASE_ANON_KEY` thay cho publishable key.
Các biến Supabase chỉ được API Next.js đọc, không dùng tiền tố `NEXT_PUBLIC_`.
Trình duyệt chỉ gọi API Next.js; không khởi tạo Supabase client hoặc đọc public key.
API trả URL chuyển hướng OAuth nên địa chỉ Supabase vẫn xuất hiện khi chuyển hướng đăng nhập.
Không dùng service role key cho luồng OAuth này.
Có thể đặt `API_URL` ở server web để chỉ định địa chỉ backend NestJS;
nếu không có, API dùng `NEXT_PUBLIC_API_URL` hoặc `http://localhost:5000`.

Backend cần `SUPABASE_URL` và `SUPABASE_PUBLISHABLE_KEY` hoặc `SUPABASE_ANON_KEY`.
Cấu hình storage hiện tại với `SUPABASE_SERVICE_KEY` cũng được hỗ trợ ở backend.
Web và API phải dùng cùng Supabase project.

1. Trong Google Cloud, tạo OAuth client loại Web application. Thêm origin `http://localhost:3000` và origin production.
2. Trong Supabase → Authentication → Sign In / Providers → Google, bật Google và nhập Client ID / Client Secret. Copy callback URL hiển thị ở đây vào Authorized redirect URIs của Google Cloud (dạng `https://<project-ref>.supabase.co/auth/v1/callback`).
3. Trong Supabase → Authentication → URL Configuration, thêm `http://localhost:3000/auth/callback` và callback production vào Redirect URLs. Đặt Site URL đúng với website.
4. Nếu Google app còn Testing, thêm tài khoản thử nghiệm trong Google Auth Platform → Audience.
5. Chạy [SQL bổ sung cột liên kết](../api/prisma/google-auth.sql) trên database DanaGo hiện tại. Đây là SQL bổ sung cho database đã tồn tại, không phải migration khởi tạo.
6. Trong thư mục API, chạy `npx prisma generate`, sau đó khởi động API và web.

## Luồng và kiểm tra

Nút Google gọi `POST /api/auth/google/start`. API Next.js tạo URL Google qua Supabase PKCE
và lưu verifier vào cookie HttpOnly, SameSite=Lax, thời hạn 10 phút.
Trình duyệt chuyển hướng đến URL nhận được. Khi trở về `/auth/callback`, trang gọi
`POST /api/auth/google/exchange` với code. API Next.js đổi code lấy phiên Supabase,
gửi access token tới `POST /identity/auth/google` của NestJS.
API xác minh token bằng Supabase `getUser`, yêu cầu email đã xác nhận và Google identity,
tìm tài khoản theo Supabase UUID, rồi cấp JWT DanaGo. API Next.js chỉ trả JWT DanaGo
cho trình duyệt và xóa cookie OAuth tạm thời. Token Supabase không được trả trong JSON.
Hai API Next.js yêu cầu Origin cùng website để ngăn yêu cầu chéo nguồn.

Tài khoản mới luôn có quyền USER. Mật khẩu ngẫu nhiên không được tiết lộ.
Email đã có tài khoản DanaGo chưa liên kết sẽ bị từ chối; dùng đăng nhập mật khẩu.
Tài khoản không ACTIVE bị từ chối. Chưa có giao diện liên kết tài khoản.

Kiểm tra thủ công: đăng nhập lần đầu, đăng nhập lại không tạo thêm user, hủy Google,
email trùng, tài khoản LOCKED/PENDING, token giả, và đăng xuất DanaGo rồi đăng nhập lại.
Để kiểm tra tài khoản bị khóa, dùng tài khoản thử nghiệm riêng.

Tham khảo: [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).
