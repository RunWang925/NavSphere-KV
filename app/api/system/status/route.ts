import { NextResponse } from 'next/server'
import { getEnv } from '@/lib/kv'

export const runtime = 'edge'

export async function GET() {
  const env = await getEnv()
  return NextResponse.json({
    kvAvailable: !!env?.NAV_KV,
    r2Available: !!env?.R2_BUCKET
  })
}