"use client"

import { useQueryClient } from "@tanstack/react-query"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/(client)/components/ui/dialog"
import { FileUploader } from "@/(client)/components/FileUploader"
import {
  useStoreFileMetadata,
  FETCH_KNOWLEDGE_BASE_KEYS,
} from "@/(client)/components/query-boundary"

interface IProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddKnowledgeBaseModal(props: IProps) {
  const { open, onOpenChange } = props

  const queryClient = useQueryClient()
  const storeFileMetadata = useStoreFileMetadata()

  const handleUploadComplete = async () => {
    await queryClient.invalidateQueries({ queryKey: FETCH_KNOWLEDGE_BASE_KEYS })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-fit">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add Knowledge Base
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-3">
          <FileUploader
            storeFileMetadata={(data) => storeFileMetadata.mutateAsync(data)}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
