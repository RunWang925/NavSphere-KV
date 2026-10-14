import { NextResponse } from 'next/server'
import { getNavigation } from '@/lib/kv'
import { NavigationCategory } from '@/types/navigation'
export const runtime = 'edge'

export async function GET() {
  try {
    const navigationData = await getNavigation()
    const navigationItems = navigationData.navigationItems || []
    const parentCategories = navigationItems.length
    const subCategories = navigationItems.reduce((total: number, category: any) => {
      return total + (category.subCategories?.length || 0)
    }, 0)
    const totalCategories = parentCategories + subCategories
    const totalSites = navigationItems.reduce((total: number, category: any) => {
      const parentSites = category.items?.length || 0
      const subCategoriesSites = Array.isArray(category.subCategories)
        ? (category.subCategories as NavigationCategory[]).reduce((sum, subCategory) => {
            return sum + (subCategory.items?.length || 0);
          }, 0)
        : 0;
      return total + parentSites + subCategoriesSites
    }, 0)
    return NextResponse.json({ parentCategories, subCategories, totalCategories, totalSites })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}