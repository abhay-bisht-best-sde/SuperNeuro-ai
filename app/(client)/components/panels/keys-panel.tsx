"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/(client)/components/ui/button"
import { Input } from "@/(client)/components/ui/input"
import { Label } from "@/(client)/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/(client)/components/ui/select"

export function KeysPanel() {
  const [showKey, setShowKey] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState("gpt-4o")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col p-4"
    >
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        AI configuration
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Your OpenAI key is used for chat and agent generation. We never store
        your key on our servers.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="api-key" className="text-xs text-muted-foreground">
            OpenAI API Key
          </Label>
          <div className="relative">
            <Input
              id="api-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="pr-10 bg-secondary border-border text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">{showKey ? "Hide" : "Show"} API key</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="model" className="text-xs text-muted-foreground">
            Model
          </Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="model" className="bg-secondary border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              <SelectItem value="claude-3.5-sonnet">
                Claude 3.5 Sonnet
              </SelectItem>
              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSave}
          className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saved ? "Saved!" : "Save Configuration"}
        </Button>
      </div>
    </motion.div>
  )
}
