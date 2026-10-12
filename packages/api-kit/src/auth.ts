import { createRemoteJWKSet, jwtVerify } from 'jose'
import { error } from './http'
import { newId } from './ids'
import type { Env } from './types'

/*
 * Admin authentication (spec §1 "Auth for the admin", §7, §3 Phase 7).
 *
 * Cloudflare Access is the front door, but the API re-verifies the Access JWT
 * on EVERY request: a request that reaches the Function directly (an internal
 * fetch, a misconfigured route, a preview hostname) must not be trusted.
 *
 * The email in the verified token maps to a role in the `users` table. Access
 * decides who may enter; this decides what they may do.
 *
 * Fail closed. The local-dev bypass is the ONLY path that skips verification,
 * and it requires both a loopback host and DEV_USER_EMAIL, which is never set
 * in Cloudflare (spec §9.2).
 */

export type Role = 'admin' | 'editor' | 'viewer'

export type User = {
  id: string
  email: string
  name: string | null
  role: Role
}

export type AuthResult = { ok: true; user: User } | { ok: false; response: Response }

type UserRow = {
  id: string
  email: string
  name: string | null
  role: Role
  active: number
}

/** Verification results are cached per team domain (jose handles key rotation). */
const jwksByTeam = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

function jwksFor(teamDomain: string): ReturnType<typeof createRemoteJWKSet> {
  const existing = jwksByTeam.get(teamDomain)
  if (existing) return existing

  const set = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`))
  jwksByTeam.set(teamDomain, set)
  return set
}

/** Identify the caller, or explain why not. */
export async function getUser(request: Request, env: Env): Promise<AuthResult> {
  const devEmail = devEmailFor(request, env)
  if (devEmail) return mapToUser(env, devEmail)

  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN
  const audience = env.CF_ACCESS_AUD

  if (!teamDomain || !audience) {
    console.error('[auth] Access is not configured: CF_ACCESS_TEAM_DOMAIN and/or CF_ACCESS_AUD missing')
    return { ok: false, response: error('unauthorized', 'Authentication is not configured') }
  }

  const token = request.headers.get('Cf-Access-Jwt-Assertion')
  if (!token) {
    return {
      ok: false,
      response: error('unauthorized', 'Sign in through Cloudflare Access to reach the CMS'),
    }
  }

  let email: string
  try {
    const { payload } = await jwtVerify(token, jwksFor(teamDomain), {
      issuer: `https://${teamDomain}`,
      audience,
    })

    const claim = payload.email
    if (typeof claim !== 'string' || claim.length === 0) {
      console.error('[auth] Access token verified but has no email claim')
      return { ok: false, response: error('forbidden', 'This Access identity has no email address') }
    }
    email = claim
  } catch (cause) {
    // A failed Access verification is logged (spec §7).
    console.error('[auth] Access token verification failed', cause)
    return { ok: false, response: error('unauthorized', 'Access token is not valid') }
  }

  return mapToUser(env, email)
}

/**
 * The local-dev bypass. Both conditions are required: a loopback hostname AND a
 * configured DEV_USER_EMAIL. On any real hostname this returns null, so the
 * production build always verifies (spec §3 Phase 7 step 3).
 */
function devEmailFor(request: Request, env: Env): string | null {
  const configured = env.DEV_USER_EMAIL
  if (!configured) return null

  let hostname: string
  try {
    hostname = new URL(request.url).hostname
  } catch {
    return null
  }

  const isLoopback =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.localhost')

  return isLoopback ? configured : null
}

async function mapToUser(env: Env, email: string): Promise<AuthResult> {
  const row = await env.DB.prepare(
    'SELECT id, email, name, role, active FROM users WHERE email = ? COLLATE NOCASE',
  )
    .bind(email)
    .first<UserRow>()

  if (row) {
    if (row.active !== 1) {
      return { ok: false, response: error('forbidden', 'This account has been deactivated') }
    }
    await touchLastLogin(env, row.id)
    return { ok: true, user: { id: row.id, email: row.email, name: row.name, role: row.role } }
  }

  // No row yet: bootstrap ONLY when the table is empty and the email matches
  // BOOTSTRAP_ADMIN_EMAIL. Any other unknown email is rejected (spec §3 Phase 7
  // step 2) — an editor is added deliberately from the Users screen.
  const bootstrap = env.BOOTSTRAP_ADMIN_EMAIL
  if (bootstrap && bootstrap.toLowerCase() === email.toLowerCase()) {
    const { count } = await countUsers(env)
    if (count === 0) {
      const id = newId()
      await env.DB.prepare('INSERT INTO users (id, email, role) VALUES (?, ?, ?)')
        .bind(id, email, 'admin')
        .run()
      return { ok: true, user: { id, email, name: null, role: 'admin' } }
    }
  }

  return { ok: false, response: error('forbidden', 'This email is not an active CMS user') }
}

async function countUsers(env: Env): Promise<{ count: number }> {
  const row = await env.DB.prepare('SELECT COUNT(*) AS count FROM users').first<{ count: number }>()
  return { count: row?.count ?? 0 }
}

/** Update last_login_at at most once an hour, so a busy session is not chatty. */
async function touchLastLogin(env: Env, id: string): Promise<void> {
  try {
    await env.DB.prepare(
      `UPDATE users SET last_login_at = datetime('now')
        WHERE id = ? AND (last_login_at IS NULL OR last_login_at < datetime('now', '-1 hour'))`,
    )
      .bind(id)
      .run()
  } catch (cause) {
    console.error('[auth] last_login_at update failed', cause)
  }
}

// --- Roles ------------------------------------------------------------------

const RANK: Record<Role, number> = { viewer: 0, editor: 1, admin: 2 }

/**
 * The capability matrix (spec §3 Phase 7):
 *
 *   read content / media / submissions ............ viewer
 *   create, edit, publish content; upload media ... editor
 *   submission status + notes ..................... editor
 *   delete submissions/media, SVG upload .......... admin
 *   forms, users, site settings, audit ............ admin
 *
 * Endpoints express this as the minimum role they need; the matrix lives here
 * so it is written once.
 */
export function hasRole(user: User, required: Role): boolean {
  return RANK[user.role] >= RANK[required]
}

/** `null` when allowed; a 403 response when not. */
export function requireRole(user: User, required: Role): Response | null {
  if (hasRole(user, required)) return null
  return error('forbidden', `This action needs the ${required} role`)
}
