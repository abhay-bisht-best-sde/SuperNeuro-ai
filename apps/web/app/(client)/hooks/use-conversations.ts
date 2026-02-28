"use client"

import { useState, useCallback } from "react";

import type { Conversation, Message } from "../libs/store";

const PLACEHOLDER_RESPONSE =
  "Chat API integration pending. Connect your LLM backend to enable responses.";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [isTyping, setIsTyping] = useState(false);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? null;

  const simulateResponse = useCallback((convId: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const assistantMsg: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: PLACEHOLDER_RESPONSE,
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c
        )
      );
      setIsTyping(false);
    }, 2000);
  }, []);

  const handleNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: "New Conversation",
      timestamp: new Date(),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
  }, []);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    },
    [activeConversationId]
  );

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!activeConversationId) {
        const newConv: Conversation = {
          id: `conv-${Date.now()}`,
          title: content.slice(0, 40) + (content.length > 40 ? "..." : ""),
          timestamp: new Date(),
          messages: [],
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(newConv.id);

        setTimeout(() => {
          const userMsg: Message = {
            id: `msg-${Date.now()}`,
            role: "user",
            content,
            timestamp: new Date(),
          };
          setConversations((prev) =>
            prev.map((c) =>
              c.id === newConv.id
                ? { ...c, messages: [...c.messages, userMsg] }
                : c
            )
          );
          simulateResponse(newConv.id);
        }, 50);
        return;
      }

      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: [...c.messages, userMsg] }
            : c
        )
      );

      simulateResponse(activeConversationId);
    },
    [activeConversationId, simulateResponse]
  );

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    isTyping,
    handleNewConversation,
    handleDeleteConversation,
    handleSendMessage,
  }
}
