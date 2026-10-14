import { getSession } from '@/lib/session'

export async function auth() {
  const session = await getSession()
  if (!session.isLoggedIn) return null
  return {
    user: {
      name: session.user?.name || 'Admin',
      email: session.user?.email || '',
      image: session.user?.image || '',
    },
  }
}