import {
  getApiJwtAudience,
  getApiJwtExpiry,
  getApiJwtIssuer,
  getApiJwtSecret,
  getAuthBridgeSecret,
  getTeamInviteJwtSecret,
  isAuthBridgeSecretValid,
} from "./auth.config";

describe("auth.config", () => {
  const originalEnv = { ...process.env };
  const validSecret = "s".repeat(32);
  const otherValidSecret = "t".repeat(32);

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("uses secure API JWT defaults when not configured", () => {
    delete process.env.API_JWT_EXPIRY;
    delete process.env.API_JWT_ISSUER;
    delete process.env.API_JWT_AUDIENCE;

    expect(getApiJwtExpiry()).toBe("15m");
    expect(getApiJwtIssuer()).toBe("teamflow-api");
    expect(getApiJwtAudience()).toBe("teamflow-clients");
  });

  it("reads API_JWT_SECRET", () => {
    process.env.API_JWT_SECRET = validSecret;

    expect(getApiJwtSecret()).toBe(validSecret);
  });

  it("throws when API_JWT_SECRET is missing", () => {
    delete process.env.API_JWT_SECRET;

    expect(() => getApiJwtSecret()).toThrow("Missing API JWT secret");
  });

  it("throws when API_JWT_SECRET is too short", () => {
    process.env.API_JWT_SECRET = "short-secret";

    expect(() => getApiJwtSecret()).toThrow("API_JWT_SECRET must be at least 32 characters.");
  });

  it("validates bridge secret safely", () => {
    process.env.AUTH_BRIDGE_SECRET = validSecret;

    expect(isAuthBridgeSecretValid(validSecret)).toBe(true);
    expect(isAuthBridgeSecretValid(otherValidSecret)).toBe(false);
    expect(isAuthBridgeSecretValid("")).toBe(false);
    expect(isAuthBridgeSecretValid(undefined)).toBe(false);
  });

  it("throws when AUTH_BRIDGE_SECRET is missing", () => {
    delete process.env.AUTH_BRIDGE_SECRET;

    expect(() => getAuthBridgeSecret()).toThrow("Missing auth bridge secret");
  });

  it("throws when AUTH_BRIDGE_SECRET is too short", () => {
    process.env.AUTH_BRIDGE_SECRET = "short-secret";

    expect(() => getAuthBridgeSecret()).toThrow(
      "AUTH_BRIDGE_SECRET must be at least 32 characters.",
    );
  });

  it("falls back invite secret to API JWT secret", () => {
    process.env.API_JWT_SECRET = validSecret;
    delete process.env.TEAM_INVITE_JWT_SECRET;

    expect(getTeamInviteJwtSecret()).toBe(validSecret);
  });

  it("throws when TEAM_INVITE_JWT_SECRET is too short", () => {
    process.env.TEAM_INVITE_JWT_SECRET = "short-secret";

    expect(() => getTeamInviteJwtSecret()).toThrow(
      "TEAM_INVITE_JWT_SECRET must be at least 32 characters.",
    );
  });
});
