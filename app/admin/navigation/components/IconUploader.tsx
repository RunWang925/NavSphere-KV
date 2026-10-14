import { useFormContext } from "react-hook-form"
import { FormControl, FormItem, FormLabel, FormMessage, FormDescription } from "@/registry/new-york/ui/form"
import { Button } from "@/registry/new-york/ui/button"
import { Input } from "@/registry/new-york/ui/input"

interface IconUploaderProps {
  onChange: (icon: string) => void;
  value?: string;
}

export function IconUploader({ onChange, value }: IconUploaderProps) {
  const { setValue, getValues } = useFormContext()

  const fetchFavicon = async (url: string) => {
    console.log('Fetching favicon for URL:', url);
    if (!url) {
      console.error('URL 不能为空')
      return
    }
    try {
      const urlObj = new URL(url)
      const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`
      
      // 尝试获取网页内容
      const response = await fetch(url)
      const html = await response.text()

      // 使用正则表达式查找 favicon 链接
      const faviconMatch = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i)
      let faviconUrl = faviconMatch ? faviconMatch[1] : `${baseUrl}/favicon.ico`

      // 处理相对路径
      if (!faviconUrl.startsWith('http')) {
        faviconUrl = new URL(faviconUrl, baseUrl).href
      }

      // 检查 favicon 是否存在
      const faviconResponse = await fetch(faviconUrl, { method: 'HEAD' })
      if (!faviconResponse.ok) {
        throw new Error('未找到 favicon')
      }

      setValue('icon', faviconUrl)
    } catch (error) {
      console.error('获取网站图标失败:', error)
    }
  }

  const uploadIcon = async (file: File) => {
    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = async () => {
        const base64Content = reader.result as string

        const response = await fetch('/api/resource', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Content }),
        })

        const data = await response.json()
        if (data.success) {
          setValue('icon', data.imageUrl)
        } else {
          console.error('上传图标失败:', data.error)
        }
      }
    } catch (error) {
      console.error('上传图标失败:', error)
    }
  }

  return (
    <FormItem>
      <FormLabel>图标</FormLabel>
      <div className="flex space-x-2">
        <FormControl className="flex-1">
          <Input placeholder="输入图标URL" {...{ name: 'icon' }} />
        </FormControl>
        <Button 
          type="button"
          variant="outline"
          onClick={() => {
            const href = getValues('href');
            if (href) {
              fetchFavicon(href);
            } else {
              console.error('请提供有效的 URL');
            }
          }}
        >
          获取图标
        </Button>
        <div className="relative">
          <Input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                uploadIcon(file)
              }
            }}
          />
          <Button 
            type="button"
            variant="outline"
          >
            上传图标
          </Button>
        </div>
      </div>
      <FormDescription>
        支持 URL、Base64 格式或上传本地图片
      </FormDescription>
      <FormMessage />
    </FormItem>
  )
} 