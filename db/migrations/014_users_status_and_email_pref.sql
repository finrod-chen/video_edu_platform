-- 使用者停用（離職應對，不做真刪除，保留受訓/測驗紀錄）+ 個人 email 通知開關。
ALTER TABLE users
  MODIFY COLUMN status ENUM('active','invited','disabled') NOT NULL DEFAULT 'active',
  ADD COLUMN email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE;
