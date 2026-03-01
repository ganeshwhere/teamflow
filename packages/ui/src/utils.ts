export function cn(...input: Array<string | undefined | null | false>): string {
  return input.filter(Boolean).join(" ");
}
