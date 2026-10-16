import { NavigationContent } from '@/components/navigation-content'
import { Metadata } from 'next/types'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Container } from '@/components/ui/container'
import type { SiteConfig } from '@/types/site'
import type { NavigationData } from '@/types/navigation'
import { getNavigationCached, getSiteCached } from '@/lib/kv'
import navigationFallback from '@/navsphere/content/navigation.json'
import siteFallback from '@/navsphere/content/site.json'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

async function getData() {
  let navigationData = await getNavigationCached()
  if (!navigationData?.navigationItems || navigationData.navigationItems.length === 0) {
    navigationData = navigationFallback as NavigationData
  }
  const siteDataRaw: any = (await getSiteCached()) || siteFallback

  const siteData: SiteConfig = {
    ...siteDataRaw,
    search: siteDataRaw.search || siteFallback.search,
    appearance: {
      ...siteDataRaw.appearance,
      theme: (siteDataRaw.appearance.theme === 'light' ||
        siteDataRaw.appearance.theme === 'dark' ||
        siteDataRaw.appearance.theme === 'system')
        ? siteDataRaw.appearance.theme
        : 'system'
    },
    navigation: {
      linkTarget: (siteDataRaw.navigation?.linkTarget === '_blank' ||
        siteDataRaw.navigation?.linkTarget === '_self')
        ? siteDataRaw.navigation.linkTarget
        : '_blank'
    }
  }

  const filteredNavigationData = {
    navigationItems: navigationData.navigationItems
      .filter(category => (category as any).enabled !== false)
      .map(category => {
        const filteredSubCategories = category.subCategories
          ? (category.subCategories as any[])
              .filter(sub => sub.enabled !== false)
              .map(sub => ({
                ...sub,
                items: sub.items?.filter((item: any) => item.enabled !== false)
              }))
          : undefined

        return {
          ...category,
          items: category.items?.filter(item => item.enabled !== false),
          subCategories: filteredSubCategories
        }
      })
  }

  return {
    navigationData: filteredNavigationData || { navigationItems: [] },
    siteData: siteData || {
      basic: {
        title: 'NavSphere',
        description: '',
        keywords: ''
      },
      appearance: {
        logo: '',
        favicon: '',
        theme: 'system' as const
      },
      navigation: {
        linkTarget: '_blank' as const
      }
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { siteData } = await getData()

  return {
    title: siteData.basic.title,
    description: siteData.basic.description,
    keywords: siteData.basic.keywords,
    icons: {
      icon: siteData.appearance.favicon,
    },
  }
}

export default async function HomePage() {
  const { navigationData, siteData } = await getData()

  return (
    <Container>
      <NavigationContent navigationData={navigationData} siteData={siteData} />
      <ScrollToTop />
    </Container>
  )
}
