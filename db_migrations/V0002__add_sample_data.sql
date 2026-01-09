-- Добавляем тестовые валютные пары и сигналы
INSERT INTO currency_signals (pair_name, price, change_percent, volatility, signal_type, probability, expiration) VALUES 
('EUR/USD', 1.0875, 0.34, 72, 'BUY', 87, '2m'),
('GBP/USD', 1.2634, -0.21, 65, 'SELL', 82, '1m'),
('USD/JPY', 149.32, 0.18, 58, 'BUY', 76, '2m'),
('AUD/USD', 0.6521, 0.45, 81, 'BUY', 91, '1m'),
('USD/CHF', 0.8834, -0.12, 48, 'HOLD', 62, '2m'),
('EUR/GBP', 0.8605, 0.28, 69, 'BUY', 79, '1m');

-- Добавляем тестового пользователя
INSERT INTO user_settings (pocket_option_id, is_connected, bot_active, loss_limit, trade_interval, balance) 
VALUES ('demo_user_001', false, false, 5.00, 1, 1000.00);

-- Добавляем тестовые сделки
INSERT INTO trades (user_id, pair, trade_type, open_price, close_price, profit, expiration, status, closed_at) VALUES 
(1, 'EUR/USD', 'BUY', 1.0850, 1.0875, 25.00, '2m', 'CLOSED', NOW() - INTERVAL '2 minutes'),
(1, 'GBP/USD', 'SELL', 1.2650, 1.2634, 16.00, '1m', 'CLOSED', NOW() - INTERVAL '4 minutes'),
(1, 'USD/JPY', 'BUY', 149.40, 149.32, -8.00, '2m', 'CLOSED', NOW() - INTERVAL '6 minutes');
