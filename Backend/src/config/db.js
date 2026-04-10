import mysql from 'mysql2/promise'
import { env } from './env.js'

let pool

export function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.mysql.host,
      port: env.mysql.port,
      user: env.mysql.user,
      password: env.mysql.password,
      database: env.mysql.database,
      connectionLimit: env.mysql.connectionLimit,
      waitForConnections: true,
      queueLimit: 0,
    })
  }
  return pool
}

export async function testDbConnection() {
  const db = getDbPool()
  await db.query('SELECT 1')
}

export async function ensureDbSchema() {
  const db = getDbPool()

  await db.query(
    `CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(80) NOT NULL DEFAULT 'cameras',
      brand VARCHAR(120) NULL,
      sku VARCHAR(120) NULL,
      description TEXT NULL,
      image_url VARCHAR(512) NULL,
      specs_json JSON NULL,
      price_day DECIMAL(10,2) NOT NULL DEFAULT 0,
      price_week DECIMAL(10,2) NOT NULL DEFAULT 0,
      deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
      replacement_value DECIMAL(10,2) NOT NULL DEFAULT 0,
      stock INT UNSIGNED NOT NULL DEFAULT 1,
      status ENUM('active','inactive','maintenance') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )`,
  )

  // Ajouter les colonnes manquantes si la table existait déjà (migration)
  const alterColumns = [
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(120) NULL`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(120) NULL`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT NULL`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(512) NULL`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS specs_json JSON NULL`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS deposit DECIMAL(10,2) NOT NULL DEFAULT 0`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS replacement_value DECIMAL(10,2) NOT NULL DEFAULT 0`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT UNSIGNED NOT NULL DEFAULT 1`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS status ENUM('active','inactive','maintenance') NOT NULL DEFAULT 'active'`,
  ]
  for (const sql of alterColumns) {
    await db.query(sql).catch(() => {})
  }

  await db.query(
    `CREATE TABLE IF NOT EXISTS customers (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NULL,
      phone VARCHAR(60) NULL,
      company VARCHAR(180) NULL,
      documents_json JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )`,
  )

  await db.query(
    `CREATE TABLE IF NOT EXISTS availability_blocks (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      product_id VARCHAR(64) NOT NULL,
      start_date DATE NULL,
      end_date DATE NULL,
      note TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_availability_product (product_id),
      CONSTRAINT fk_availability_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,
  )

  await db.query(
    `CREATE TABLE IF NOT EXISTS orders (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      payload_json JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )`,
  )

  await db.query(
    `INSERT INTO products (id, name, category, price_day, price_week)
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
      price_week = VALUES(price_week)`,
  )

  await db.query(
    `CREATE TABLE IF NOT EXISTS settings (
      \`key\`      VARCHAR(80) NOT NULL,
      \`value\`    TEXT        NOT NULL,
      updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`key\`)
    )`,
  )

  await db.query(
    `INSERT INTO settings (\`key\`, \`value\`)
     VALUES ('deposit_rate', '20')
     ON DUPLICATE KEY UPDATE \`key\` = \`key\``,
  )

  await db.query(
    `CREATE TABLE IF NOT EXISTS promo_codes (
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
    )`,
  )
}
