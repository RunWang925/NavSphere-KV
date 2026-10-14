import type { SiteConfig } from '@/types/site'

export const siteConfig: SiteConfig = {
  basic: {
    title: 'NavSphere',
    description: 'A modern navigation platform',
    keywords: 'navigation, platform, web, management'
  },
  appearance: {
    logo: '/logo.webp',
    favicon: '/favicon.webp',
    theme: 'system'
  },
  navigation: {
    linkTarget: '_blank'
  },
  search: {
    engines: [
      { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd={q}', icon: 'https://favicon.im/www.baidu.com?larger=true' },
      { id: 'google', name: 'Google', url: 'https://www.google.com/search?q={q}', icon: 'https://favicon.im/www.google.com?larger=true' },
      { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q={q}', icon: 'https://favicon.im/www.bing.com?larger=true' },
      { id: 'site', name: '站内', url: '', isSite: true }
    ],
    defaultEngineId: 'baidu'
  }
}

export function getSiteConfig(): SiteConfig {
  return siteConfig
}
