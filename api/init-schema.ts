import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;

const schemaSql = `
-- =========================================================
-- SMART TRIP DA NANG - DATABASE SCHEMA (PostgreSQL)
-- =========================================================

-- ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF', 'USER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'LOCKED', 'PENDING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE contact_type AS ENUM ('HOTEL', 'RESTAURANT', 'TOUR', 'KHAC');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('ITINERARY_REMINDER', 'PROMOTION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. USER
CREATE TABLE IF NOT EXISTS "user" (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    avatar_url      VARCHAR(255),
    bio             TEXT,
    role            user_role   NOT NULL DEFAULT 'USER',
    status          user_status NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- 3. CATEGORY
CREATE TABLE IF NOT EXISTS category (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    icon_url    VARCHAR(255)
);

-- Seed dữ liệu mẫu cho 14 danh mục địa điểm Smart Trip Đà Nẵng
INSERT INTO category (id, name) VALUES
(1, 'Bãi biển Nghỉ dưỡng'),
(2, 'Bảo tàng & Nghệ thuật'),
(3, 'Check-in Kiến trúc & Danh thắng'),
(4, 'Cà phê, Tiệm trà'),
(5, 'Cắm trại & Trekking'),
(6, 'Di tích Lịch sử'),
(7, 'Khu Vui chơi & Nghỉ dưỡng'),
(8, 'Làng nghề Truyền thống'),
(9, 'Nhà hàng, Quán ăn nổi tiếng'),
(10, 'Phố cổ & Văn hóa Đô thị'),
(11, 'Sinh thái, Suối & Thác'),
(12, 'Tâm linh & Tôn giáo'),
(13, 'Đảo & Bãi đá Hoang sơ'),
(14, 'Ẩm thực địa phương, Chợ')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('category_id_seq', (SELECT MAX(id) FROM category));

-- 4. USER_PREFERENCE
CREATE TABLE IF NOT EXISTS user_preference (
    user_id     INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES category(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, category_id)
);

-- 5. DESTINATION
CREATE TABLE IF NOT EXISTS destination (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    district        VARCHAR(50)  NOT NULL,
    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    address_url     VARCHAR(255),
    category_id     INT REFERENCES category(id),
    ticket_price    VARCHAR(150) DEFAULT 'Miễn phí',
    open_hours      VARCHAR(100),
    avg_rating      DECIMAL(2,1) DEFAULT 0,
    status          content_status NOT NULL DEFAULT 'PENDING',
    created_by      INT REFERENCES "user"(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_destination_district ON destination(district);
CREATE INDEX IF NOT EXISTS idx_destination_category ON destination(category_id);
CREATE INDEX IF NOT EXISTS idx_destination_status ON destination(status);

-- Đảm bảo chuyển đổi ticket_price sang VARCHAR(150) nếu bảng đã tồn tại từ trước
ALTER TABLE destination ALTER COLUMN ticket_price TYPE VARCHAR(150) USING ticket_price::VARCHAR(150);
ALTER TABLE destination ALTER COLUMN ticket_price SET DEFAULT 'Miễn phí';

-- 6. CONTACT_INFO
CREATE TABLE IF NOT EXISTS contact_info (
    id              SERIAL PRIMARY KEY,
    destination_id  INT NOT NULL REFERENCES destination(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    type            contact_type NOT NULL DEFAULT 'KHAC',
    phone           VARCHAR(20),
    email           VARCHAR(150),
    facebook_url    VARCHAR(255),
    address         VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_contact_info_destination ON contact_info(destination_id);

-- 7. DESTINATION_IMAGE
CREATE TABLE IF NOT EXISTS destination_image (
    id              SERIAL PRIMARY KEY,
    destination_id  INT NOT NULL REFERENCES destination(id) ON DELETE CASCADE,
    image_url       VARCHAR(255) NOT NULL,
    uploaded_by     INT REFERENCES "user"(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_destination_image_destination ON destination_image(destination_id);

-- 8. ITINERARY
CREATE TABLE IF NOT EXISTS itinerary (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title       VARCHAR(150) NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    budget      DECIMAL(12,0) DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_itinerary_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_itinerary_user ON itinerary(user_id);

-- 9. ITINERARY_ITEM
CREATE TABLE IF NOT EXISTS itinerary_item (
    id              SERIAL PRIMARY KEY,
    itinerary_id    INT NOT NULL REFERENCES itinerary(id) ON DELETE CASCADE,
    destination_id  INT NOT NULL REFERENCES destination(id),
    day_index       INT NOT NULL,
    order_index     INT NOT NULL DEFAULT 0,
    budget          DECIMAL(12,0) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_itinerary_item_itinerary ON itinerary_item(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_item_destination ON itinerary_item(destination_id);

-- 10. CHECKLIST_ITEM
CREATE TABLE IF NOT EXISTS checklist_item (
    id                  SERIAL PRIMARY KEY,
    itinerary_item_id   INT NOT NULL REFERENCES itinerary_item(id) ON DELETE CASCADE,
    item_name           VARCHAR(100) NOT NULL,
    is_checked          BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_checklist_item_itinerary_item ON checklist_item(itinerary_item_id);

-- 11. REVIEW
CREATE TABLE IF NOT EXISTS review (
    id              SERIAL PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    destination_id  INT NOT NULL REFERENCES destination(id) ON DELETE CASCADE,
    rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    status          content_status NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_review_user_destination UNIQUE (user_id, destination_id)
);

CREATE INDEX IF NOT EXISTS idx_review_destination ON review(destination_id);
CREATE INDEX IF NOT EXISTS idx_review_status ON review(status);

CREATE OR REPLACE FUNCTION set_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_updated_at ON review;
CREATE TRIGGER trg_review_updated_at
BEFORE UPDATE ON review
FOR EACH ROW
EXECUTE FUNCTION set_review_updated_at();

-- 12. REVIEW_IMAGE
CREATE TABLE IF NOT EXISTS review_image (
    id          SERIAL PRIMARY KEY,
    review_id   INT NOT NULL REFERENCES review(id) ON DELETE CASCADE,
    image_url   VARCHAR(255) NOT NULL,
    uploaded_by INT REFERENCES "user"(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_image_review ON review_image(review_id);

-- 13. FAVORITE
CREATE TABLE IF NOT EXISTS favorite (
    user_id         INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    destination_id  INT NOT NULL REFERENCES destination(id) ON DELETE CASCADE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, destination_id)
);

-- 14. NOTIFICATION
CREATE TABLE IF NOT EXISTS notification (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    title       VARCHAR(150),
    content     TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_user ON notification(user_id);
`;

async function initSchema() {
  if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
    console.error('❌ LỖI: DATABASE_URL trong api/.env chưa được cấu hình đúng!');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔄 Đang khởi tạo Schema Database trên Supabase...');
    await client.connect();
    await client.query(schemaSql);
    console.log('🎉 TẠO SCHEMA DỮ LIỆU SMART TRIP DA NANG THÀNH CÔNG!');
  } catch (err: any) {
    console.error('❌ TẠO SCHEMA THẤT BẠI:', err.message);
  } finally {
    await client.end();
  }
}

initSchema();
