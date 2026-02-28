export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  knowledgeBases: string[];
}

export type SidebarSection = "conversations" | "agents" | "knowledge";
