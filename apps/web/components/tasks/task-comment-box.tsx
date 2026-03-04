"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowUp, AtSign, Loader2, Paperclip } from "lucide-react";
import type { ProjectChatMessage, UserSummary } from "@repo/types";

import { createProjectChatMessage } from "@/actions/chat.actions";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";

type MentionContext = {
  start: number;
  end: number;
  query: string;
};

type MentionOption = {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  handle: string;
  searchableHandles: string[];
};

function getEmailHandle(email?: string | null): string | null {
  const value = email?.split("@")[0]?.trim().toLowerCase();
  return value && value.length > 1 ? value : null;
}

function getNameHandle(name?: string | null): string | null {
  const value = name?.trim().toLowerCase().replace(/\s+/g, ".");
  return value && value.length > 1 ? value : null;
}

function buildMentionOption(user: UserSummary): MentionOption {
  const emailHandle = getEmailHandle(user.email);
  const nameHandle = getNameHandle(user.name);
  const handle = emailHandle ?? nameHandle ?? `user.${user.id.slice(0, 6).toLowerCase()}`;

  const searchableHandles = Array.from(
    new Set(
      [
        handle,
        emailHandle,
        nameHandle,
        user.name?.trim().toLowerCase().replace(/\s+/g, ""),
        user.name?.trim().toLowerCase().split(/\s+/)[0],
      ].filter((value): value is string => Boolean(value)),
    ),
  );

  return {
    userId: user.id,
    name: user.name ?? user.email,
    email: user.email,
    avatarUrl: user.avatarUrl,
    handle,
    searchableHandles,
  };
}

function extractMentionContext(content: string, cursor: number): MentionContext | null {
  const before = content.slice(0, cursor);
  const atIndex = before.lastIndexOf("@");

  if (atIndex < 0) {
    return null;
  }

  if (atIndex > 0 && !/\s/.test(before[atIndex - 1] ?? "")) {
    return null;
  }

  const query = before.slice(atIndex + 1);
  if (/[^a-zA-Z0-9_.-]/.test(query)) {
    return null;
  }

  return {
    start: atIndex,
    end: cursor,
    query: query.toLowerCase(),
  };
}

function resolveMentionUserIds(content: string, mentionOptions: MentionOption[]): string[] {
  const mentionMap = new Map<string, string>();
  for (const option of mentionOptions) {
    for (const handle of option.searchableHandles) {
      mentionMap.set(handle, option.userId);
    }
  }

  const matches = content.match(/(^|\s)@([a-zA-Z0-9_.-]{2,50})/g) ?? [];
  const mentionedUserIds = new Set<string>();
  for (const match of matches) {
    const handle = match.trim().slice(1).toLowerCase();
    const userId = mentionMap.get(handle);
    if (userId) {
      mentionedUserIds.add(userId);
    }
  }

  return Array.from(mentionedUserIds);
}

function formatTime(value: ProjectChatMessage["createdAt"]): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "now";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function resizeComposerTextarea(textarea: HTMLTextAreaElement | null): void {
  if (!textarea) {
    return;
  }

  textarea.style.height = "0px";
  const nextHeight = Math.min(textarea.scrollHeight, 128);
  textarea.style.height = `${Math.max(nextHeight, 40)}px`;
}

function buildHighlightedContent(
  message: ProjectChatMessage,
  isOwnMessage: boolean,
): React.ReactNode {
  const mentionHandles = new Set<string>();
  for (const mention of message.mentions) {
    const option = buildMentionOption(mention.user);
    for (const handle of option.searchableHandles) {
      mentionHandles.add(handle);
    }
  }

  const tokens = message.content.split(/(@[a-zA-Z0-9_.-]{2,50})/g);
  const mentionClassName = isOwnMessage
    ? "font-semibold text-primary-foreground"
    : "font-semibold text-primary";

  return tokens.map((token, index) => {
    if (token.startsWith("@")) {
      const handle = token.slice(1).toLowerCase();
      if (mentionHandles.has(handle)) {
        return (
          <span key={`${message.id}-token-${index}`} className={mentionClassName}>
            {token}
          </span>
        );
      }
    }

    return <span key={`${message.id}-token-${index}`}>{token}</span>;
  });
}

export function TaskCommentBox({
  projectId,
  members,
  initialMessages,
  currentUserId,
}: {
  projectId: string;
  members: UserSummary[];
  initialMessages: ProjectChatMessage[];
  currentUserId?: string | null;
}) {
  const [messages, setMessages] = useState<ProjectChatMessage[]>(initialMessages);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [mentionContext, setMentionContext] = useState<MentionContext | null>(null);

  const mentionOptions = useMemo(
    () => members.map((member) => buildMentionOption(member)),
    [members],
  );
  const visibleMentionOptions = useMemo(() => {
    if (!mentionContext) {
      return [];
    }

    return mentionOptions
      .filter((option) =>
        mentionContext.query.length === 0
          ? true
          : option.searchableHandles.some((handle) => handle.startsWith(mentionContext.query)),
      )
      .slice(0, 6);
  }, [mentionContext, mentionOptions]);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  useEffect(() => {
    resizeComposerTextarea(textareaRef.current);
  }, [content]);

  function updateMentionContext(nextContent: string): void {
    const cursor = textareaRef.current?.selectionStart ?? nextContent.length;
    setMentionContext(extractMentionContext(nextContent, cursor));
  }

  function applyMention(option: MentionOption): void {
    if (!mentionContext) {
      return;
    }

    const nextContent = `${content.slice(0, mentionContext.start)}@${option.handle} ${content.slice(mentionContext.end)}`;
    setContent(nextContent);
    setMentionContext(null);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const nextCursor = mentionContext.start + option.handle.length + 2;
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function sendMessage(): void {
    const trimmed = content.trim();
    if (!trimmed || isPending) {
      return;
    }

    const mentionUserIds = resolveMentionUserIds(trimmed, mentionOptions);
    setError(null);

    startTransition(async () => {
      const result = await createProjectChatMessage(projectId, {
        content: trimmed,
        mentionUserIds,
      });

      if (result.error || !result.data) {
        setError(result.error ?? "Unable to send comment.");
        return;
      }

      setMessages((previous) => [...previous, result.data as ProjectChatMessage]);
      setContent("");
      setMentionContext(null);
    });
  }

  return (
    <div className="relative grid gap-3 rounded-xl border border-border bg-card/70 p-3 sm:p-4">
      <div ref={messagesRef} className="max-h-[400px] min-h-[220px] space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="grid h-full min-h-[200px] place-items-center rounded-lg border border-dashed border-border bg-popover/40 px-4">
            <p className="text-center text-sm text-muted-foreground">
              No comments yet. Start the conversation.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = Boolean(currentUserId && message.authorId === currentUserId);

            return (
              <article
                key={message.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[85%] flex-col gap-1 ${isOwnMessage ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`flex items-center gap-2 text-[11px] text-muted-foreground ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwnMessage ? (
                      <UserAvatar
                        name={message.author?.name}
                        email={message.author?.email}
                        avatarUrl={message.author?.avatarUrl}
                        className="h-5 w-5 text-[10px]"
                      />
                    ) : null}
                    <span className="max-w-[160px] truncate">
                      {message.author?.name ?? message.author?.email ?? "Unknown user"}
                    </span>
                    <span>•</span>
                    <span>{formatTime(message.createdAt)}</span>
                  </div>

                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-6 shadow-sm ${
                      isOwnMessage
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border border-border bg-popover text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {buildHighlightedContent(message, isOwnMessage)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="relative rounded-2xl border border-border bg-background/90 px-2 py-2 shadow-sm">
        {mentionContext && visibleMentionOptions.length > 0 ? (
          <div className="absolute inset-x-2 bottom-full z-20 mb-2 grid gap-1 rounded-lg border border-border bg-popover p-1 shadow-md">
            {visibleMentionOptions.map((option) => (
              <button
                key={option.userId}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  applyMention(option);
                }}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
              >
                <UserAvatar
                  name={option.name}
                  email={option.email}
                  avatarUrl={option.avatarUrl}
                  className="h-6 w-6 text-[10px]"
                />
                <span className="min-w-0 flex-1 truncate">{option.name}</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <AtSign className="h-3 w-3" />
                  {option.handle}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <button
            type="button"
            aria-label="Attach file"
            disabled
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-popover text-foreground/80 transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-80"
          >
            <Paperclip className="h-4 w-4" strokeWidth={2.2} />
          </button>

          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => {
              const nextValue = event.target.value;
              setContent(nextValue);
              resizeComposerTextarea(event.currentTarget);
              updateMentionContext(nextValue);
            }}
            onKeyUp={(event) => {
              const target = event.currentTarget;
              setMentionContext(
                extractMentionContext(target.value, target.selectionStart ?? target.value.length),
              );
            }}
            onClick={(event) => {
              const target = event.currentTarget;
              setMentionContext(
                extractMentionContext(target.value, target.selectionStart ?? target.value.length),
              );
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            maxLength={2000}
            placeholder="Leave a comment..."
            className="h-10 min-h-10 max-h-32 resize-none border-0 bg-transparent px-1 py-2.5 leading-5 shadow-none focus-visible:ring-0"
          />

          <button
            type="button"
            aria-label="Send comment"
            disabled={isPending || content.trim().length === 0}
            onClick={sendMessage}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-transparent bg-primary text-primary-foreground shadow-sm transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.3} />
            ) : (
              <ArrowUp className="h-4 w-4" strokeWidth={2.35} />
            )}
          </button>
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
