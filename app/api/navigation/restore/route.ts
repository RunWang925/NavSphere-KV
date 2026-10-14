import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { restoreNavigation, getDefaultNavigation } from '@/lib/kv'

export const runtime = 'edge'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const defaultData = getDefaultNavigation()
    if (!defaultData || !defaultData.navigationItems) {
      return NextResponse.json(
        { error: 'Invalid default data format', details: 'navigation-default.json does not contain valid navigation data' },
        { status: 400 }
      )
    }

    const restored = await restoreNavigation()
    return NextResponse.json(restored)
  } catch (error) {
    console.error('Failed to restore navigation data:', error)
    return NextResponse.json(
      { error: 'Failed to restore navigation data', details: (error as Error).message },
      { status: 500 }
    )
  }
}