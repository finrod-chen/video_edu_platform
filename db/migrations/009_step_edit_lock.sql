-- 影片編輯鎖：同一時間只允許一位編輯者編輯同一支影片的剪輯/標註/定格設定，
-- 避免兩人同時打開編輯器、其中一人存檔覆蓋掉另一人的變更。
-- Run: mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/009_step_edit_lock.sql

ALTER TABLE manual_steps
  ADD COLUMN edit_lock_user_id INT NULL,
  ADD COLUMN edit_lock_at TIMESTAMP NULL,
  ADD FOREIGN KEY (edit_lock_user_id) REFERENCES users(id) ON DELETE SET NULL;
