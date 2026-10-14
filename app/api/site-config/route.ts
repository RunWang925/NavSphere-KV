import { NextResponse } from 'next/server'
import type { SiteConfig } from '@/types/site'
export const runtime = 'edge'

const defaultConfig: SiteConfig = {
  basic: {
    title: 'NavSphere',
    description: 'A modern navigation platform',
    keywords: 'navigation, platform, web, management'
  },
  appearance: {
    logo: '/logo.png',
    favicon: '/favicon.ico',
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

export async function GET() {
  try {
    // TODO: 从数据库或文件系统获取配置
    // 现在先返回默认配置
    return NextResponse.json(defaultConfig)
  } catch (error) {
    console.error('Error fetching site config:', error)
    return NextResponse.json(defaultConfig)
  }
}
