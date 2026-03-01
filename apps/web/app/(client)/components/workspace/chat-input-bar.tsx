"use client"

import { forwardRef } from "react"

import { Send } from "lucide-react"

import { Button } from "@/(client)/components/ui/button"
import { Textarea } from "@/(client)/components/ui/textarea"

interface IProps {
  value: string
  placeholder?: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onSubmit: () => void
}

export const ChatInputBar = forwardRef<HTMLTextAreaElement, IProps>(
  function ChatInputBar(props, ref) {
    const {
      value,
      placeholder = "Type a message",
      onChange,
      onKeyDown,
      onSubmit,
    } = props

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e)
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.style.height = "0px"
        const sh = ref.current.scrollHeight
        ref.current.style.height = `${Math.min(sh, 160)}px`
      }
    }

    return (
      <div className="relative">
        <Textarea
          ref={ref}
          value={value}
        onChange={handleTextareaChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
        className="min-h-0 w-full resize-none rounded-2xl border-border bg-card px-4 py-3 pr-24 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
      />
      <div className="absolute right-2 bottom-2 flex items-center gap-1">
        <Button
          onClick={onSubmit}
          disabled={!value.trim()}
          size="sm"
          className="h-8 w-8 rounded-xl bg-primary p-0 text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  )
  }
)
