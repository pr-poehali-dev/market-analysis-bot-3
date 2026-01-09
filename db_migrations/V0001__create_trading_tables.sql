-- Таблица настроек пользователей
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    pocket_option_id VARCHAR(255) UNIQUE NOT NULL,
    is_connected BOOLEAN DEFAULT FALSE,
    bot_active BOOLEAN DEFAULT FALSE,
    loss_limit DECIMAL(10, 2) DEFAULT 5.00,
    trade_interval INTEGER DEFAULT 1,
    balance DECIMAL(10, 2) DEFAULT 1000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сделок
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    pair VARCHAR(50) NOT NULL,
    trade_type VARCHAR(10) NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
    open_price DECIMAL(10, 6) NOT NULL,
    close_price DECIMAL(10, 6),
    profit DECIMAL(10, 2),
    expiration VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

-- Таблица валютных пар и сигналов
CREATE TABLE IF NOT EXISTS currency_signals (
    id SERIAL PRIMARY KEY,
    pair_name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 6) NOT NULL,
    change_percent DECIMAL(5, 2) NOT NULL,
    volatility INTEGER NOT NULL,
    signal_type VARCHAR(10) NOT NULL CHECK (signal_type IN ('BUY', 'SELL', 'HOLD')),
    probability INTEGER NOT NULL,
    expiration VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_currency_signals_created_at ON currency_signals(created_at);
CREATE INDEX IF NOT EXISTS idx_user_settings_pocket_id ON user_settings(pocket_option_id);
