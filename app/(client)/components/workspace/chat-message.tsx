"use client"

import { motion } from "framer-motion"
import { Copy, ThumbsUp, Volume2, RefreshCcw, Sparkles } from "lucide-react"
import { Button } from "@/(client)/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/(client)/components/ui/avatar"
import { cn } from "@/(client)/lib/utils"
import type { Message } from "@/(client)/lib/store"

interface ChatMessageProps {
  message: Message
  index: number
}

export function ChatMessage({ message, index }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {isUser ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face"
            alt="User avatar"
          />
          <AvatarFallback className="bg-accent text-xs text-accent-foreground">
            JD
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className={cn("max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
              : "bg-card border border-border text-foreground"
          )}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        </div>

        {!isUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 flex items-center gap-1"
          >
            <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-lg hover:bg-primary/20">
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="sr-only">Copy</span>
            </Button>
            <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-lg hover:bg-primary/20">
              <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="sr-only">Like</span>
            </Button>
            <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-lg hover:bg-primary/20">
              <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="sr-only">Read aloud</span>
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-lg hover:bg-primary/20">
              <RefreshCcw className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="sr-only">Regenerate</span>
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
