import { getAsset } from '@/lib/asset-storage'

export const runtime = 'edge'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const asset = await getAsset(id)
    if (!asset) {
      return new Response('Not Found', { status: 404 })
    }
    return new Response(asset.data as unknown as BodyInit, {
      headers: {
        'Content-Type': asset.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('Asset fetch error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}