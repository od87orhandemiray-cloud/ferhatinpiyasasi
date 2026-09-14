-- Sanal alım-satım platformu veritabanı şeması
-- Gerçek para YOKTUR: bakiyeler tamamen sanal/eğitim amaçlıdır.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Her kullanıcının tek bir sanal TL cüzdanı olur.
CREATE TABLE IF NOT EXISTS wallets (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC(18,2) NOT NULL DEFAULT 100000.00, -- başlangıç sanal bakiyesi
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kullanıcının elinde tuttuğu enstrümanlar (hisse ya da fon).
-- instrument_type: 'stock' | 'fund'
CREATE TABLE IF NOT EXISTS holdings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instrument_type TEXT NOT NULL CHECK (instrument_type IN ('stock', 'fund')),
  symbol TEXT NOT NULL,
  quantity NUMERIC(18,6) NOT NULL DEFAULT 0,
  avg_cost NUMERIC(18,6) NOT NULL DEFAULT 0,
  UNIQUE (user_id, instrument_type, symbol)
);

-- Her alım/satım işleminin kalıcı kaydı (geçmiş ekranı ve denetim için).
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
