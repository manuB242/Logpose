-- LogPose — schéma MySQL 8+ / MariaDB 10.6+
-- Exécuter avec un compte ayant les droits sur la base cible :
-- mysql -u root -p < backend/database/schema.sql

CREATE DATABASE IF NOT EXISTS logpose
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE logpose;

CREATE TABLE IF NOT EXISTS sectors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sectors_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS zones (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_zones_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS companies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sector_id BIGINT UNSIGNED NULL,
  name VARCHAR(180) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_companies_name (name),
  KEY idx_companies_sector (sector_id),
  CONSTRAINT fk_companies_sector FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS job_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(160) NOT NULL,
  description VARCHAR(255) NOT NULL,
  symbol VARCHAR(16) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_job_categories_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED NOT NULL,
  sector_id BIGINT UNSIGNED NOT NULL,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  profile TEXT NOT NULL,
  mission TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_jobs_slug (slug),
  KEY idx_jobs_category (category_id),
  KEY idx_jobs_sector (sector_id),
  CONSTRAINT fk_jobs_category FOREIGN KEY (category_id) REFERENCES job_categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_jobs_sector FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS skills (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_skills_job_name (job_id, name),
  CONSTRAINT fk_skills_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS establishments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(180) NOT NULL,
  city VARCHAR(120) NOT NULL,
  country VARCHAR(120) NOT NULL DEFAULT 'République du Congo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_establishments_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS programs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  establishment_id BIGINT UNSIGNED NOT NULL,
  field VARCHAR(160) NOT NULL,
  name VARCHAR(180) NOT NULL,
  duration VARCHAR(60) NOT NULL,
  duration_months SMALLINT UNSIGNED NOT NULL,
  level VARCHAR(80) NOT NULL,
  format VARCHAR(160) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_programs_establishment_name (establishment_id, name),
  KEY idx_programs_field (field),
  CONSTRAINT fk_programs_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS baccalaureate_series (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(80) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_series_code (code),
  UNIQUE KEY uq_series_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS program_series (
  program_id BIGINT UNSIGNED NOT NULL,
  series_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (program_id, series_id),
  CONSTRAINT fk_program_series_program FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
  CONSTRAINT fk_program_series_series FOREIGN KEY (series_id) REFERENCES baccalaureate_series(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS program_jobs (
  program_id BIGINT UNSIGNED NOT NULL,
  job_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (program_id, job_id),
  CONSTRAINT fk_program_jobs_program FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
  CONSTRAINT fk_program_jobs_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employment_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  period VARCHAR(20) NOT NULL,
  job_id BIGINT UNSIGNED NOT NULL,
  sector_id BIGINT UNSIGNED NOT NULL,
  zone_id BIGINT UNSIGNED NOT NULL,
  company_id BIGINT UNSIGNED NOT NULL,
  employment_type ENUM('CDI', 'CDD', 'Stage', 'Intérim', 'Freelance/Indépendant', 'Alternance') NOT NULL,
  job_count INT UNSIGNED NOT NULL,
  variation_percent DECIMAL(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_employment_record (period, job_id, zone_id, company_id, employment_type),
  KEY idx_employment_period (period),
  KEY idx_employment_sector (sector_id),
  KEY idx_employment_zone (zone_id),
  CONSTRAINT fk_employment_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_employment_sector FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE RESTRICT,
  CONSTRAINT fk_employment_zone FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE RESTRICT,
  CONSTRAINT fk_employment_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(200) NOT NULL,
  organizer VARCHAR(180) NOT NULL,
  city VARCHAR(120) NOT NULL,
  field VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_contests_slug (slug),
  KEY idx_contests_field (field)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contest_series (
  contest_id BIGINT UNSIGNED NOT NULL,
  series_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (contest_id, series_id),
  CONSTRAINT fk_contest_series_contest FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
  CONSTRAINT fk_contest_series_series FOREIGN KEY (series_id) REFERENCES baccalaureate_series(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS papers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contest_id BIGINT UNSIGNED NOT NULL,
  slug VARCHAR(140) NOT NULL,
  label VARCHAR(180) NOT NULL,
  year SMALLINT UNSIGNED NOT NULL,
  document_type VARCHAR(80) NOT NULL,
  page_count SMALLINT UNSIGNED NOT NULL,
  storage_key VARCHAR(255) NULL,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_papers_slug (slug),
  KEY idx_papers_contest (contest_id),
  CONSTRAINT fk_papers_contest FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Aucune donnée personnelle n'est demandée dans cette première version.
-- answers est un JSON contenant uniquement les choix du questionnaire.
CREATE TABLE IF NOT EXISTS orientation_sessions (
  id CHAR(32) PRIMARY KEY,
  answers JSON NOT NULL,
  status ENUM('open', 'completed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  KEY idx_orientation_sessions_status_created (status, created_at)
) ENGINE=InnoDB;
