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
