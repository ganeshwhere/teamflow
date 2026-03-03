import type { VerifyTokenPayload, VerifyTokenResponse } from "@repo/types";

const MIN_SECRET_LENGTH = 32;

type UpsertOAuthUserParams = {
  apiBaseUrl: string;
  payload: VerifyTokenPayload;
  fetchImpl?: typeof fetch;
  bridgeSecret?: string;
};

function resolveAuthBridgeSecret(override?: string): string {
  const secret = override?.trim() ?? process.env.AUTH_BRIDGE_SECRET?.trim();

  if (!secret) {
    throw new Error("Missing auth bridge secret");
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`AUTH_BRIDGE_SECRET must be at least ${MIN_SECRET_LENGTH} characters.`);
  }

  return secret;
}

export async function upsertOAuthUser(
  params: UpsertOAuthUserParams,
): Promise<VerifyTokenResponse | null> {
  const fetchImpl = params.fetchImpl ?? fetch;

  try {
    const bridgeSecret = resolveAuthBridgeSecret(params.bridgeSecret);

    const response = await fetchImpl(`${params.apiBaseUrl}/auth/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-bridge-secret": bridgeSecret,
      },
      body: JSON.stringify(params.payload),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as VerifyTokenResponse;
  } catch {
    return null;
  }
}
