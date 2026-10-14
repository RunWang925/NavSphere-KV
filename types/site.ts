export interface SearchEngine {
  id: string
  name: string
  url: string
  icon?: string
  isSite?: boolean
}

export interface SiteConfig {
  basic: {
    title: string
    description: string
    keywords: string
  }
  appearance: {
    logo: string
    favicon: string
    theme: 'light' | 'dark' | 'system'
  }
  navigation: {
    linkTarget: '_blank' | '_self'
  }
  search?: {
    engines: SearchEngine[]
    defaultEngineId: string
  }
}

export interface SiteInfo {
  basic: {
    title: string
    description: string
    keywords: string
  }
  appearance: {
    logo: string
    favicon: string
    theme: string
  }
  navigation: {
    linkTarget: string
  }
  search?: {
    engines: SearchEngine[]
    defaultEngineId: string
  }
}