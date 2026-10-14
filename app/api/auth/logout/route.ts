import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export const runtime = 'edge'

export async function POST() {
  try {
    const session = await getSession()
    session.destroy()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '退出失败' }, { status: 500 })
  }
}