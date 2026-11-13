import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build gọn cho Docker (node server.js)
  output: "standalone",
  // Ẩn nút "N" của Next.js ở góc màn hình khi chạy dev (vẫn hiện lỗi biên dịch nếu có)
  devIndicators: false,
};

export default nextConfig;
