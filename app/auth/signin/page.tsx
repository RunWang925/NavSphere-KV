'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, Suspense } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function SignInContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams?.get('callbackUrl') || '/admin'
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError('')
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || '登录失败')
        setIsLoading(false)
        return
      }
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      setError('登录失败，请重试')
      setIsLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 overflow-hidden rounded-md">
              <img
                src="/assets/images/alogo.webp"
                alt="Logo"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-none tracking-tight text-white">
                NavSphere
              </span>
            </div>
          </div>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;这是一个专为程序员设计的导航网站，集成了常用的开发工具、学习资源和技术社区。&rdquo;
            </p>
            <footer className="text-sm">NavSphere Team</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex h-full w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                登录管理后台
              </CardTitle>
              <CardDescription className="text-center">
                请输入管理密码以访问后台
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignIn}>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">管理密码</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading || !password}>
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </CardContent>
            </form>
            <CardFooter className="flex flex-wrap items-center justify-center gap-2">
              <div className="text-sm text-muted-foreground">
                通过登录，即表示您同意我们的{" "}
                <a
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  服务条款
                </a>{" "}
                和{" "}
                <a
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  隐私政策
                </a>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}