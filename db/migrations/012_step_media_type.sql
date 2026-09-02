-- 步驟支援圖片（除了影片）：一個步驟只會是影片或圖片其中一種。
ALTER TABLE manual_steps
  ADD COLUMN media_type ENUM('video','image') NOT NULL DEFAULT 'video',
  ADD COLUMN image_path VARCHAR(500) NULL;
