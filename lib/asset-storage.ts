import { getEnv } from './kv'
import { uint8ArrayToBase64 } from './buffer-utils'

const ASSET_PREFIX = 'asset:'

export async function saveAsset(
  binaryData: Uint8Array,
  extension: string
): Promise<{ key: string; url: string }> {
  const env = await getEnv()
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`

  if (env?.R2_BUCKET) {
    await env.R2_BUCKET.put(key, binaryData, {
      httpMetadata: { contentType: getContentType(key) }
    })
    return { key, url: `/api/asset/${key}` }
  }

  if (env?.NAV_KV) {
    const base64 = uint8ArrayToBase64(binaryData)
    await env.NAV_KV.put(ASSET_PREFIX + key, base64)
    return { key, url: `/api/asset/${key}` }
  }

  throw new Error('无可用的图片存储后端（需绑定 NAV_KV 或 R2_BUCKET）')
}

export async function getAsset(
  key: string
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const env = await getEnv()

  if (env?.R2_BUCKET) {
    const object = await env.R2_BUCKET.get(key)
    if (object) {
      const arrayBuffer = await object.arrayBuffer()
      return {
        data: new Uint8Array(arrayBuffer),
        contentType: object.httpMetadata?.contentType || getContentType(key)
      }
    }
  }

  if (env?.NAV_KV) {
    const base64 = await env.NAV_KV.get(ASSET_PREFIX + key, 'text')
    if (base64) {
      const binary = atob(base64)
      const data = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i)
      return { data, contentType: getContentType(key) }
    }
  }

  return null
}

export async function deleteAsset(key: string): Promise<void> {
  const env = await getEnv()
  if (env?.R2_BUCKET) {
    await env.R2_BUCKET.delete(key)
  }
  if (env?.NAV_KV) {
    await env.NAV_KV.delete(ASSET_PREFIX + key)
  }
}

export function getContentType(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'png': return 'image/png'
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'gif': return 'image/gif'
    case 'svg': return 'image/svg+xml'
    case 'ico': return 'image/x-icon'
    case 'webp': return 'image/webp'
    default: return 'image/png'
  }
}