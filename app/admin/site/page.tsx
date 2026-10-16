'use client'

export const runtime = 'edge'

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york/ui/card"
import { Input } from "@/registry/new-york/ui/input"
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/new-york/ui/tabs"
import { Icons } from "@/components/icons"
import { Textarea } from "@/registry/new-york/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/new-york/ui/select"
import { Label } from "@/registry/new-york/ui/label"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york/ui/form"
import { SiteConfigService} from "@/services/siteConfigService"
import type { SiteConfig, SearchEngine } from "@/types/site"
import { Toaster } from "@/registry/new-york/ui/toaster"
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { GripVertical, Lock } from 'lucide-react'

const formSchema = z.object({
  basic: z.object({
    title: z.string().min(2, {
      message: "标题至少需要2个字符.",
    }),
    description: z.string().min(10, {
      message: "描述至少需要10个字符.",
    }),
    keywords: z.string(),
  }),
  appearance: z.object({
    logo: z.string().regex(/^(https?:\/\/|\/)\S+$/i, {
      message: "请输入有效的URL地址或相对路径",
    }),
    favicon: z.string().regex(/^(https?:\/\/|\/)\S+$/i, {
      message: "请输入有效的URL地址或相对路径",
    }),
    theme: z.enum(['light', 'dark', 'system']),
  }),
  navigation: z.object({
    linkTarget: z.enum(['_blank', '_self']),
  }),
})

export default function SiteSettings() {
  const { toast } = useToast()
  const [searchEngines, setSearchEngines] = useState<SearchEngine[]>([])
  const [defaultEngineId, setDefaultEngineId] = useState('baidu')
  const [savingSearch, setSavingSearch] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      basic: {
        title: "",
        description: "",
        keywords: "",
      },
      appearance: {
        logo: "",
        favicon: "",
        theme: "system",
      },
      navigation: {
        linkTarget: "_blank",
      },
    },
  })

  useEffect(() => {
    const loadConfig = async () => {
      const siteConfigService = new SiteConfigService();
      const config = await siteConfigService.getSiteConfig();
      if (config) {
        form.reset(config);
        let engines = config.search?.engines || []
        if (engines.length === 0 || !engines.some(e => e.isSite)) {
          engines = [{ id: 'site', name: '站内', url: '', isSite: true, icon: config.appearance?.favicon || '' }]
        }
        let defaultId = config.search?.defaultEngineId
        if (!defaultId || !engines.some(e => e.id === defaultId)) {
          defaultId = engines.find(e => e.isSite)?.id || engines[0]?.id || ''
        }
        setSearchEngines(engines);
        setDefaultEngineId(defaultId);
      }
    }
    loadConfig()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const siteConfigService = new SiteConfigService();
      await siteConfigService.updateSiteConfig({
        ...values,
        search: { engines: searchEngines, defaultEngineId }
      });
      toast({
        title: "成功",
        description: "站点信息已保存",
      });
    } catch (error) {
      toast({
        title: "错误",
        description: "保存失败",
        variant: "destructive",
      });
    }
  }

  async function saveSearchConfig() {
    try {
      setSavingSearch(true)
      const safeEngines = searchEngines.length > 0
        ? searchEngines
        : [{ id: 'site', name: '站内', url: '', isSite: true } as SearchEngine]
      const safeDefaultId = safeEngines.some(e => e.id === defaultEngineId)
        ? defaultEngineId
        : (safeEngines.find(e => e.isSite)?.id || safeEngines[0]?.id || '')
      setSearchEngines(safeEngines)
      setDefaultEngineId(safeDefaultId)
      const siteConfigService = new SiteConfigService();
      const currentConfig = await siteConfigService.getSiteConfig();
      await siteConfigService.updateSiteConfig({
        ...currentConfig,
        search: { engines: safeEngines, defaultEngineId: safeDefaultId }
      });
      toast({ title: "成功", description: "搜索设置已保存" });
    } catch {
      toast({ title: "错误", description: "保存失败", variant: "destructive" });
    } finally {
      setSavingSearch(false)
    }
  }

  function addEngine() {
    setSearchEngines([...searchEngines, {
      id: `custom-${Date.now()}`,
      name: '新引擎',
      url: 'https://',
      icon: ''
    }]);
  }

  function deleteEngine(id: string) {
    const remaining = searchEngines.filter(e => e.id !== id)
    setSearchEngines(remaining)
    if (defaultEngineId === id) {
      const next = remaining[0]?.id || ''
      setDefaultEngineId(next)
    }
  }

  function updateEngine(id: string, field: keyof SearchEngine, value: string) {
    setSearchEngines(searchEngines.map(e => e.id === id ? { ...e, [field]: value } : e));
  }

  function onEngineDragEnd(result: DropResult) {
    if (!result.destination) return
    const items = Array.from(searchEngines)
    const [removed] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, removed)
    setSearchEngines(items)
    if (defaultEngineId === removed.id) {
      setDefaultEngineId(removed.id)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="appearance">外观设置</TabsTrigger>
            <TabsTrigger value="navigation">导航设置</TabsTrigger>
            <TabsTrigger value="search">搜索设置</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="basic.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>网站标题</FormLabel>
                          <FormControl>
                            <Input placeholder="输入网站标题" {...field} />
                          </FormControl>
                          <FormDescription>
                            这将显示在浏览器标签页和搜索结果中
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="basic.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>网站描述</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="输入网站描述"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            这将显示在搜索结果中
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="basic.keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>关键词</FormLabel>
                          <FormControl>
                            <Input placeholder="输入关键词，用英文逗号分隔" {...field} />
                          </FormControl>
                          <FormDescription>
                            用于搜索引擎优化，多个关键词请用英文逗号分隔
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-start">
                      <Button 
                        type="submit"
                        className="w-[120px]"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            保存中
                          </>
                        ) : (
                          <>
                            <Icons.save className="mr-2 h-4 w-4" />
                            保存更改
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>外观设置</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="appearance.logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="输入Logo图片URL" {...field} />
                          </FormControl>
                          <FormDescription>
                            建议尺寸: 160x64px
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="appearance.favicon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Favicon URL</FormLabel>
                          <FormControl>
                            <Input placeholder="输入网站图标URL" {...field} />
                          </FormControl>
                          <FormDescription>
                            建议尺寸: 32x32px
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-start">
                      <Button 
                        type="submit"
                        className="w-[120px]"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            保存中
                          </>
                        ) : (
                          <>
                            <Icons.save className="mr-2 h-4 w-4" />
                            保存更改
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="navigation">
            <Card>
              <CardHeader>
                <CardTitle>导航设置</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="navigation.linkTarget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>链接打开方式</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择链接打开方式" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="_blank">新窗口打开 (_blank)</SelectItem>
                              <SelectItem value="_self">当前窗口打开 (_self)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            设置首页中点击网站链接时的打开方式，默认为新窗口打开
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-start">
                      <Button 
                        type="submit"
                        className="w-[120px]"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            保存中
                          </>
                        ) : (
                          <>
                            <Icons.save className="mr-2 h-4 w-4" />
                            保存更改
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>搜索设置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>默认搜索引擎（回车触发）</Label>
                    <Select value={defaultEngineId} onValueChange={setDefaultEngineId}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择默认搜索引擎" />
                      </SelectTrigger>
                      <SelectContent>
                        {searchEngines.map(engine => (
                          <SelectItem key={engine.id} value={engine.id}>{engine.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      回车使用此引擎搜索，Ctrl+回车自动使用互补引擎（站内↔搜索引擎）
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>搜索引擎列表（拖动排序）</Label>
                      <Button variant="outline" size="sm" onClick={addEngine}>+ 添加</Button>
                    </div>
                    {searchEngines.length === 0 ? (
                      <div className="border rounded-lg p-6 text-center text-sm text-muted-foreground">
                        暂无搜索引擎，至少需要保留「站内」搜索
                      </div>
                    ) : (
                      <DragDropContext onDragEnd={onEngineDragEnd}>
                        <Droppable droppableId="search-engines">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                              {searchEngines.map((engine, index) => (
                                <Draggable key={engine.id} draggableId={engine.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="border rounded-lg p-3 bg-background"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <button
                                            {...provided.dragHandleProps}
                                            className="cursor-grab text-muted-foreground hover:text-foreground transition-colors"
                                            title="拖动排序"
                                          >
                                            <GripVertical className="h-4 w-4" />
                                          </button>
                                          <span className="text-sm font-medium">{engine.name}</span>
                                        </div>
                                        {engine.isSite ? (
                                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Lock className="h-3 w-3" /> 站内搜索（不可删除）
                                          </span>
                                        ) : (
                                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteEngine(engine.id)}>删除</Button>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <Input
                                          value={engine.name}
                                          placeholder="名称"
                                          disabled={engine.isSite}
                                          onChange={(e) => updateEngine(engine.id, 'name', e.target.value)}
                                        />
                                        {engine.isSite ? (
                                          <Input value="站内搜索" placeholder="" disabled className="text-muted-foreground" />
                                        ) : (
                                          <Input
                                            value={engine.url}
                                            placeholder="搜索URL（用 {q} 占位）"
                                            onChange={(e) => updateEngine(engine.id, 'url', e.target.value)}
                                          />
                                        )}
                                        <Input
                                          value={engine.icon || ''}
                                          placeholder={engine.isSite ? "站点图标URL（推荐用 favicon.im）" : "图标URL（可选）"}
                                          onChange={(e) => updateEngine(engine.id, 'icon', e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}
                  </div>

                  <div className="flex justify-start">
                    <Button onClick={saveSearchConfig} disabled={savingSearch} className="w-[120px]">
                      {savingSearch ? "保存中" : "保存设置"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </>
  )
}