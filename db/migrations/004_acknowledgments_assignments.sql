-- Phase B1: 已瞭解按鈕（手冊層級）＋ 指派模組
-- Run: mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/004_acknowledgments_assignments.sql

CREATE TABLE IF NOT EXISTS manual_acknowledgments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  manual_id INT NOT NULL,
  user_id INT NOT NULL,
  acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_ack (manual_id, user_id),
  FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  org_id INT NOT NULL,
  manual_id INT NOT NULL,
  assigned_by INT NOT NULL,
  due_date DATE NULL,
  note VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assignment_targets (
  assignment_id INT NOT NULL,
  user_id INT NOT NULL,
  email_sent_at TIMESTAMP NULL,
  PRIMARY KEY (assignment_id, user_id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
