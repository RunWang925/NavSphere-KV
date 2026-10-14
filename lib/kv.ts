import navigationFallback from '@/navsphere/content/navigation.json'
import navigationDefault from '@/navsphere/content/navigation-default.json'
import type { NavigationData } from '@/types/navigation'

const KV_KEY = 'navigation'

export async function getEnv(): Promise<any | null> {
  if (process.env.CF_PAGES !== '1') return null
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages')
    return getRequestContext().env
  } catch {
    return null
  }
}

export async function getNavigation(): Promise<NavigationData> {
  const env = await getEnv()
  if (env?.NAV_KV) {
    const data = await env.NAV_KV.get(KV_KEY, 'json')
    if (data) return data as NavigationData
    await env.NAV_KV.put(KV_KEY, JSON.stringify(navigationFallback))
    return navigationFallback as NavigationData
  }
  return navigationFallback as NavigationData
}

export async function saveNavigation(data: NavigationData): Promise<void> {
  const env = await getEnv()
  if (env?.NAV_KV) {
    await env.NAV_KV.put(KV_KEY, JSON.stringify(data))
    return
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
import siteFallback from '@/navsphere/content/site.json'

export async function getSite(): Promise<any> {
  const env = await getEnv()
  if (env?.NAV_KV) {
    const data = await env.NAV_KV.get('site', 'json')
    if (data) return data
    await env.NAV_KV.put('site', JSON.stringify(siteFallback))
    return siteFallback
  }
  return siteFallback
}

export async function saveSite(data: any): Promise<void> {
  const env = await getEnv()
  if (env?.NAV_KV) {
    await env.NAV_KV.put('site', JSON.stringify(data))
    return
  }
  console.warn('[local] KV 不可用，site 数据未持久化')
}
import resourceFallback from '@/navsphere/content/resource-metadata.json'

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

