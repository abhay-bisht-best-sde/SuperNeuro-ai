"use client"

import { withChatWorkspaceState } from "./with-chat-workspace-state"

import type { ChatWorkspaceProps } from "./chat-workspace-types"

export const ChatWorkspace = withChatWorkspaceState<ChatWorkspaceProps>()
