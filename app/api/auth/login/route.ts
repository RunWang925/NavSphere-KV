import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getAdminPassword } from '@/lib/kv'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const adminPassword = await getAdminPassword()

    if (password !== adminPassword) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 })
    }

    const session = await getSession()
    session.isLoggedIn = true
    session.user = { name: 'Admin', email: '', image: '' }
    await session.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}