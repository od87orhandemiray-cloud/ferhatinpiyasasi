import { Pool } from "pg";

const SCHEMA_SQL = `
-- Sanal alım-satım platformu veritabanı şeması
-- Gerçek para YOKTUR: bakiyeler tamamen sanal/eğitim amaçlıdır.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallets (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC(18,2) NOT NULL DEFAULT 100000.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS holdings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instrument_type TEXT NOT NULL CHECK (instrument_type IN ('stock', 'fund')),
  symbol TEXT NOT NULL,
  quantity NUMERIC(18,6) NOT NULL DEFAULT 0,
  avg_cost NUMERIC(18,6) NOT NULL DEFAULT 0,
  UNIQUE (user_id, instrument_type, symbol)
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instrument_type TEXT NOT NULL CHECK (instrument_type IN ('stock', 'fund')),
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity NUMERIC(18,6) NOT NULL,
  price NUMERIC(18,6) NOT NULL,
  total NUMERIC(18,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_holdings_user ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);
`;

// Railway'de bir PostgreSQL servisi eklediğinde DATABASE_URL otomatik enjekte edilir.
// Yerelde çalıştırmak için .env dosyanda DATABASE_URL tanımlaman gerekir
// (örn. postgresql://kullanici:sifre@localhost:5432/borsa_platform).
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "[db] UYARI: DATABASE_URL tanımlı değil. Üyelik/cüzdan/alım-satım özellikleri çalışmayacak."
  );
}

export const pool = connectionString
  ? new Pool({
      connectionString,
      // Railway'in yönetilen Postgres'i genelde SSL ister; yerelde gerekmez.
      ssl: connectionString.includes("railway") ? { rejectUnauthorized: false } : undefined,
    })
  : null;

export async function initDb(): Promise<void> {
  if (!pool) return;
  await pool.query(SCHEMA_SQL);
  console.log("[db] Şema hazır (users, wallets, holdings, transactions).");
}

export function requireDb(): Pool {
  if (!pool) {
    throw new Error(
      "Veritabanı bağlantısı yok. DATABASE_URL ortam değişkenini ayarlayın."
    );
  }
  return pool;
}
