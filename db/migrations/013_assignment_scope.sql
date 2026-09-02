-- 指派支援課程範圍（比照 quizzes 表既有的 scope 模式），manual_id 改成可為 NULL。
ALTER TABLE assignments
  MODIFY COLUMN manual_id INT NULL,
  ADD COLUMN scope ENUM('manual','course') NOT NULL DEFAULT 'manual',
  ADD COLUMN course_id INT NULL,
  ADD FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  ADD INDEX idx_assignments_manual (manual_id),
  ADD INDEX idx_assignments_course (course_id);
