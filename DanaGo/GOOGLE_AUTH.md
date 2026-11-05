# Đăng nhập Google trên Android qua NestJS

App xác thực tài khoản bằng Google Sign-In native rồi gọi trực tiếp API cổng 5000.
Không cần chạy Next.js để đăng nhập trên app. Luồng web giữ nguyên.

## Luồng

1. App nhận Google ID token bằng `google_sign_in`.
2. App gửi `POST /identity/auth/google/mobile` tới NestJS:
   `{ "idToken": "<Google ID token>" }`.
3. NestJS dùng Supabase `signInWithIdToken` xác minh token Google.
4. NestJS dùng chung xử lý tài khoản với web: kiểm tra Google identity, email xác nhận,
   tìm/tạo user theo `supabase_id`, kiểm tra trạng thái, rồi cấp JWT DanaGo.
5. App lưu JWT vào secure storage với khóa `accessToken` và chuyển màn hình.

App không dùng Supabase SDK hoặc URL/key Supabase.
Token Supabase được xử lý trong NestJS và không trả về app.

## Cấu hình Google

- Giữ Web OAuth Client ID đang dùng cho Supabase Google Provider.
- Truyền Web Client ID vào `GOOGLE_WEB_CLIENT_ID` trong [cấu hình app](config/auth.example.json).
- Tạo OAuth client loại Android trong cùng Google Cloud project:
  package `com.example.smarttrip` và SHA-1 của chứng chỉ ký bản debug/release tương ứng.
- Không thay Web Client ID trong app bằng Android Client ID.
- Google Provider trong Supabase phải chấp nhận Web Client ID trên.
- Nếu ứng dụng Google đang Testing, thêm Gmail thử nghiệm vào Audience → Test users.

## Cấu hình app và điện thoại thật

```json
{
  "GOOGLE_WEB_CLIENT_ID": "<web-client-id>.apps.googleusercontent.com",
  "API_URL": "http://127.0.0.1:5000"
}
```

App tự đọc file JSON dưới dạng Flutter asset trước khi mở giao diện.
Chỉ cần `flutter run`, không bắt buộc `--dart-define-from-file`.
Nếu có Dart defines, các giá trị đó được ưu tiên hơn JSON.
Sau khi sửa JSON, dừng và chạy lại app để nạp cấu hình mới.
File asset được đóng gói trong app: chỉ lưu client ID và địa chỉ API, không lưu secret.

- USB: tự chạy `adb reverse tcp:5000 tcp:5000` trước khi test.
- Wi-Fi: đổi API_URL thành `http://<IP-LAN-may-tinh>:5000`, cùng mạng với điện thoại;
  backend và firewall cần cho phép kết nối.
- Chỉ cần khởi động NestJS cho app, không cần Next.js.
- Debug cho phép HTTP để phát triển; production dùng HTTPS.

Backend tiếp tục dùng `SUPABASE_URL`, publishable/anon key hoặc cấu hình key server hiện có,
`DATABASE_URL`, và `JWT_SECRET`. Không đưa secret hoặc service role key vào app.
Database cần có cột `supabase_id` theo schema đã bổ sung cho web.

## Kiểm tra

Tự cập nhật dependencies bằng `flutter pub get` nếu chưa thực hiện sau khi đổi sang
`google_sign_in`. Kiểm tra đăng nhập mới, đăng nhập tài khoản đã dùng trên web,
hủy Google, email trùng tài khoản mật khẩu, tài khoản bị khóa, API mất kết nối và đăng xuất.
Lỗi API có `message`; đăng nhập thành công trả `accessToken` và `user`.

Thông tin hồ sơ mẫu và luồng đăng nhập bằng mật khẩu chưa được nối API trong thay đổi này.
Không chạy lệnh cài đặt, build, test hay khởi động app trong lần thay đổi này theo yêu cầu.
