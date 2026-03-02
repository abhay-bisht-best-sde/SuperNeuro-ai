import { create } from "zustand"

export interface PdfViewerInfo {
  r2Key: string
  fileName: string
  page?: number
}

export interface ImageViewerInfo {
  r2Key: string
  fileName: string
  alt?: string
}

interface ResourceViewerState {
  pdf: PdfViewerInfo | null
  image: ImageViewerInfo | null
}

interface ResourceViewerStore extends ResourceViewerState {
  openPdfViewer: (info: PdfViewerInfo) => void
  openImageViewer: (info: ImageViewerInfo) => void
  closePdfViewer: () => void
  closeImageViewer: () => void
}

export const useResourceViewerStore = create<ResourceViewerStore>((set) => ({
  pdf: null,
  image: null,
  openPdfViewer: (info) =>
    set({ pdf: info, image: null }),
  openImageViewer: (info) =>
    set({ image: info, pdf: null }),
  closePdfViewer: () => set({ pdf: null }),
  closeImageViewer: () => set({ image: null }),
}))
