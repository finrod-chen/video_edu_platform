-- 已瞭解從「手冊層級」改成「步驟層級」：員工要逐步驟確認，最後一個步驟
-- 確認後才能進入該手冊的測驗（如果有的話）。
-- Run: mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/007_step_acknowledgments.sql
--
-- manual_acknowledgments（migration 004 建立的手冊層級「已瞭解」表）自此
-- 停用，不再被任何程式碼讀寫，但為了避免像 003 那次 DROP TABLE 被外鍵卡住
-- 的狀況，這裡不刪除它，單純留著不用。

CREATE TABLE IF NOT EXISTS manual_step_acknowledgments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  manual_step_id INT NOT NULL,
  user_id INT NOT NULL,
  acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_step_ack (manual_step_id, user_id),
  FOREIGN KEY (manual_step_id) REFERENCES manual_steps(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
