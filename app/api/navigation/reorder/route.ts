import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getNavigation, saveNavigation } from '@/lib/kv'
import type { NavigationData } from '@/types/navigation'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { sourceIndex, destinationIndex } = await request.json()
    const data = await getNavigation()

    if (!data.navigationItems || !Array.isArray(data.navigationItems)) {
      throw new Error('无效的导航数据')
    }

    const updatedItems = [...data.navigationItems]
    const [movedItem] = updatedItems.splice(sourceIndex, 1)
    updatedItems.splice(destinationIndex, 0, movedItem)

    data.navigationItems = updatedItems
    await saveNavigation(data)

    return NextResponse.json(data.navigationItems, { status: 200 })
  } catch (error) {
    console.error('重新排序导航项错误:', error)
    return NextResponse.json(
      { error: '重新排序导航项失败', details: (error as Error).message },
      { status: 500 }
    )
  }
}
