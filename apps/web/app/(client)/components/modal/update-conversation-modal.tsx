"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/(client)/components/ui/dialog"
import { Button } from "@/(client)/components/ui/button"
import { Input } from "@/(client)/components/ui/input"
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/(client)/components/ui/form"
import { useUpdateConversation } from "@/(client)/components/query-boundary"

const updateConversationSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
})

type UpdateConversationFormData = z.infer<typeof updateConversationSchema>

interface IProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string | null
  currentTitle: string
}

export function UpdateConversationModal(props: IProps) {
  const { open, onOpenChange, conversationId, currentTitle } = props

  const form = useForm<UpdateConversationFormData>({
    resolver: zodResolver(updateConversationSchema),
    defaultValues: { title: currentTitle },
  })

  const updateConversation = useUpdateConversation()

  useEffect(() => {
    if (open) {
      form.reset({ title: currentTitle })
    }
  }, [open, currentTitle, form])

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!conversationId) return
    try {
      await updateConversation.mutateAsync({
        id: conversationId,
        title: values.title.trim(),
      })
      onOpenChange(false)
    } catch {
      // Error handled by mutation
    }
  })

  const handleOpenChange = (next: boolean) => {
    if (!updateConversation.isPending) {
      onOpenChange(next)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Rename conversation
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Conversation title"
                      className="border-border"
                      disabled={updateConversation.isPending}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={updateConversation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateConversation.isPending}
                loading={updateConversation.isPending}
              >
                {updateConversation.isPending ? null : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
