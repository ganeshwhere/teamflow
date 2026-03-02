import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { AuthController } from "../src/auth/auth.controller";
import { AuthService } from "../src/auth/auth.service";
import { VerifyTokenDto } from "../src/auth/dto/verify-token.dto";

describe("auth verify-token integration", () => {
  const validateOrCreateUser = jest.fn();
  const validationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  });

  let controller: AuthController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateOrCreateUser
          }
        }
      ]
    }).compile();

    controller = moduleRef.get(AuthController);
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
      createdAt
    });

    const dto = (await validationPipe.transform(
      {
        email: "demo@teamflow.dev",
        name: "Demo User",
        avatarUrl: "https://example.com/avatar.png",
        provider: "google",
        providerId: "google_123"
      },
      { type: "body", metatype: VerifyTokenDto }
    )) as VerifyTokenDto;

    const response = await controller.verifyToken(dto);

    expect(validateOrCreateUser).toHaveBeenCalledWith({
      email: "demo@teamflow.dev",
      name: "Demo User",
      avatarUrl: "https://example.com/avatar.png",
      provider: "google",
      providerId: "google_123"
    });
    expect(response).toEqual({
      userId: "user_1",
      user: {
        id: "user_1",
        email: "demo@teamflow.dev",
        name: "Demo User",
        avatarUrl: "https://example.com/avatar.png",
        provider: "google",
        providerId: "google_123",
        createdAt
      }
    });
  });

  it("rejects malformed payload before controller execution", async () => {
    await expect(
      validationPipe.transform(
        {
          provider: "google",
          providerId: "google_123"
        },
        { type: "body", metatype: VerifyTokenDto }
      )
    ).rejects.toThrow();

    expect(validateOrCreateUser).not.toHaveBeenCalled();
  });
});
