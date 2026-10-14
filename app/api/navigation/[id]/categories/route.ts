import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getNavigation, saveNavigation } from '@/lib/kv'
import type { NavigationData } from '@/types/navigation'

export const runtime = 'edge'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }
    const { categoryId } = await request.json()
    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }
    const data = await getNavigation()
    const navigation = data.navigationItems.find(nav => nav.id === id)
    if (!navigation) {
      return NextResponse.json({ error: 'Navigation not found' }, { status: 404 })
    }
    const categoryExists = navigation.subCategories?.some(cat => cat.id === categoryId)
    if (!categoryExists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    const updatedSubCategories = navigation.subCategories?.filter(cat => cat.id !== categoryId) || []
    const updatedNavigations = data.navigationItems.map(nav => {
      if (nav.id === id) {
        return { ...nav, subCategories: updatedSubCategories }
      }
      return nav
    })
    await saveNavigation({ navigationItems: updatedNavigations } as NavigationData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}