import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAdminPassword, setAdminPassword } from '@/lib/kv'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!newPassword || newPassword.length < 3) {
      return NextResponse.json({ error: '新密码至少 3 个字符' }, { status: 400 })
    }

    const adminPassword = await getAdminPassword()
    if (currentPassword !== adminPassword) {
      return NextResponse.json({ error: '当前密码错误' }, { status: 401 })
    }

    await setAdminPassword(newPassword)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '修改密码失败' },
      { status: 500 }
    )
  }
}