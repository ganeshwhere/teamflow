export function decodeTeamIdFromToken(token: string): string | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) {
      return null;
    }

    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "===".slice((normalized.length + 3) % 4);
    const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as { teamId?: string };

    return payload.teamId ?? null;
  } catch {
    return null;
  }
}
