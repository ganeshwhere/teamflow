import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
};

export function getUserDisplayName({
  name,
  email
}: {
  name?: string | null;
  email?: string | null;
}): string {
  return name ?? email ?? "Unknown user";
}

export function getUserInitials(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "U";
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  alt,
  className,
  fallbackClassName
}: UserAvatarProps) {
  const label = alt ?? getUserDisplayName({ name, email });

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={label}
        className={cn("inline-flex shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-foreground",
        className,
        fallbackClassName
      )}
      aria-label={label}
      title={label}
    >
      {getUserInitials(label)}
    </span>
  );
}
