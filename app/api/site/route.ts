import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSite, saveSite } from '@/lib/kv'
import type { SiteInfo } from '@/types/site'

export const runtime = 'edge'

export async function GET() {
  try {
    const data = await getSite()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to read site data:', error)
    return NextResponse.json({
      basic: { title: '', description: '', keywords: '' },
      appearance: { logo: '', favicon: '', theme: 'system' },
      navigation: { linkTarget: '_blank' }
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }
    const data: SiteInfo = await request.json()
    await saveSite(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save site data:', error)
    return NextResponse.json({ error: 'Failed to save site data' }, { status: 500 })
  }
}