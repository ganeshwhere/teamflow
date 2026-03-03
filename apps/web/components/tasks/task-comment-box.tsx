"use client";

import { Paperclip, SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TaskCommentBox() {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <Textarea
        placeholder="Leave a comment..."
        className="min-h-[110px] resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground">
          <Paperclip className="h-4 w-4" />
        </Button>
        <button
          type="button"
          aria-label="Send comment"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-popover text-foreground transition-colors hover:bg-accent"
        >
          <SendHorizontal className="h-4 w-4 translate-x-[0.5px]" />
        </button>
      </div>
    </div>
  );
}
