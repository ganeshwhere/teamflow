import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { AuthController } from "../src/auth/auth.controller";
import { AuthService } from "../src/auth/auth.service";
import { VerifyTokenDto } from "../src/auth/dto/verify-token.dto";

describe("auth verify-token integration", () => {
  const validBridgeSecret = "b".repeat(32);
  const originalAuthBridgeSecret = process.env.AUTH_BRIDGE_SECRET;
  const validateOrCreateUser = jest.fn();
  const issueApiToken = jest.fn();
  const validationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  let controller: AuthController;

  beforeAll(async () => {
    process.env.AUTH_BRIDGE_SECRET = validBridgeSecret;

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateOrCreateUser,
            issueApiToken,
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  afterAll(() => {
    if (originalAuthBridgeSecret === undefined) {
      delete process.env.AUTH_BRIDGE_SECRET;
      return;
    }

    process.env.AUTH_BRIDGE_SECRET = originalAuthBridgeSecret;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("accepts valid verify-token payload and returns canonical user shape", async () => {
    const createdAt = new Date("2026-03-02T00:00:00.000Z");
    validateOrCreateUser.mockResolvedValue({
      id: "user_1",
      email: "demo@teamflow.dev",
      name: "Demo User",
      avatarUrl: "https://example.com/avatar.png",
      provider: "google",
      providerId: "google_123",
      createdAt,
    });
    issueApiToken.mockResolvedValue("signed-api-token");

    const dto = (await validationPipe.transform(
      {
        email: "demo@teamflow.dev",
        name: "Demo User",
        avatarUrl: "https://example.com/avatar.png",
        provider: "google",
        providerId: "google_123",
      },
      { type: "body", metatype: VerifyTokenDto },
    )) as VerifyTokenDto;

    const response = await controller.verifyToken(dto, validBridgeSecret);

    expect(validateOrCreateUser).toHaveBeenCalledWith({
      email: "demo@teamflow.dev",
      name: "Demo User",
      avatarUrl: "https://example.com/avatar.png",
      provider: "google",
      providerId: "google_123",
    });
    expect(issueApiToken).toHaveBeenCalledWith({
      sub: "user_1",
      email: "demo@teamflow.dev",
      name: "Demo User",
      provider: "google",
    });
    expect(response).toEqual({
      userId: "user_1",
      apiToken: "signed-api-token",
      user: {
        id: "user_1",
        email: "demo@teamflow.dev",
        name: "Demo User",
        avatarUrl: "https://example.com/avatar.png",
        createdAt,
      },
    });
  });

  it("rejects malformed payload before controller execution", async () => {
    await expect(
      validationPipe.transform(
        {
          provider: "google",
          providerId: "google_123",
        },
        { type: "body", metatype: VerifyTokenDto },
      ),
    ).rejects.toThrow();

    expect(validateOrCreateUser).not.toHaveBeenCalled();
    expect(issueApiToken).not.toHaveBeenCalled();
  });

  it("rejects request when auth bridge secret is invalid", async () => {
    const dto = (await validationPipe.transform(
      {
        email: "demo@teamflow.dev",
        name: "Demo User",
        avatarUrl: "https://example.com/avatar.png",
        provider: "google",
        providerId: "google_123",
      },
      { type: "body", metatype: VerifyTokenDto },
    )) as VerifyTokenDto;

    await expect(controller.verifyToken(dto, "invalid-secret")).rejects.toThrow(
      "Invalid auth bridge secret",
    );
    expect(validateOrCreateUser).not.toHaveBeenCalled();
    expect(issueApiToken).not.toHaveBeenCalled();
  });
});
