-- =========================================================
-- SMART TRIP DA NANG - DATABASE SCHEMA (PostgreSQL)
-- =========================================================

-- =========================================================
-- 1. ENUM TYPES
-- =========================================================
CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF', 'USER');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'LOCKED', 'PENDING');
CREATE TYPE content_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE contact_type AS ENUM ('HOTEL', 'RESTAURANT', 'TOUR', 'KHAC');
CREATE TYPE notification_type AS ENUM ('ITINERARY_REMINDER', 'PROMOTION');

-- =========================================================
-- 2. USER
-- =========================================================
CREATE TABLE "user" (
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

-- =========================================================
-- 3. CATEGORY
-- =========================================================
CREATE TABLE category (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    icon_url    VARCHAR(255)
);

-- =========================================================
-- 4. USER_PREFERENCE (User N-N Category)
-- =========================================================
CREATE TABLE user_preference (
    user_id     INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES category(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, category_id)
);

-- =========================================================
-- 5. DESTINATION
-- =========================================================
CREATE TABLE destination (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    district        VARCHAR(50)  NOT NULL,
    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    address_url     VARCHAR(255),          -- link Google Maps
    category_id     INT REFERENCES category(id),
    ticket_price    DECIMAL(10,0) DEFAULT 0,
    open_hours      VARCHAR(100),
    avg_rating      DECIMAL(2,1) DEFAULT 0,
    status          content_status NOT NULL DEFAULT 'PENDING',
    created_by      INT REFERENCES "user"(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_destination_district ON destination(district);
CREATE INDEX idx_destination_category ON destination(category_id);
CREATE INDEX idx_destination_status ON destination(status);

-- =========================================================
-- 6. CONTACT_INFO (thông tin liên hệ đối tác gắn với điểm đến)
-- =========================================================
CREATE TABLE contact_info (
    id              SERIAL PRIMARY KEY,
    destination_id  INT NOT NULL REFERENCES destination(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    type            contact_type NOT NULL DEFAULT 'KHAC',
    phone           VARCHAR(20),
    email           VARCHAR(150),
    facebook_url    VARCHAR(255),
    address         VARCHAR(255)
);

CREATE INDEX idx_contact_info_destination ON contact_info(destination_id);

-- =========================================================
-- 7. DESTINATION_IMAGE
-- =========================================================
CREATE TABLE destination_image (
    id              SERIAL PRIMARY KEY,
    destination_id  INT NOT NULL REFERENCES destination(id) ON DELETE CASCADE,
    image_url       VARCHAR(255) NOT NULL,
    uploaded_by     INT REFERENCES "user"(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_destination_image_destination ON destination_image(destination_id);

-- =========================================================
-- 8. ITINERARY
-- =========================================================
CREATE TABLE itinerary (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title       VARCHAR(150) NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    budget      DECIMAL(12,0) DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_itinerary_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_itinerary_user ON itinerary(user_id);

-- =========================================================
-- 9. ITINERARY_ITEM
-- =========================================================
CREATE TABLE itinerary_item (
    id              SERIAL PRIMARY KEY,
    itinerary_id    INT NOT NULL REFERENCES itinerary(id) ON DELETE CASCADE,
    destination_id  INT NOT NULL REFERENCES destination(id),
    day_index       INT NOT NULL,   -- ngày thứ mấy trong chuyến đi
    order_index     INT NOT NULL DEFAULT 0  -- thứ tự trong ngày
);

CREATE INDEX idx_itinerary_item_itinerary ON itinerary_item(itinerary_id);
CREATE INDEX idx_itinerary_item_destination ON itinerary_item(destination_id);

-- =========================================================
-- 10. CHECKLIST_ITEM (vật dụng cần mang, theo từng điểm đến trong ngày)
-- =========================================================
CREATE TABLE checklist_item (
    id                  SERIAL PRIMARY KEY,
    itinerary_item_id   INT NOT NULL REFERENCES itinerary_item(id) ON DELETE CASCADE,
    item_name           VARCHAR(100) NOT NULL,
    is_checked          BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_checklist_item_itinerary_item ON checklist_item(itinerary_item_id);

-- =========================================================
-- 11. REVIEW (1 user chỉ review 1 lần/điểm đến, nhưng được sửa)
-- =========================================================
CREATE TABLE review (
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

CREATE INDEX idx_review_destination ON review(destination_id);
CREATE INDEX idx_review_status ON review(status);

-- Tự động cập nhật updated_at mỗi khi review được sửa
CREATE OR REPLACE FUNCTION set_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_updated_at
BEFORE UPDATE ON review
FOR EACH ROW
EXECUTE FUNCTION set_review_updated_at();

-- =========================================================
-- 12. REVIEW_IMAGE
-- =========================================================
CREATE TABLE review_image (
    id          SERIAL PRIMARY KEY,
    review_id   INT NOT NULL REFERENCES review(id) ON DELETE CASCADE,
    image_url   VARCHAR(255) NOT NULL,
    uploaded_by INT REFERENCES "user"(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_image_review ON review_image(review_id);

-- =========================================================
-- 13. FAVORITE (User N-N Destination)
-- =========================================================
CREATE TABLE favorite (
    user_id         INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    destination_id  INT NOT NULL REFERENCES destination(id) ON DELETE CASCADE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, destination_id)
);

-- =========================================================
-- 14. NOTIFICATION
-- =========================================================
CREATE TABLE notification (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    title       VARCHAR(150),
    content     TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_user ON notification(user_id);

-- =========================================================
-- HẾT SCHEMA
-- =========================================================
