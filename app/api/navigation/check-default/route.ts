import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDefaultNavigation } from '@/lib/kv'

export const runtime = 'edge'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const defaultData = getDefaultNavigation()
    const isValid = defaultData &&
      typeof defaultData === 'object' &&
      Array.isArray(defaultData.navigationItems)

    return NextResponse.json({
      exists: true,
      valid: isValid,
      itemCount: isValid ? defaultData.navigationItems.length : 0
    })
  } catch (error) {
    console.error('Failed to check default file:', error)
    return NextResponse.json(
      { error: 'Failed to check default file', details: (error as Error).message },
      { status: 500 }
    )
  }
}