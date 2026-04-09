CREATE DATABASE IF NOT EXISTS portfolio_ib
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE portfolio_ib;

CREATE TABLE IF NOT EXISTS projects (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(180) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  year VARCHAR(20) NULL,
  role VARCHAR(255) NULL,
  description TEXT NOT NULL,
  tags_json JSON NULL,
  image VARCHAR(255) NULL,
  video_url VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  project VARCHAR(255) NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'archived') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(80) NOT NULL,
  price_day DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_week DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS customers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NULL,
  phone VARCHAR(60) NULL,
  company VARCHAR(180) NULL,
  documents_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS availability_blocks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id VARCHAR(64) NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_availability_product (product_id),
  CONSTRAINT fk_availability_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  payload_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO projects (slug, title, year, role, description, tags_json, image, video_url)
VALUES
  (
    'clip-creative-01',
    'Clip créateur — Montage',
    '2025',
    'Montage • Color',
    'Montage dynamique pensé pour la rétention, avec rythme, sound design et sous-titres.',
    JSON_ARRAY('Montage','Color','Réseaux'),
    '/og-image.png',
    'https://example.com'
  ),
  (
    'captation-live-01',
    'Captation spectacle — Multi-cam',
    '2024',
    'Cadrage • Machiniste',
    'Captation multi-cam avec gestion du plateau, synchro et export multi-formats.',
    JSON_ARRAY('Captation','Multi-cam','Spectacle'),
    '/assets/hero.png',
    'https://example.com'
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  year = VALUES(year),
  role = VALUES(role),
  description = VALUES(description),
  tags_json = VALUES(tags_json),
  image = VALUES(image),
  video_url = VALUES(video_url);

INSERT INTO products (id, name, category, price_day, price_week)
VALUES
  ('sony-fx3', 'Sony FX3', 'cameras', 120, 650),
  ('bmpcc-6k', 'Blackmagic Pocket 6K', 'cameras', 90, 500),
  ('a7s-iii', 'Sony A7S III', 'cameras', 100, 560),
  ('sigma-18-35', 'Sigma 18–35mm', 'lenses', 25, 130),
  ('aputure-600x', 'Aputure 600x', 'lights', 45, 240),
  ('rode-ntg5', 'Rode NTG5', 'audio', 20, 110),
  ('kit-doc', 'Kit documentaire', 'kits', 180, 980)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  category = VALUES(category),
  price_day = VALUES(price_day),
  price_week = VALUES(price_week);

/* ── Paramètres globaux ────────────────────────────────────── */
CREATE TABLE IF NOT EXISTS settings (
  `key`       VARCHAR(80)   NOT NULL,
  `value`     TEXT          NOT NULL,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
);

INSERT INTO settings (`key`, `value`)
VALUES ('deposit_rate', '20')
ON DUPLICATE KEY UPDATE `key` = `key`;

/* ── Codes promo ───────────────────────────────────────────── */
CREATE TABLE IF NOT EXISTS promo_codes (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code        VARCHAR(60)   NOT NULL UNIQUE,
  type        ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  value       DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_uses    INT UNSIGNED  NULL,
  uses        INT UNSIGNED  NOT NULL DEFAULT 0,
  active      TINYINT(1)    NOT NULL DEFAULT 1,
  expires_at  DATETIME      NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
