-- 喜躍生醫影音訓練系統 — MySQL schema
-- Run against an empty database: mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/schema.sql

CREATE TABLE IF NOT EXISTS organizations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  plan_type VARCHAR(100) DEFAULT '',
  video_quality VARCHAR(100) DEFAULT '',
  translation_language VARCHAR(100) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  org_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(100) DEFAULT '員工',
  avatar_color VARCHAR(20) DEFAULT '#64748B',
  status ENUM('active','invited','disabled') NOT NULL DEFAULT 'active',
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  org_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_group_members (
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  org_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_org_tag (org_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 資料夾：組織手冊用（不組織課程）。parent_id 保留供未來巢狀資料夾使用。
CREATE TABLE IF NOT EXISTS folders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  org_id INT NOT NULL,
  parent_id INT NULL,
  name VARCHAR(255) NOT NULL,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 手冊：資料夾 > 手冊 > 步驟 的中層容器。
CREATE TABLE IF NOT EXISTS manuals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  org_id INT NOT NULL,
  folder_id INT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  status ENUM('published','draft','trashed') NOT NULL DEFAULT 'draft',
  has_been_published BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_manuals_org_status (org_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 步驟：手冊底下的最小可編輯單位，實際承載影片。
CREATE TABLE IF NOT EXISTS manual_steps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  manual_id INT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  title VARCHAR(255) NOT NULL DEFAULT '',
  -- 一個步驟只會是影片或圖片其中一種，media_type 決定要讀哪個路徑欄位。
  media_type ENUM('video','image') NOT NULL DEFAULT 'video',
  video_path VARCHAR(500) NULL,
  image_path VARCHAR(500) NULL,
  thumbnail_path VARCHAR(500) NULL,
  duration_seconds INT NULL,
  captions_vtt MEDIUMTEXT NULL,
  caption_status ENUM('none','pending','done','failed') NOT NULL DEFAULT 'none',
  -- 非破壞性影片編輯（剪輯/旋轉/圖形標註/定格），播放時依此套用，原始影片檔不變動。
  edit_data JSON NULL,
  -- 編輯鎖：同時間只允許一人編輯，10 分鐘沒續鎖視為過期（見 stepLocks.ts）。
  edit_lock_user_id INT NULL,
  edit_lock_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE,
  FOREIGN KEY (edit_lock_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_steps_manual (manual_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 手冊層級 PDF 附件（SOP／表單），站內預覽用，不對外提供靜態下載連結。
CREATE TABLE IF NOT EXISTS manual_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  manual_id INT NOT NULL,
  org_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  uploaded_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS manual_tags (
  manual_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (manual_id, tag_id),
  FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 課程：獨立的教學組合概念，可彙整多本手冊（不屬於資料夾）。
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  org_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  status ENUM('published','draft','trashed') NOT NULL DEFAULT 'draft',
  has_been_published BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course_manuals (
  course_id INT NOT NULL,
  manual_id INT NOT NULL,
  position INT DEFAULT 0,
  PRIMARY KEY (course_id, manual_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bookmarks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  item_type ENUM('manual','course') NOT NULL,
  item_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_bookmark (user_id, item_type, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  due_date DATE NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 已停用：從來沒有任何程式碼寫入過這張表（migration 002）。改用下面的
-- manual_daily_visits（migration 010，即時聚合，不用背景 job 算 rollup）。
-- 留著不刪，沒有任何程式碼再讀寫這張表。
CREATE TABLE IF NOT EXISTS manual_view_daily (
  id INT PRIMARY KEY AUTO_INCREMENT,
  org_id INT NOT NULL,
  visit_date DATE NOT NULL,
  visitor_count INT NOT NULL DEFAULT 0,
  watch_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_org_date (org_id, visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 手冊觀看事件：每位使用者每天每本手冊一列，累加觀看秒數。
-- 「造訪」＝該列存在（即使 watch_seconds=0），report 查詢時直接聚合。
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

-- 已停用：手冊層級的「已瞭解」（migration 004）。改用下面的
-- manual_step_acknowledgments（migration 007，步驟層級）。留著不刪除，
-- 沒有任何程式碼再讀寫這張表。
CREATE TABLE IF NOT EXISTS manual_acknowledgments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  manual_id INT NOT NULL,
  user_id INT NOT NULL,
  acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_ack (manual_id, user_id),
  FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 員工逐步驟確認已瞭解該步驟內容。手冊的「完成」判定看最後一個步驟
-- （position 最大）是否已被確認，或改看是否通過該手冊的測驗（如果有）。
CREATE TABLE IF NOT EXISTS manual_step_acknowledgments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  manual_step_id INT NOT NULL,
  user_id INT NOT NULL,
  acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_step_ack (manual_step_id, user_id),
  FOREIGN KEY (manual_step_id) REFERENCES manual_steps(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 指派：管理員/編輯指定員工研讀整本手冊，或整個課程（scope 決定看 manual_id 還是 course_id）。
-- 群組指派不在這張表留痕跡：建立當下就把群組成員展開成個別 assignment_targets 列
-- （見 src/lib/queries/groups.ts 的 getUserGroupMembers + assignments API），
-- 指派紀錄本身是成員名單的快照，之後有人異動群組不會影響已經指派過的紀錄。
CREATE TABLE IF NOT EXISTS assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  org_id INT NOT NULL,
  scope ENUM('manual','course') NOT NULL DEFAULT 'manual',
  manual_id INT NULL,
  course_id INT NULL,
  assigned_by INT NOT NULL,
  due_date DATE NULL,
  note VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_assignments_manual (manual_id),
  INDEX idx_assignments_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assignment_targets (
  assignment_id INT NOT NULL,
  user_id INT NOT NULL,
  email_sent_at TIMESTAMP NULL,
  PRIMARY KEY (assignment_id, user_id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 測驗：可掛在單一手冊（單元測驗）或整個課程（結業總測驗），單選題。
CREATE TABLE IF NOT EXISTS quizzes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  org_id INT NOT NULL,
  scope ENUM('manual','course') NOT NULL,
  manual_id INT NULL,
  course_id INT NULL,
  title VARCHAR(255) NOT NULL,
  pass_score INT NOT NULL DEFAULT 60,
  status ENUM('draft','published','trashed') NOT NULL DEFAULT 'draft',
  has_been_published BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_quizzes_manual (manual_id, status),
  INDEX idx_quizzes_course (course_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  prompt TEXT NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quiz_choices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question_id INT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  label VARCHAR(500) NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  user_id INT NOT NULL,
  score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_attempts_quiz_user (quiz_id, user_id, submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,
  choice_id INT NOT NULL,
  PRIMARY KEY (attempt_id, question_id),
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (choice_id) REFERENCES quiz_choices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
