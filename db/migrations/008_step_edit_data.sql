-- 影片編輯（非破壞性 overlay）：剪輯／旋轉／圖形標註／定格 metadata。
-- 不重新編碼原始影片，播放時依這個 JSON 動態套用效果。
-- Run: mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/008_step_edit_data.sql

ALTER TABLE manual_steps ADD COLUMN edit_data JSON NULL;
