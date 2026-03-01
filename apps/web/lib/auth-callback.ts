import type { VerifyTokenPayload, VerifyTokenResponse } from "@repo/types";

type UpsertOAuthUserParams = {
  apiBaseUrl: string;
  payload: VerifyTokenPayload;
  fetchImpl?: typeof fetch;
};

export async function upsertOAuthUser(params: UpsertOAuthUserParams): Promise<VerifyTokenResponse | null> {
  const fetchImpl = params.fetchImpl ?? fetch;

  try {
    const response = await fetchImpl(`${params.apiBaseUrl}/auth/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params.payload)
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as VerifyTokenResponse;
  } catch {
    return null;
  }
}
