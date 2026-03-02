"use client"

import { useResourceViewerStore } from "./resource-viewer-store"
import { PdfViewerModal } from "@/(client)/components/modal/pdf-viewer-modal"
import { ImageViewerModal } from "@/(client)/components/modal/image-viewer-modal"

export function ResourceViewerModals() {
  const pdf = useResourceViewerStore((s) => s.pdf)
  const image = useResourceViewerStore((s) => s.image)
  const closePdfViewer = useResourceViewerStore((s) => s.closePdfViewer)
  const closeImageViewer = useResourceViewerStore((s) => s.closeImageViewer)

  return (
    <>
      <PdfViewerModal
        open={!!pdf}
        onOpenChange={(open) => !open && closePdfViewer()}
        r2Key={pdf?.r2Key ?? null}
        fileName={pdf?.fileName ?? ""}
        page={pdf?.page}
      />
      <ImageViewerModal
        open={!!image}
        onOpenChange={(open) => !open && closeImageViewer()}
        r2Key={image?.r2Key ?? null}
        fileName={image?.fileName ?? ""}
        alt={image?.alt}
      />
    </>
  )
}
