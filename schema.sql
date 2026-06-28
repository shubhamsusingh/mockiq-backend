-- ─────────────────────────────────────────────────────────────────────
-- MockIQ Database Schema
-- Run: mysql -u root -p < schema.sql
-- ─────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS mockiq_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mockiq_db;

-- ─── Users ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  is_active   TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email     (email),
  INDEX idx_is_active (is_active)
);

-- ─── Refresh Tokens ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  token       TEXT          NOT NULL,
  user_id     INT           NOT NULL,
  expires_at  DATETIME      NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Domains ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS domains (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  slug        VARCHAR(100)  NOT NULL UNIQUE,
  description VARCHAR(255)  NOT NULL DEFAULT '',
  icon        VARCHAR(10)   NOT NULL DEFAULT '◈',
  is_active   TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_slug      (slug),
  INDEX idx_is_active (is_active)
);

-- ─── Questions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  domain_id    INT           NOT NULL,
  difficulty   ENUM('Easy','Medium','Hard') NOT NULL,
  question     TEXT          NOT NULL,
  topic        VARCHAR(150)  NOT NULL DEFAULT '',
  hint         TEXT          NOT NULL DEFAULT '',
  ideal_answer TEXT          NOT NULL DEFAULT '',
  is_active    TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  INDEX idx_domain_diff (domain_id, difficulty),
  INDEX idx_is_active   (is_active)
);

-- ─── Sessions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT           NOT NULL,
  domain_id   INT           NOT NULL,
  difficulty  ENUM('Easy','Medium','Hard') NOT NULL,
  score       TINYINT       NOT NULL DEFAULT 0,
  total_q     TINYINT       NOT NULL DEFAULT 5,
  verdict     VARCHAR(50)   NOT NULL DEFAULT '',
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  INDEX idx_user_id   (user_id),
  INDEX idx_domain_id (domain_id)
);

-- ─── Session Answers ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_answers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  session_id  INT           NOT NULL,
  question_id INT               NULL,
  answer      TEXT          NOT NULL DEFAULT '',
  score       TINYINT       NOT NULL DEFAULT 0,
  feedback    TEXT          NOT NULL DEFAULT '',
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id)  REFERENCES sessions(id)  ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE SET NULL
);
