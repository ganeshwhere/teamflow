"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { deleteTeam } from "@/actions/team.actions";
import { Button } from "@/components/ui/button";

type TeamCardMenuProps = {
  teamId: string;
  teamName: string;
  onErrorChange?: (value: string | null) => void;
};

export function TeamCardMenu({ teamId, teamName, onErrorChange }: TeamCardMenuProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = `team-actions-${teamId}`;

  function closeMenu(restoreFocus = false): void {
    setMenuOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }

  function focusMenuItem(index: number): void {
    const menuItems = menuRef.current?.querySelectorAll<HTMLElement>("[data-menu-item]");
    if (!menuItems || menuItems.length === 0) {
      return;
    }

    const nextIndex = ((index % menuItems.length) + menuItems.length) % menuItems.length;
    menuItems[nextIndex]?.focus();
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleOutside = (event: MouseEvent) => {
      if (
        !menuRef.current?.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    requestAnimationFrame(() => focusMenuItem(0));

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <div
      className="relative"
      data-no-card-nav="true"
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          onErrorChange?.(null);
          setMenuOpen((previous) => !previous);
        }}
        onKeyDown={(event) => {
          event.stopPropagation();

          if (event.key === "ArrowDown") {
            event.preventDefault();
            onErrorChange?.(null);
            setMenuOpen(true);
          }
        }}
        aria-label={`Open ${teamName} actions`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? menuId : undefined}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-popover text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {menuOpen ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={`${teamName} actions`}
          onKeyDown={(event) => {
            const menuItems = menuRef.current?.querySelectorAll<HTMLElement>("[data-menu-item]");
            if (!menuItems || menuItems.length === 0) {
              return;
            }

            const currentIndex = Array.from(menuItems).findIndex(
              (item) => item === document.activeElement,
            );

            if (event.key === "ArrowDown") {
              event.preventDefault();
              focusMenuItem(currentIndex + 1);
              return;
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              focusMenuItem(currentIndex - 1);
              return;
            }

            if (event.key === "Home") {
              event.preventDefault();
              focusMenuItem(0);
              return;
            }

            if (event.key === "End") {
              event.preventDefault();
              focusMenuItem(menuItems.length - 1);
            }
          }}
          className="absolute right-0 top-10 z-50 grid min-w-[180px] gap-1 rounded-lg border border-border bg-card p-1 shadow-lg"
        >
          <Link
            data-menu-item
            role="menuitem"
            tabIndex={0}
            href={`/teams/${teamId}/edit`}
            onClick={() => closeMenu()}
            className="rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          >
            Edit team
          </Link>
          <button
            data-menu-item
            role="menuitem"
            tabIndex={0}
            type="button"
            disabled
            className="cursor-not-allowed rounded-md px-3 py-2 text-left text-sm text-muted-foreground"
            title="Archive flow is not available yet."
          >
            Archive team
          </button>
          <Button
            data-menu-item
            role="menuitem"
            tabIndex={0}
            variant="danger"
            disabled={isDeleting}
            onClick={() => {
              onErrorChange?.(null);
              if (!window.confirm(`Delete "${teamName}"? This cannot be undone.`)) {
                return;
              }

              startDeleteTransition(async () => {
                const result = await deleteTeam(teamId);
                if (result.error) {
                  onErrorChange?.(result.error);
                  return;
                }

                closeMenu();
                router.refresh();
              });
            }}
            className="w-full justify-start gap-2 h-9 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isDeleting ? "Deleting..." : "Delete team"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
