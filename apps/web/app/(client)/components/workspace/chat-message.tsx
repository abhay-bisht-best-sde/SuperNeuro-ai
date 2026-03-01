"use client"

import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Sparkles } from "lucide-react"

import { cn } from "@/(client)/libs/utils"

import type { Message } from "@repo/database"

function UserAvatar() {
  return (
    <div
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.38 0.06 295), oklch(0.42 0.05 285))",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10 text-primary-foreground"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  )
}

function AIAvatar() {
  return (
    <div
      className="animate-avatar-glow-ai relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.65 0.25 295), oklch(0.60 0.15 250))",
      }}
    >
      <div
        className="absolute inset-0 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.2), transparent 60%)",
        }}
      />
      <Sparkles className="relative z-10 h-4 w-4 text-primary-foreground" />
    </div>
  )
}

function formatMessageTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
  const day = d.toLocaleDateString("en-US", { weekday: "short" })
  const dateStr = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  return `${time} • ${day} • ${dateStr}`
}

interface IProps {
  message: Pick<Message, "id" | "role" | "content" | "createdAt">
  index: number
  isLatest?: boolean
  shouldAnimate?: boolean
}

export function ChatMessage(props: IProps) {
  const { message, index, isLatest = false, shouldAnimate = true } = props

  const isUser =
    message.role === "USER" ||
    String(message.role).toUpperCase() === "USER"

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: shouldAnimate ? (isLatest ? 0 : index * 0.08) : 0,
        duration: shouldAnimate ? 0.3 : 0,
      }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {isUser ? <UserAvatar /> : <AIAvatar />}

      <div
        className={cn(
          "flex max-w-[92%] flex-col",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "w-fit max-w-lg rounded-2xl px-4 py-3",
            isUser
              ? "text-primary-foreground"
              : "border border-white/10 text-primary-foreground"
          )}
          style={
            !isUser
              ? {
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.25 295), oklch(0.60 0.15 250))",
                }
              : {
                  background:
                    "linear-gradient(135deg, oklch(0.38 0.06 295), oklch(0.42 0.05 285))",
                }
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </p>
          ) : (
            <div
              className={cn(
                "markdown-content text-sm leading-relaxed",
                "[&_p]:mb-2 [&_p:last-child]:mb-0",
                "[&_ul]:my-2 [&_ol]:my-2 [&_li]:ml-4",
                "[&_pre]:rounded-lg [&_pre]:bg-muted/50 [&_pre]:p-3",
                "[&_code]:rounded [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:py-0.5",
                "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
                "[&_a]:text-primary-foreground [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-primary-foreground/50 hover:[&_a]:decoration-primary-foreground",
                "[&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-white/20 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:border-white/20 [&_td]:px-3 [&_td]:py-2"
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {message.createdAt && (
          <p
            className={cn(
              "mt-1.5 text-xs text-muted-foreground",
              isUser
                ? "text-right"
                : "text-left"
            )}
          >
            {formatMessageTime(message.createdAt)}
          </p>
        )}
      </div>
    </motion.div>
  )
}
