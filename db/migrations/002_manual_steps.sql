-- Migration 002: manual steps + description
-- For an EXISTING database that already ran db/schema.sql. Run once:
--   mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/002_manual_steps.sql

ALTER TABLE manuals ADD COLUMN description TEXT NULL AFTER title;

CREATE TABLE IF NOT EXISTS manual_steps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  manual_id INT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  title VARCHAR(255) NOT NULL DEFAULT '',
  video_path VARCHAR(500) NULL,
  thumbnail_path VARCHAR(500) NULL,
  duration_seconds INT NULL,
  captions_vtt MEDIUMTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE,
  INDEX idx_steps_manual (manual_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
