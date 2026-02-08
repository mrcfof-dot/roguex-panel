CREATE DATABASE IF NOT EXISTS roguex_panel;
USE roguex_panel;

CREATE TABLE IF NOT EXISTS license_keys (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `key` VARCHAR(255) NOT NULL UNIQUE,
  label VARCHAR(255),
  max_devices INT DEFAULT 1,
  status ENUM('active', 'expired', 'banned') DEFAULT 'active',
  expires_at DATETIME NOT NULL,
  discord_id VARCHAR(255),
  discord_username VARCHAR(255),
  discord_avatar VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by CHAR(36)
);

CREATE TABLE IF NOT EXISTS hwids (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  key_id CHAR(36) NOT NULL,
  hwid VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  last_seen_at DATETIME,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (key_id) REFERENCES license_keys(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  key_id CHAR(36),
  event_type VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  hwid VARCHAR(255),
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (key_id) REFERENCES license_keys(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  setting_value VARCHAR(255)
);

INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
('maintenance_mode', 'false'),
('service_status', 'true');

-- Insert a sample key
INSERT INTO license_keys (id, `key`, label, max_devices, status, expires_at)
VALUES (UUID(), 'ROGUEX-TEST-KEY-1234-5678', 'Test Key', 1, 'active', DATE_ADD(NOW(), INTERVAL 30 DAY));
