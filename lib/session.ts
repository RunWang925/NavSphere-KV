import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import type { SessionData } from '@/types/session'

async function getSecret(): Promise<string> {
  if (process.env.CF_PAGES === '1') {
    try {
      const { getRequestContext } = await import('@cloudflare/next-on-pages')
      const env = getRequestContext().env as any
      if (env.SESSION_SECRET) return env.SESSION_SECRET
    } catch {}
  }
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET
  throw new Error('SESSION_SECRET is not defined')
}

export async function getSession(cookieStore?: any) {
  const password = await getSecret()
  const store = cookieStore ?? (await cookies())
  const session = await getIronSession<SessionData>(store, {
    password,
    cookieName: 'navsphere-session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax' as const,
    },
  })

  if (!session.isLoggedIn) {
    session.isLoggedIn = false
  }

  return session
}