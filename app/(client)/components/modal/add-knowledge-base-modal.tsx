"use client"

import { useState, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { Upload, Globe, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/(client)/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/(client)/components/ui/tabs"
import { Button } from "@/(client)/components/ui/button"
import { Input } from "@/(client)/components/ui/input"
import { Label } from "@/(client)/components/ui/label"
import { PipelineStatus } from "./pipeline-status"
import { cn } from "@/(client)/lib/utils"

type PipelineStage = "idle" | "chunking" | "indexing" | "completed"

interface AddKnowledgeBaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddKnowledgeBaseModal({
  open,
  onOpenChange,
}: AddKnowledgeBaseModalProps) {
  const [url, setUrl] = useState("")
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>("idle")
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState("")

  const simulatePipeline = useCallback(() => {
    setPipelineStage("chunking")
    setTimeout(() => setPipelineStage("indexing"), 1500)
    setTimeout(() => setPipelineStage("completed"), 3500)
    setTimeout(() => {
      setPipelineStage("idle")
      setUrl("")
      setFileName("")
      onOpenChange(false)
    }, 5000)
  }, [onOpenChange])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setFileName(file.name)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add Knowledge Base
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="website" className="mt-2">
          <TabsList className="w-full bg-secondary">
            <TabsTrigger value="website" className="flex-1 gap-2 text-xs">
              <Globe className="h-3.5 w-3.5" />
              Website URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1 gap-2 text-xs">
              <Upload className="h-3.5 w-3.5" />
              Upload Document
            </TabsTrigger>
          </TabsList>

          <TabsContent value="website" className="mt-4">
            <div className="flex flex-col gap-3">
              <Label
                htmlFor="website-url"
                className="text-xs text-muted-foreground"
              >
                Enter URL to crawl
              </Label>
              <Input
                id="website-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.example.com"
                className="bg-secondary border-border text-sm"
              />
              <Button
                onClick={simulatePipeline}
                disabled={!url.trim() || pipelineStage !== "idle"}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start Processing
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="flex flex-col gap-3">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"
                )}
              >
                <FileText className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="mb-1 text-sm text-foreground">
                  {fileName || "Drop files here"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOCX, TXT supported
                </p>
              </div>
              <Button
                onClick={simulatePipeline}
                disabled={!fileName || pipelineStage !== "idle"}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Upload & Process
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <AnimatePresence>
          {pipelineStage !== "idle" && (
            <PipelineStatus stage={pipelineStage} />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
