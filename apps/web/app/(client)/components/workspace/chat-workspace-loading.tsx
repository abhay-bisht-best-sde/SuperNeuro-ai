"use client"

export function ChatWorkspaceLoading() {
  return (
    <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">
          Loading conversation…
        </p>
      </div>
    </div>
  )
}
