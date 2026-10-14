import navigationFallback from '@/navsphere/content/navigation.json'
import navigationDefault from '@/navsphere/content/navigation-default.json'
import type { NavigationData } from '@/types/navigation'
import siteFallback from '@/navsphere/content/site.json'
import resourceFallback from '@/navsphere/content/resource-metadata.json'

const KV_KEY = 'navigation'
const CACHE_TTL = 7 * 24 * 60 * 60

export async function getEnv(): Promise<any | null> {
  if (process.env.CF_PAGES !== '1') return null
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages')
    return getRequestContext().env
  } catch {
    return null
  }
}

async function getFromCache(key: string): Promise<any | null> {
  try {
    if (typeof caches === 'undefined') return null
    const cache = caches.default
    const response = await cache.match(`https://navsphere.local/${key}`)
    if (response) {
      return await response.json()
    }
  } catch {}
  return null
}

async function putToCache(key: string, data: any): Promise<void> {
  try {
    if (typeof caches === 'undefined') return
    const cache = caches.default
    const response = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `max-age=${CACHE_TTL}`
      }
    })
    await cache.put(`https://navsphere.local/${key}`, response)
  } catch {}
}

export async function clearNavCache(): Promise<void> {
  try {
    if (typeof caches === 'undefined') return
    const cache = caches.default
    await cache.delete('https://navsphere.local/navigation')
    await cache.delete('https://navsphere.local/site')
  } catch {}
}

export async function getNavigation(): Promise<NavigationData> {
  const env = await getEnv()
  if (env?.NAV_KV) {
    try {
      const data = await env.NAV_KV.get(KV_KEY, 'json')
      if (data) return data as NavigationData
      await env.NAV_KV.put(KV_KEY, JSON.stringify(navigationFallback))
      return navigationFallback as NavigationData
    } catch (e) {
      console.warn('KV read failed, using fallback:', e)
      return navigationFallback as NavigationData
    }
  }
  return navigationFallback as NavigationData
}

export async function getNavigationCached(): Promise<NavigationData> {
  const cached = await getFromCache('navigation')
  if (cached) return cached as NavigationData
  const data = await getNavigation()
  await putToCache('navigation', data)
  return data
}

export async function saveNavigation(data: NavigationData): Promise<void> {
  const env = await getEnv()
  if (env?.NAV_KV) {
    await env.NAV_KV.put(KV_KEY, JSON.stringify(data))
    await clearNavCache()
    return
  }
  if (process.env.CF_PAGES === '1') {
    throw new Error('KV 未绑定，无法保存。请在 Cloudflare Dashboard → Settings → Functions → KV 绑定变量名 NAV_KV')
  }
  console.warn('[local] KV 不可用，数据未持久化（本地开发模式）')
}

export async function restoreNavigation(): Promise<NavigationData> {
  const def = navigationDefault as NavigationData
  await saveNavigation(def)
  return def
}

export function getDefaultNavigation(): NavigationData {
  return navigationDefault as NavigationData
}

export async function getSite(): Promise<any> {
  const env = await getEnv()
  if (env?.NAV_KV) {
    try {
      const data = await env.NAV_KV.get('site', 'json')
      if (data) return data
      await env.NAV_KV.put('site', JSON.stringify(siteFallback))
      return siteFallback
    } catch (e) {
      console.warn('KV read failed, using fallback:', e)
      return siteFallback
    }
  }
  return siteFallback
}

export async function getSiteCached(): Promise<any> {
  const cached = await getFromCache('site')
  if (cached) return cached
  const data = await getSite()
  await putToCache('site', data)
  return data
}

export async function saveSite(data: any): Promise<void> {
  const env = await getEnv()
  if (env?.NAV_KV) {
    await env.NAV_KV.put('site', JSON.stringify(data))
    await clearNavCache()
    return
  }
  if (process.env.CF_PAGES === '1') {
    throw new Error('KV 未绑定，无法保存。请绑定 NAV_KV')
  }
  console.warn('[local] KV 不可用，site 数据未持久化')
}

export async function getResource(): Promise<any> {
  const env = await getEnv()
  if (env?.NAV_KV) {
    const data = await env.NAV_KV.get('resource', 'json')
    if (data) return data
    await env.NAV_KV.put('resource', JSON.stringify(resourceFallback))
    return resourceFallback
  }
  return resourceFallback
}

export async function saveResource(data: any): Promise<void> {
  const env = await getEnv()
  if (env?.NAV_KV) {
    await env.NAV_KV.put('resource', JSON.stringify(data))
    return
  }
  if (process.env.CF_PAGES === '1') {
    throw new Error('KV 未绑定，无法保存。请绑定 NAV_KV')
  }
  console.warn('[local] KV 不可用，resource 数据未持久化')
}

export async function getAdminPassword(): Promise<string> {
  const env = await getEnv()
  if (env?.NAV_KV) {
    const stored = await env.NAV_KV.get('admin_password', 'text')
    if (stored) return stored
  }
  if (env?.ADMIN_PASSWORD) return env.ADMIN_PASSWORD
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD
  return 'admin'
}

export async function setAdminPassword(password: string): Promise<void> {
  const env = await getEnv()
  if (!env?.NAV_KV) {
    throw new Error('KV 不可用，无法修改密码')
  }
  await env.NAV_KV.put('admin_password', password)
}
