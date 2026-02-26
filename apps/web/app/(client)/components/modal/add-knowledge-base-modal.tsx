"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/(client)/components/ui/dialog"
import { FileUploader } from "@/(client)/components/FileUploader"
import { useStoreFileMetadata } from "@/(client)/components/query-boundary"

interface AddKnowledgeBaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddKnowledgeBaseModal({
  open,
  onOpenChange,
}: AddKnowledgeBaseModalProps) {
  const storeFileMetadata = useStoreFileMetadata()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-fit">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add Knowledge Base
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-3">
          <FileUploader
            storeFileMetadata={(data) => storeFileMetadata.mutateAsync(data)}
            onUploadComplete={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
