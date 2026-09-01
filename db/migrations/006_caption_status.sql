-- Phase B4: Whisper 自動字幕 -- 追蹤每個步驟的字幕產生狀態
-- Run: mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/006_caption_status.sql

ALTER TABLE manual_steps
  ADD COLUMN caption_status ENUM('none','pending','done','failed') NOT NULL DEFAULT 'none';
