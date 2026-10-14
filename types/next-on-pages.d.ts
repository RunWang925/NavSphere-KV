declare module '@cloudflare/next-on-pages' {
  export function getRequestContext(): {
    env: {
      NAV_KV?: any
      R2_BUCKET?: any
      ADMIN_PASSWORD?: string
      SESSION_SECRET?: string
      [key: string]: any
    }
  }
}
interface CacheQueryOptions {
  ignoreMethod?: boolean
  ignoreSearch?: boolean
  ignoreVary?: boolean
}

interface Cache {
  match(request: RequestInfo | URL, options?: CacheQueryOptions): Promise<Response | undefined>
  put(request: RequestInfo | URL, response: Response): Promise<void>
  delete(request: RequestInfo | URL, options?: CacheQueryOptions): Promise<boolean>
}

declare var caches: {
  readonly default: Cache
}