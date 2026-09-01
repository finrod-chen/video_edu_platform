-- Migration 003: folders now organize manuals (not courses), courses gain a
-- draft/published/trashed lifecycle matching manuals, three-tier roles.
-- Run once against an EXISTING database that already ran 001/002:
--   mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/003_folders_and_roles.sql
--
-- Safe to run: courses/course_folders/course_manuals hold no real production
-- data yet (confirmed), so they are rebuilt rather than migrated in place.

-- 1. Rebuild courses/course_manuals without their own folder structure,
--    with a status lifecycle matching manuals (published/draft/trashed).
DROP TABLE IF EXISTS course_manuals;
DROP TABLE IF EXISTS courses;

CREATE TABLE courses (
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

CREATE TABLE course_manuals (
  course_id INT NOT NULL,
  manual_id INT NOT NULL,
  position INT DEFAULT 0,
  PRIMARY KEY (course_id, manual_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Folders now organize manuals directly (previously organized courses).
RENAME TABLE course_folders TO folders;
ALTER TABLE manuals ADD COLUMN folder_id INT NULL AFTER org_id,
  ADD FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL;

-- 3. Track publish history on manuals for the permanent-delete permission
--    rule (editors may permanently delete a manual that was never
--    published; anything ever published requires an admin).
ALTER TABLE manuals ADD COLUMN has_been_published BOOLEAN NOT NULL DEFAULT FALSE;

-- 4. Three-tier roles replacing 行政/一般.
UPDATE users SET role = '管理員' WHERE role = '行政';
UPDATE users SET role = '員工' WHERE role = '一般';
ALTER TABLE users MODIFY role VARCHAR(100) DEFAULT '員工';

-- 5. Promote the requested account.
UPDATE users SET role = '管理員' WHERE email = 'finrodchen@xiyuebiomed.com.tw';
