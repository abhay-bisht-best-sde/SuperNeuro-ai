"use client"

import { SignedIn, UserButton } from "@clerk/nextjs"
import { Settings } from "lucide-react"
import { Button } from "@/(client)/components/ui/button"

export function TopNavbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3" />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-primary/20">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Settings</span>
        </Button>
        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </SignedIn>
      </div>
    </header>
  )
}
