-- ---------------------------------------------------------------------------
-- 0002_seed_forms.sql — register the site's known form sources (spec §3 Phase 3
-- step 3).
--
-- `submissions.source` is a foreign key into `forms`, so every source the site
-- can post to must exist before the first submission arrives. The spec lists
-- web-design-hero, web-design-callback, branding-hero, branding-callback and
-- contact; the repo also ships a built SEO service page that posts `seo-hero`
-- and `seo-callback` (see docs/cms-inventory.md), so those two are seeded as
-- well. That is additive and matches what actually exists on the site.
--
-- Sources are also auto-registered at publish time when a service page slug
-- produces `<slug>-hero` / `<slug>-callback` (spec §6), so PPC, Video and any
-- future service page needs no migration — only the five rows below plus SEO
-- are known today.
--
-- INSERT OR IGNORE keeps this idempotent: re-running never overwrites a label,
-- recipients or success message an editor has since set in the CMS.
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO forms (source, label, enabled, notify_emails, success_message, auto_registered) VALUES
  ('web-design-hero',     'Web Design — hero form',     1, '[]', '', 0),
  ('web-design-callback', 'Web Design — callback form', 1, '[]', '', 0),
  ('branding-hero',       'Branding — hero form',       1, '[]', '', 0),
  ('branding-callback',   'Branding — callback form',   1, '[]', '', 0),
  ('seo-hero',            'SEO — hero form',            1, '[]', '', 0),
  ('seo-callback',        'SEO — callback form',        1, '[]', '', 0),
  ('contact',             'Contact form',               1, '[]', '', 0);
