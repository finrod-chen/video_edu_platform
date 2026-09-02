-- 真實觀看數據：manual_view_daily 從沒有任何程式碼寫入過（只有種子資料）。
-- 改用即時聚合的原始事件表，不用背景 job 算 rollup。
CREATE TABLE IF NOT EXISTS manual_daily_visits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  org_id INT NOT NULL,
  manual_id INT NOT NULL,
  user_id INT NOT NULL,
  visit_date DATE NOT NULL,
  watch_seconds INT NOT NULL DEFAULT 0,
  UNIQUE KEY uniq_visit (manual_id, user_id, visit_date),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
