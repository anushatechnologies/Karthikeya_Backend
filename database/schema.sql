-- ============================================================
--  TradeHub B2B Marketplace — MySQL Schema
--  Run: mysql -u root -p < database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS tradehub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tradehub_db;

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           VARCHAR(36)  NOT NULL PRIMARY KEY,
  full_name    VARCHAR(120) NOT NULL,
  email        VARCHAR(120) UNIQUE,
  phone        VARCHAR(15)  UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('buyer','seller','admin') NOT NULL DEFAULT 'buyer',
  company_name VARCHAR(120),
  gst_number   VARCHAR(20),
  business_type VARCHAR(60),
  address      TEXT,
  avatar       TEXT,
  is_verified  TINYINT(1)   NOT NULL DEFAULT 0,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  icon          VARCHAR(80),
  slug          VARCHAR(100) UNIQUE NOT NULL,
  product_count INT          NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              VARCHAR(36)   NOT NULL PRIMARY KEY,
  name            VARCHAR(200)  NOT NULL,
  description     TEXT,
  images          JSON,
  category_id     VARCHAR(36)   NOT NULL,
  seller_id       VARCHAR(36)   NOT NULL,
  price           DECIMAL(14,2) NOT NULL DEFAULT 0,
  price_type      ENUM('fixed','negotiable','rfq') NOT NULL DEFAULT 'fixed',
  currency        VARCHAR(5)    NOT NULL DEFAULT 'INR',
  min_order_qty   INT           NOT NULL DEFAULT 1,
  unit            VARCHAR(30)   NOT NULL DEFAULT 'Piece',
  specifications  JSON,
  tags            JSON,
  location        VARCHAR(120),
  rating          DECIMAL(3,2)  NOT NULL DEFAULT 0,
  review_count    INT           NOT NULL DEFAULT 0,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (seller_id)   REFERENCES users(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- PRODUCT BULK PRICING TIERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_pricing_tiers (
  id         VARCHAR(36)   NOT NULL PRIMARY KEY,
  product_id VARCHAR(36)   NOT NULL,
  min_qty    INT           NOT NULL,
  max_qty    INT,
  price      DECIMAL(14,2) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- INQUIRIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id         VARCHAR(36) NOT NULL PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  buyer_id   VARCHAR(36) NOT NULL,
  seller_id  VARCHAR(36) NOT NULL,
  quantity   INT         NOT NULL,
  message    TEXT,
  status     ENUM('pending','responded','closed') NOT NULL DEFAULT 'pending',
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (buyer_id)   REFERENCES users(id),
  FOREIGN KEY (seller_id)  REFERENCES users(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- RFQ (Request For Quote)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rfqs (
  id             VARCHAR(36)  NOT NULL PRIMARY KEY,
  buyer_id       VARCHAR(36)  NOT NULL,
  title          VARCHAR(200) NOT NULL,
  category       VARCHAR(100),
  quantity       VARCHAR(60),
  target_price   VARCHAR(60),
  specifications TEXT,
  status         ENUM('open','closed') NOT NULL DEFAULT 'open',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- RFQ QUOTES (Supplier bids)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rfq_quotes (
  id             VARCHAR(36)   NOT NULL PRIMARY KEY,
  rfq_id         VARCHAR(36)   NOT NULL,
  seller_id      VARCHAR(36)   NOT NULL,
  price_per_unit DECIMAL(14,2) NOT NULL,
  total_price    DECIMAL(14,2) NOT NULL,
  delivery_days  INT,
  payment_terms  VARCHAR(200),
  warranty       VARCHAR(200),
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rfq_id)    REFERENCES rfqs(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               VARCHAR(36)   NOT NULL PRIMARY KEY,
  buyer_id         VARCHAR(36)   NOT NULL,
  shipping_address TEXT          NOT NULL,
  payment_method   ENUM('bank','lc','card') NOT NULL DEFAULT 'bank',
  subtotal         DECIMAL(14,2) NOT NULL DEFAULT 0,
  tax              DECIMAL(14,2) NOT NULL DEFAULT 0,
  shipping_cost    DECIMAL(14,2) NOT NULL DEFAULT 0,
  grand_total      DECIMAL(14,2) NOT NULL DEFAULT 0,
  status           ENUM('placed','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'placed',
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id         VARCHAR(36)   NOT NULL PRIMARY KEY,
  order_id   VARCHAR(36)   NOT NULL,
  product_id VARCHAR(36)   NOT NULL,
  seller_id  VARCHAR(36)   NOT NULL,
  quantity   INT           NOT NULL,
  unit_price DECIMAL(14,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (seller_id)  REFERENCES users(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- CHAT THREADS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_threads (
  id             VARCHAR(36) NOT NULL PRIMARY KEY,
  participant_a  VARCHAR(36) NOT NULL,
  participant_b  VARCHAR(36) NOT NULL,
  last_message   TEXT,
  last_message_at DATETIME,
  created_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_thread (participant_a, participant_b),
  FOREIGN KEY (participant_a) REFERENCES users(id),
  FOREIGN KEY (participant_b) REFERENCES users(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- CHAT MESSAGES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id          VARCHAR(36) NOT NULL PRIMARY KEY,
  thread_id   VARCHAR(36) NOT NULL,
  sender_id   VARCHAR(36) NOT NULL,
  receiver_id VARCHAR(36) NOT NULL,
  content     TEXT        NOT NULL,
  is_read     TINYINT(1)  NOT NULL DEFAULT 0,
  created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id)   REFERENCES chat_threads(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id)   REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- KYC APPLICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kyc_applications (
  id          VARCHAR(36) NOT NULL PRIMARY KEY,
  seller_id   VARCHAR(36) NOT NULL UNIQUE,
  kyc_doc_url TEXT        NOT NULL,
  status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reason      TEXT,
  reviewed_by VARCHAR(36),
  reviewed_at DATETIME,
  created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id)   REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- SEED: Default Categories
-- ─────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, icon, slug, product_count) VALUES
  (UUID(), 'Electronics',     'hardware-chip-outline',   'electronics',     0),
  (UUID(), 'Textiles',        'shirt-outline',           'textiles',        0),
  (UUID(), 'Machinery',       'construct-outline',       'machinery',       0),
  (UUID(), 'Agriculture',     'leaf-outline',            'agriculture',     0),
  (UUID(), 'Chemicals',       'flask-outline',           'chemicals',       0),
  (UUID(), 'Packaging',       'cube-outline',            'packaging',       0),
  (UUID(), 'Construction',    'business-outline',        'construction',    0),
  (UUID(), 'Food & Beverages','restaurant-outline',      'food-beverages',  0);
