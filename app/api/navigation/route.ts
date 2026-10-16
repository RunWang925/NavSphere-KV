import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getNavigation, saveNavigation } from '@/lib/kv'
import type { NavigationData, NavigationItem } from '@/types/navigation'

export const runtime = 'edge'

export async function GET() {
  try {
    const data = await getNavigation()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch navigation data:', error)
    return NextResponse.json({ navigationItems: [] })
  }
}

async function validateAndSaveNavigationData(data: any) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid navigation data: not an object')
  }
  if (!('navigationItems' in data)) {
    throw new Error('Invalid navigation data: missing navigationItems')
  }
  if (!Array.isArray(data.navigationItems)) {
    throw new Error('Invalid navigation data: navigationItems must be an array')
  }
  const invalidItems = data.navigationItems.filter((item: NavigationItem) =>
    !item.id ||
    !item.title ||
    (item.items && !Array.isArray(item.items)) ||
    (item.subCategories && !Array.isArray(item.subCategories))
  )
  if (invalidItems.length > 0) {
    throw new Error('Invalid navigation data: some items are malformed')
  }
  await saveNavigation(data as NavigationData)
}

async function handleSave(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }
    const data = await request.json()
    await validateAndSaveNavigationData(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save navigation data:', error)
    return NextResponse.json(
      { error: 'Failed to save navigation data', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  return handleSave(request)
}

export async function PUT(request: Request) {
  return handleSave(request)
}