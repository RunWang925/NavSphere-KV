'use client'

import * as React from 'react'
import { Search, LayoutGrid, X, ChevronDown, Check } from 'lucide-react'
import { Input } from "@/registry/new-york/ui/input"
import { Button } from "@/registry/new-york/ui/button"
import type { SearchEngine } from '@/types/site'

interface SearchBarProps {
  onSearch: (query: string, engine: SearchEngine) => void
  searchQuery: string
  engines: SearchEngine[]
  defaultEngineId: string
}

export function SearchBar({ onSearch, searchQuery, engines, defaultEngineId }: SearchBarProps) {
  const [inputValue, setInputValue] = React.useState(searchQuery)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [iconError, setIconError] = React.useState(false)

  const [selectedEngineId, setSelectedEngineId] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('search-engine-id')
      if (saved && engines.find(e => e.id === saved)) return saved
    }
    return defaultEngineId
  })

  const selectedEngine = engines.find(e => e.id === selectedEngineId) || engines[0]
  const siteEngine = engines.find(e => e.isSite)
  const complementEngine = selectedEngine?.isSite
    ? (engines.find(e => !e.isSite) || engines[0])
    : (siteEngine || engines[0])

  React.useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  React.useEffect(() => {
    if (typeof window !== 'undefined' && selectedEngineId) {
      localStorage.setItem('search-engine-id', selectedEngineId)
    }
  }, [selectedEngineId])

  const handleInputChange = (val: string) => {
    setInputValue(val)
    if (val === '' && siteEngine) {
      onSearch('', siteEngine)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        if (inputValue.trim() && complementEngine) {
          onSearch(inputValue, complementEngine)
        }
      } else {
        if (inputValue.trim() === '') {
          if (siteEngine) onSearch('', siteEngine)
        } else if (selectedEngine) {
          onSearch(inputValue, selectedEngine)
        }
      }
    }
  }

  const handleClear = () => {
    setInputValue('')
    if (siteEngine) onSearch('', siteEngine)
    inputRef.current?.focus()
  }

  const placeholder = `输入关键词，回车或点击右侧搜索（${selectedEngine?.name || ''}）· Ctrl+回车${complementEngine?.name || ''}`

  return (
    <div className="relative group/bar w-full flex items-center max-w-2xl mx-auto">
      {/* 引擎选择器 */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1.5 hover:bg-muted rounded-md"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {selectedEngine?.isSite ? (
            <LayoutGrid className="h-4 w-4 flex-shrink-0" />
          ) : selectedEngine?.icon && !iconError ? (
            <img
              src={selectedEngine.icon}
              alt=""
              className="h-4 w-4 rounded-sm flex-shrink-0"
              onError={() => setIconError(true)}
            />
          ) : (
            <Search className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="text-sm font-medium max-w-[50px] truncate">{selectedEngine?.name}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        </Button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute top-[calc(100%+4px)] left-0 z-50 bg-popover border border-border shadow-xl rounded-lg py-1 min-w-[160px]">
              {engines.map((engine) => (
                <button
                  key={engine.id}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                  onClick={() => {
                    setSelectedEngineId(engine.id)
                    setDropdownOpen(false)
                    setIconError(false)
                    inputRef.current?.focus()
                  }}
                >
                  {engine.isSite ? (
                    <LayoutGrid className="h-4 w-4 flex-shrink-0" />
                  ) : engine.icon ? (
                    <img
                      src={engine.icon}
                      alt=""
                      className="h-4 w-4 rounded-sm flex-shrink-0"
                    />
                  ) : (
                    <Search className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="flex-1">{engine.name}</span>
                  {engine.id === selectedEngineId && (
                    <Check className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="w-full pl-[100px] pr-20 h-10 bg-background border-border focus-visible:ring-1 rounded-lg transition-all text-sm"
      />

      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {inputValue && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground/30 hover:text-foreground"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted text-foreground hover:text-primary transition-colors"
          onClick={() => {
            if (selectedEngine && inputValue.trim()) {
              onSearch(inputValue, selectedEngine)
            }
          }}
          title="搜索"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}