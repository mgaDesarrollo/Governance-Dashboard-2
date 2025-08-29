"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Unlink,
  Palette,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  RotateCw
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const colors = [
  { name: 'Default', value: '#ffffff' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' }
]

export function RichTextEditor({ value, onChange, placeholder = "Start writing...", className = "" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    updateValue()
  }

  const updateValue = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHTML = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">${linkText}</a>`
      document.execCommand('insertHTML', false, linkHTML)
      setShowLinkDialog(false)
      setLinkUrl('')
      setLinkText('')
      editorRef.current?.focus()
      updateValue()
    }
  }

  const clearFormatting = () => {
    document.execCommand('removeFormat', false)
    editorRef.current?.focus()
    updateValue()
  }

  const undo = () => {
    document.execCommand('undo', false)
    editorRef.current?.focus()
    updateValue()
  }

  const redo = () => {
    document.execCommand('redo', false)
    editorRef.current?.focus()
    updateValue()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    updateValue()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      document.execCommand('insertLineBreak', false)
      updateValue()
    }
  }

  const applyTextColor = (color: string) => {
    document.execCommand('foreColor', false, color)
    editorRef.current?.focus()
    updateValue()
  }

  return (
    <div className={`border border-slate-600 rounded-none bg-black overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-slate-600 bg-black p-3 flex flex-wrap gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Undo"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Redo"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 bg-slate-600" />

        {/* Headings */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('formatBlock', '<h1>')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('formatBlock', '<h2>')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('formatBlock', '<h3>')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 bg-slate-600" />

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('bold')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('italic')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('underline')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('strikeThrough')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 bg-slate-600" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertUnorderedList')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertOrderedList')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 bg-slate-600" />

        {/* Block Elements */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('formatBlock', '<blockquote>')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('formatBlock', '<pre>')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 bg-slate-600" />

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyLeft')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyCenter')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyRight')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 bg-slate-600" />

        {/* Links */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkDialog(true)}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Insert Link"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('unlink')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Remove Link"
          >
            <Unlink className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 bg-slate-600" />

        {/* Colors */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </Button>
          {showColorPicker && (
            <div className="absolute top-full left-0 z-50 mt-1 p-2 bg-slate-700 border border-slate-600 rounded-lg shadow-lg min-w-[200px]">
              <div className="mb-2">
                <span className="text-xs text-slate-300 font-medium">Select Color:</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      applyTextColor(color.value)
                      setShowColorPicker(false)
                    }}
                    className="w-10 h-10 rounded-lg border-2 border-slate-500 hover:border-white hover:scale-110 transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-slate-600">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value="#ffffff"
                    onChange={(e) => {
                      applyTextColor(e.target.value)
                      setShowColorPicker(false)
                    }}
                    className="w-8 h-8 rounded border border-slate-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-300">Custom color</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator orientation="vertical" className="h-6 bg-slate-600" />

        {/* Clear Formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFormatting}
          className="h-8 px-3 text-slate-300 hover:text-white hover:bg-slate-700 text-xs"
          title="Clear Formatting"
        >
          Clear
        </Button>
      </div>

      {/* Editor Area */}
      <div className="p-4">
        <div
          ref={editorRef}
          contentEditable
          onInput={updateValue}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[300px] bg-black text-slate-100 focus:outline-none resize-y font-mac text-sm leading-relaxed"
          style={{ 
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
          }}
          data-placeholder={placeholder}
        />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black border border-slate-600 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm">Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text..."
                  className="mt-1 w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={insertLink} className="bg-purple-600 hover:bg-purple-700">
                  Insert Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowLinkDialog(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for placeholder */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #64748b;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

