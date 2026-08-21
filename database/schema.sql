-- ============================================================
--  KFPL B2B Marketplace — Complete MySQL Schema
--  Run: mysql -u root -p < database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS tradehub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tradehub_db;

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                 VARCHAR(36)  NOT NULL PRIMARY KEY,
  full_name          VARCHAR(120) NOT NULL,
  email              VARCHAR(120) UNIQUE,
  phone              VARCHAR(15)  UNIQUE,
  password           VARCHAR(255) NOT NULL,
  role               ENUM('super_admin','platform_admin','support_admin','finance_admin','moderator','operations_admin','marketing_admin','readonly_admin','buyer','seller','admin') NOT NULL DEFAULT 'buyer',
  permissions        JSON,
  company_name       VARCHAR(120),
  store_name         VARCHAR(120),
  gst_number         VARCHAR(20),
  pan_number         VARCHAR(20),
  business_type      VARCHAR(60),
  address            TEXT,
  avatar             TEXT,
  is_verified        TINYINT(1)   NOT NULL DEFAULT 0,
  is_active          TINYINT(1)   NOT NULL DEFAULT 1,
  kyc_status         ENUM('not_submitted','pending','approved','rejected','expired') NOT NULL DEFAULT 'not_submitted',
  risk_score         INT          NOT NULL DEFAULT 0,
  total_orders       INT          NOT NULL DEFAULT 0,
  total_spent        DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_products     INT          NOT NULL DEFAULT 0,
  total_revenue      DECIMAL(14,2) NOT NULL DEFAULT 0,
  rating             DECIMAL(3,2) NOT NULL DEFAULT 0,
  subscription       ENUM('free','basic','premium','enterprise') NOT NULL DEFAULT 'free',
  free_leads_used    INT          NOT NULL DEFAULT 0,
  paid_leads_balance INT          NOT NULL DEFAULT 0,
  wallet_balance     DECIMAL(14,2) NOT NULL DEFAULT 0,
  bank_name          VARCHAR(100),
  account_number     VARCHAR(50),
  ifsc_code          VARCHAR(20),
  account_holder_name VARCHAR(120),
  bank_is_verified   TINYINT(1)   NOT NULL DEFAULT 0,
  documents          JSON,
  last_login         DATETIME,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- ADDRESSES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id         VARCHAR(36)  NOT NULL PRIMARY KEY,
  user_id    VARCHAR(36)  NOT NULL,
  label      VARCHAR(60)  NOT NULL,
  line1      VARCHAR(255) NOT NULL,
  line2      VARCHAR(255),
  city       VARCHAR(100) NOT NULL,
  state      VARCHAR(100) NOT NULL,
  pincode    VARCHAR(20)  NOT NULL,
  country    VARCHAR(60)  NOT NULL DEFAULT 'India',
  is_default TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- BRANDS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  slug          VARCHAR(120) UNIQUE NOT NULL,
  logo          TEXT,
  description   TEXT,
  status        ENUM('active','inactive','pending') NOT NULL DEFAULT 'active',
  product_count INT          NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  parent_id     VARCHAR(36),
  icon          VARCHAR(80),
  image         TEXT,
  description   TEXT,
  sort_order    INT          NOT NULL DEFAULT 0,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  product_count INT          NOT NULL DEFAULT 0,
  attributes    JSON,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                VARCHAR(36)   NOT NULL PRIMARY KEY,
  name              VARCHAR(200)  NOT NULL,
  slug              VARCHAR(200),
  description       TEXT,
  short_description TEXT,
  sku               VARCHAR(80)   UNIQUE,
  category_id       VARCHAR(36)   NOT NULL,
  brand_id          VARCHAR(36),
  brand_name        VARCHAR(120),
  seller_id         VARCHAR(36)   NOT NULL,
  price             DECIMAL(14,2) NOT NULL DEFAULT 0,
  price_type        ENUM('fixed','negotiable','rfq') NOT NULL DEFAULT 'fixed',
  currency          VARCHAR(5)    NOT NULL DEFAULT 'INR',
  min_order_qty     INT           NOT NULL DEFAULT 1,
  max_order_qty     INT,
  unit              VARCHAR(30)   NOT NULL DEFAULT 'Piece',
  images            JSON,
  videos            JSON,
  inventory         INT           NOT NULL DEFAULT 0,
  specifications    JSON,
  variants          JSON,
  price_tiers       JSON,
  seo               JSON,
  tags              JSON,
  location          VARCHAR(120),
  rating            DECIMAL(3,2)  NOT NULL DEFAULT 0,
  review_count      INT           NOT NULL DEFAULT 0,
  status            ENUM('draft','pending','approved','rejected','active','inactive') NOT NULL DEFAULT 'pending',
  is_featured       TINYINT(1)   NOT NULL DEFAULT 0,
  is_trending       TINYINT(1)   NOT NULL DEFAULT 0,
  is_active         TINYINT(1)   NOT NULL DEFAULT 1,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (brand_id)    REFERENCES brands(id) ON DELETE SET NULL,
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
-- LEADS & LEAD PACKAGES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id               VARCHAR(36)   NOT NULL PRIMARY KEY,
  lead_number      VARCHAR(40)   UNIQUE NOT NULL,
  title            VARCHAR(200)  NOT NULL,
  buyer_name       VARCHAR(120)  NOT NULL,
  buyer_company    VARCHAR(120)  NOT NULL,
  buyer_phone      VARCHAR(20)   NOT NULL,
  buyer_email      VARCHAR(120)  NOT NULL,
  city             VARCHAR(80)   NOT NULL,
  state            VARCHAR(80)   NOT NULL,
  category_id      VARCHAR(36)   NOT NULL,
  category_name    VARCHAR(100)  NOT NULL,
  quantity         INT           NOT NULL DEFAULT 1,
  unit             VARCHAR(30)   NOT NULL DEFAULT 'Piece',
  estimated_value  DECIMAL(14,2) NOT NULL DEFAULT 0,
  status           ENUM('open','hot','claimed','closed') NOT NULL DEFAULT 'open',
  claimed_count    INT           NOT NULL DEFAULT 0,
  max_claims       INT           NOT NULL DEFAULT 5,
  lead_price       DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  is_free_eligible TINYINT(1)   NOT NULL DEFAULT 1,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lead_packages (
  id            VARCHAR(36)   NOT NULL PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  lead_count    INT           NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  bonus_leads   INT           NOT NULL DEFAULT 0,
  validity_days INT           NOT NULL DEFAULT 30,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  is_popular    TINYINT(1)    NOT NULL DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lead_settings (
  id                      VARCHAR(36)   NOT NULL PRIMARY KEY,
  free_lead_limit         INT           NOT NULL DEFAULT 10,
  default_price_per_lead  DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  max_suppliers_per_lead  INT           NOT NULL DEFAULT 5,
  auto_assign_hot_leads   TINYINT(1)    NOT NULL DEFAULT 1,
  updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
  rfq_number     VARCHAR(40)  UNIQUE,
  buyer_id       VARCHAR(36)  NOT NULL,
  title          VARCHAR(200) NOT NULL,
  category_id    VARCHAR(36),
  category_name  VARCHAR(100),
  quantity       VARCHAR(60),
  unit           VARCHAR(30)  DEFAULT 'Piece',
  budget         DECIMAL(14,2),
  target_price   VARCHAR(60),
  priority       ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  deadline       DATETIME,
  specifications TEXT,
  attachments    JSON,
  status         ENUM('open','assigned','quoted','closed','expired','cancelled') NOT NULL DEFAULT 'open',
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
  notes          TEXT,
  status         ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rfq_id)    REFERENCES rfqs(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               VARCHAR(36)   NOT NULL PRIMARY KEY,
  order_number     VARCHAR(40)   UNIQUE NOT NULL,
  buyer_id         VARCHAR(36)   NOT NULL,
  supplier_id      VARCHAR(36),
  shipping_address TEXT          NOT NULL,
  payment_method   VARCHAR(40)   NOT NULL DEFAULT 'bank',
  payment_status   ENUM('pending','completed','failed','reversed') NOT NULL DEFAULT 'pending',
  subtotal         DECIMAL(14,2) NOT NULL DEFAULT 0,
  tax              DECIMAL(14,2) NOT NULL DEFAULT 0,
  shipping_cost    DECIMAL(14,2) NOT NULL DEFAULT 0,
  discount         DECIMAL(14,2) NOT NULL DEFAULT 0,
  grand_total      DECIMAL(14,2) NOT NULL DEFAULT 0,
  status           ENUM('placed','pending','confirmed','processing','packed','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  courier_name     VARCHAR(100),
  tracking_number  VARCHAR(100),
  timeline         JSON,
  delivered_at     DATETIME,
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
  FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (seller_id)  REFERENCES users(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- TRANSACTIONS & SETTLEMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id             VARCHAR(36)   NOT NULL PRIMARY KEY,
  transaction_id VARCHAR(60)   UNIQUE NOT NULL,
  order_id       VARCHAR(36),
  order_number   VARCHAR(40),
  buyer_id       VARCHAR(36),
  buyer_name     VARCHAR(120),
  supplier_id    VARCHAR(36),
  supplier_name  VARCHAR(120),
  amount         DECIMAL(14,2) NOT NULL DEFAULT 0,
  commission     DECIMAL(14,2) NOT NULL DEFAULT 0,
  net_amount     DECIMAL(14,2) NOT NULL DEFAULT 0,
  type           ENUM('payment','refund','settlement','commission') NOT NULL DEFAULT 'payment',
  status         ENUM('pending','completed','failed','reversed') NOT NULL DEFAULT 'completed',
  gateway        VARCHAR(60)   NOT NULL DEFAULT 'Razorpay',
  method         VARCHAR(60)   NOT NULL DEFAULT 'UPI',
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- CHAT THREADS & MESSAGES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_threads (
  id              VARCHAR(36) NOT NULL PRIMARY KEY,
  participant_a   VARCHAR(36) NOT NULL,
  participant_b   VARCHAR(36) NOT NULL,
  last_message    TEXT,
  last_message_at DATETIME,
  created_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_thread (participant_a, participant_b),
  FOREIGN KEY (participant_a) REFERENCES users(id),
  FOREIGN KEY (participant_b) REFERENCES users(id)
) ENGINE=InnoDB;

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

CREATE TABLE IF NOT EXISTS flagged_messages (
  id              VARCHAR(36) NOT NULL PRIMARY KEY,
  message_id      VARCHAR(36),
  thread_id       VARCHAR(36),
  sender_id       VARCHAR(36),
  sender_name     VARCHAR(120) NOT NULL,
  sender_role     VARCHAR(40)  NOT NULL,
  recipient_name  VARCHAR(120) NOT NULL,
  message_content TEXT        NOT NULL,
  flag_reason     ENUM('phone_number','email_address','external_link','abusive_language','off_platform_payment') NOT NULL,
  severity        ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  status          ENUM('pending','resolved','banned') NOT NULL DEFAULT 'pending',
  timestamp       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- BROADCAST NOTIFICATION CAMPAIGNS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_campaigns (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,
  message         TEXT         NOT NULL,
  channel         ENUM('push','email','sms','in_app') NOT NULL DEFAULT 'push',
  target_audience VARCHAR(100) NOT NULL DEFAULT 'All Buyers',
  recipient_count INT          NOT NULL DEFAULT 0,
  status          ENUM('draft','scheduled','sent','failed') NOT NULL DEFAULT 'sent',
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- SUPPORT TICKETS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  ticket_number VARCHAR(40)  UNIQUE NOT NULL,
  subject       VARCHAR(200) NOT NULL,
  description   TEXT         NOT NULL,
  status        ENUM('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  priority      ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  category      VARCHAR(60)  NOT NULL DEFAULT 'General',
  created_by    VARCHAR(120) NOT NULL,
  assigned_to   VARCHAR(120),
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- CMS (BANNERS & FAQS)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_banners (
  id         VARCHAR(36)  NOT NULL PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  subtitle   VARCHAR(200),
  image_url  TEXT         NOT NULL,
  link_url   TEXT,
  sort_order INT          NOT NULL DEFAULT 0,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cms_faqs (
  id         VARCHAR(36)  NOT NULL PRIMARY KEY,
  question   TEXT         NOT NULL,
  answer     TEXT         NOT NULL,
  category   VARCHAR(60)  NOT NULL DEFAULT 'General',
  sort_order INT          NOT NULL DEFAULT 0,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- AUDIT & ACTIVITY LOGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id         VARCHAR(36)  NOT NULL PRIMARY KEY,
  user_id    VARCHAR(36),
  user_name  VARCHAR(120) NOT NULL,
  action     VARCHAR(120) NOT NULL,
  module     VARCHAR(60)  NOT NULL,
  details    TEXT,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  timestamp  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- PLATFORM SETTINGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_settings (
  id                     VARCHAR(36)   NOT NULL PRIMARY KEY,
  platform_name          VARCHAR(120)  NOT NULL DEFAULT 'KFPL B2B Marketplace',
  support_email          VARCHAR(120)  NOT NULL DEFAULT 'support@kfpl.com',
  currency               VARCHAR(10)   NOT NULL DEFAULT 'INR',
  timezone               VARCHAR(50)   NOT NULL DEFAULT 'Asia/Kolkata',
  commission_rate        DECIMAL(5,2)  NOT NULL DEFAULT 5.00,
  gst_tax_slab           DECIMAL(5,2)  NOT NULL DEFAULT 18.00,
  maintenance_mode       TINYINT(1)    NOT NULL DEFAULT 0,
  auto_approve_suppliers TINYINT(1)    NOT NULL DEFAULT 0,
  bluedart_api_key       VARCHAR(255),
  delhivery_api_key      VARCHAR(255),
  updated_at             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- KYC APPLICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kyc_applications (
  id               VARCHAR(36) NOT NULL PRIMARY KEY,
  seller_id        VARCHAR(36) NOT NULL UNIQUE,
  gst_number       VARCHAR(20),
  pan_number       VARCHAR(20),
  kyc_doc_url      TEXT        NOT NULL,
  documents        JSON,
  ocr_data         JSON,
  match_confidence INT         NOT NULL DEFAULT 95,
  status           ENUM('not_submitted','pending','approved','rejected','expired') NOT NULL DEFAULT 'pending',
  reason           TEXT,
  reviewed_by      VARCHAR(36),
  reviewed_at      DATETIME,
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id)   REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB;
