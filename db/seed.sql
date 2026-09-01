-- Demo seed data for 喜躍生醫影音訓練系統.
-- The organization row is the real, authorized tenant this internal system
-- is built for. Individual users below are placeholder accounts — replace
-- with real staff via the 使用者管理 (org/users) screen or your own import,
-- rather than committing real employee PII into this file.
-- Safe to run in dev/staging.

INSERT INTO organizations (id, name, plan_type, video_quality, translation_language) VALUES
  (1, '喜躍生醫股份有限公司', '內部訓練系統', '始終保持高品質', '繁體中文')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 三級權限示例：管理員 / 編輯 / 員工。狀態一律 active（Google SSO 沒有邀請流程）。
INSERT INTO users (id, org_id, name, email, role, avatar_color, status) VALUES
  (1, 1, '王小明', 'user@example.com', '管理員', '#64748B', 'active'),
  (2, 1, '林小華', 'lin@example.com', '編輯', '#0EA5E9', 'active'),
  (3, 1, '陳小強', 'chen@example.com', '員工', '#F59E0B', 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO user_groups (id, org_id, name, description) VALUES
  (1, 1, '生產線 A 組', '負責產線 A 的教育訓練群組');

INSERT INTO tags (id, org_id, name) VALUES
  (1, 1, '基本操作'),
  (2, 1, '安全規範'),
  (3, 1, '設備維護');

-- 資料夾：組織手冊用。
INSERT INTO folders (id, org_id, parent_id, name) VALUES
  (1, 1, NULL, '新人訓練');

INSERT INTO manuals (id, org_id, folder_id, title, status, has_been_published, updated_by) VALUES
  (1, 1, 1, '新進人員教育訓練 SOP', 'published', TRUE, 1),
  (2, 1, 1, '機台保養標準流程', 'published', TRUE, 1),
  (3, 1, NULL, '緊急停機處理指南', 'draft', FALSE, 1),
  (4, 1, NULL, '舊版包裝作業流程（已停用）', 'trashed', TRUE, 1);

INSERT INTO manual_tags (manual_id, tag_id) VALUES
  (1, 1), (2, 3), (3, 2);

-- 課程：獨立教學組合，可彙整多本手冊（不屬於資料夾）。
INSERT INTO courses (id, org_id, title, status, has_been_published, updated_by) VALUES
  (1, 1, '第一週：基礎操作', 'published', TRUE, 1);

INSERT INTO course_manuals (course_id, manual_id, position) VALUES
  (1, 1, 0), (1, 2, 1);

INSERT INTO bookmarks (user_id, item_type, item_id) VALUES
  (1, 'manual', 1);

INSERT INTO tasks (user_id, title, due_date, done) VALUES
  (1, '完成本月安全規範複訓', DATE_ADD(CURDATE(), INTERVAL 7 DAY), FALSE);

-- 30 days of clearly-fictional report data ending today
INSERT INTO manual_view_daily (org_id, visit_date, visitor_count, watch_hours)
SELECT 1, DATE_SUB(CURDATE(), INTERVAL n DAY), FLOOR(1 + RAND() * 4), ROUND(RAND() * 2, 2)
FROM (
  SELECT a.N + b.N * 10 AS n
  FROM (SELECT 0 N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
        UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
       (SELECT 0 N UNION SELECT 1 UNION SELECT 2) b
  HAVING n < 30
) days
ON DUPLICATE KEY UPDATE visitor_count = VALUES(visitor_count);
