"use client"

import { useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { PanelLeftClose, PanelLeft } from "lucide-react"
import { IconSidebar } from "@/components/icon-sidebar"
import { SecondarySidebar } from "@/components/secondary-sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { ChatWorkspace } from "@/components/chat-workspace"
import { AddKnowledgeBaseModal } from "@/components/add-knowledge-base-modal"
import type { SidebarSection, Conversation, Message } from "@/lib/store"
import {
  sampleConversations,
  sampleAgents,
  sampleKnowledgeBases,
} from "@/lib/store"

export function Dashboard() {
  const [activeSection, setActiveSection] =
    useState<SidebarSection>("conversations")
  const [conversations, setConversations] =
    useState<Conversation[]>(sampleConversations)
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >("1")
  const [isTyping, setIsTyping] = useState(false)
  const [kbModalOpen, setKbModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? null

  const handleNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: "New Conversation",
      timestamp: new Date(),
      messages: [],
    }
    setConversations((prev) => [newConv, ...prev])
    setActiveConversationId(newConv.id)
  }, [])

  const handleDeleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeConversationId === id) {
        setActiveConversationId(null)
      }
    },
    [activeConversationId]
  )

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!activeConversationId) {
        const newConv: Conversation = {
          id: `conv-${Date.now()}`,
          title: content.slice(0, 40) + (content.length > 40 ? "..." : ""),
          timestamp: new Date(),
          messages: [],
        }
        setConversations((prev) => [newConv, ...prev])
        setActiveConversationId(newConv.id)

        setTimeout(() => {
          const userMsg: Message = {
            id: `msg-${Date.now()}`,
            role: "user",
            content,
            timestamp: new Date(),
          }
          setConversations((prev) =>
            prev.map((c) =>
              c.id === newConv.id
                ? { ...c, messages: [...c.messages, userMsg] }
                : c
            )
          )
          simulateResponse(newConv.id)
        }, 50)
        return
      }

      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: [...c.messages, userMsg] }
            : c
        )
      )

      simulateResponse(activeConversationId)
    },
    [activeConversationId]
  )

  const simulateResponse = (convId: string) => {
    setIsTyping(true)
    setTimeout(() => {
      const assistantMsg: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content:
          "Thank you for your question! I'd be happy to help you with that. Let me provide a detailed response based on my knowledge.\n\nHere are the key points to consider:\n\n1. **Understanding the fundamentals** - It's important to have a solid foundation before diving into advanced topics.\n\n2. **Practice consistently** - Regular practice helps reinforce learning and build muscle memory.\n\n3. **Stay updated** - The field is constantly evolving, so keeping up with the latest developments is crucial.",
        timestamp: new Date(),
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c
        )
      )
      setIsTyping(false)
    }, 2000)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <IconSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNavbar />

        <div className="relative flex flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 288, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <SecondarySidebar
                  activeSection={activeSection}
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={setActiveConversationId}
                  onNewConversation={handleNewConversation}
                  onDeleteConversation={handleDeleteConversation}
                  agents={sampleAgents}
                  knowledgeBases={sampleKnowledgeBases}
                  onAddKnowledgeBase={() => setKbModalOpen(true)}
                  onRetryKnowledgeBase={(id) => {
                    console.log("Retrying KB:", id)
                  }}
                  isOpen={true}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/80 backdrop-blur transition-colors hover:bg-secondary"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
              ) : (
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">Toggle sidebar</span>
            </button>

            <ChatWorkspace
              conversation={activeConversation}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
            />
          </div>
        </div>
      </div>

      <AddKnowledgeBaseModal
        open={kbModalOpen}
        onOpenChange={setKbModalOpen}
      />
    </div>
  )
}
