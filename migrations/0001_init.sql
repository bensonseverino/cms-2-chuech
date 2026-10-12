-- ---------------------------------------------------------------------------
-- 0001_init.sql — Marino CMS initial schema (spec §3 Phase 3).
--
-- Applied to the shared D1 database with:
--   npx wrangler d1 migrations apply marino-cms --local     (local dev)
--   npx wrangler d1 migrations apply marino-cms --remote    (production)
--   npx wrangler d1 migrations apply marino-cms-preview --remote
--
-- Undo: see docs/runbook.md (D1 Time Travel). Do not write a down-migration —
-- restore a point in time instead.
--
-- Conventions that hold everywhere:
--   * ids are ULIDs generated in code (never AUTOINCREMENT).
--   * every query uses prepare().bind(); no string concatenation, ever.
--   * multi-statement writes go through db.batch().
--   * `data` is the draft, `published_data` is the live snapshot the public API
--     reads. published_data is NULL until the first publish.
--   * timestamps are UTC ISO-ish strings from datetime('now').
-- ---------------------------------------------------------------------------

PRAGMA foreign_keys = ON;

CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT INTO meta (key, value) VALUES ('content_version', '1');

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin','editor','viewer')),
  active INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE media (
  id TEXT PRIMARY KEY,                                   -- 'med_' + ULID
  r2_key TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('image','video','svg','file')),
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  width INTEGER, height INTEGER, duration REAL,
  filename TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  focus_x REAL, focus_y REAL,                            -- 0..1
  poster_media_id TEXT REFERENCES media(id),
  tags TEXT NOT NULL DEFAULT '[]',
  source TEXT NOT NULL DEFAULT 'upload' CHECK (source IN ('upload','import','seed')),
  deleted_at TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_media_created ON media(created_at DESC);
CREATE INDEX idx_media_kind ON media(kind, deleted_at);

CREATE TABLE entries (                                   -- all collections
  id TEXT PRIMARY KEY,                                   -- ULID
  collection TEXT NOT NULL CHECK (collection IN ('services','projects','testimonials','clients','articles')),
  slug TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  sort INTEGER NOT NULL DEFAULT 0,
  data TEXT NOT NULL DEFAULT '{}',                       -- draft
  published_data TEXT,                                   -- live snapshot (null until first publish)
  version INTEGER NOT NULL DEFAULT 1,                    -- optimistic locking
  published_at TEXT,
  created_by TEXT REFERENCES users(id),
  updated_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (collection, slug)
);
CREATE INDEX idx_entries_list ON entries(collection, status, sort);

CREATE TABLE documents (                                 -- singletons and pages
  slug TEXT PRIMARY KEY,                                 -- '_site','_navigation','_footer','_home','_services','_work','web-design',…
  type TEXT NOT NULL CHECK (type IN ('site','navigation','footer','home','services_index','work_index','service_page','page')),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  data TEXT NOT NULL DEFAULT '{}',
  published_data TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  published_at TEXT,
  updated_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE forms (
  source TEXT PRIMARY KEY,                               -- e.g. 'web-design-hero'
  label TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  notify_emails TEXT NOT NULL DEFAULT '[]',
  success_message TEXT NOT NULL DEFAULT '',
  auto_registered INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL REFERENCES forms(source),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','replied','spam','archived')),
  name TEXT, email TEXT, phone TEXT, message TEXT,
  fields TEXT NOT NULL DEFAULT '{}',                     -- any extra fields
  page_path TEXT, referrer TEXT,
  utm TEXT NOT NULL DEFAULT '{}',
  user_agent TEXT,
  ip_hash TEXT,                                          -- salted SHA-256, never the raw IP
  turnstile_ok INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  handled_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_sub_status ON submissions(status, created_at DESC);
CREATE INDEX idx_sub_source ON submissions(source, created_at DESC);

CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,                                  -- create|update|publish|unpublish|delete|upload|login|status…
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  summary TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
