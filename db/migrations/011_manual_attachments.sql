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
