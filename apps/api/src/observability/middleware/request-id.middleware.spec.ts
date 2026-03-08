import type { NextFunction, Response } from "express";

import type { RequestWithId } from "../interfaces/request-with-id.interface";
import { RequestIdMiddleware } from "./request-id.middleware";

describe("RequestIdMiddleware", () => {
  const next = jest.fn() as unknown as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createResponse(): Response {
    return {
      setHeader: jest.fn(),
    } as unknown as Response;
  }

  it("reuses incoming valid x-request-id header", () => {
    const middleware = new RequestIdMiddleware();
    const request = {
      headers: {
        "x-request-id": "client-trace-12345",
      },
    } as unknown as RequestWithId;
    const response = createResponse();

    middleware.use(request, response, next);

    expect(request.requestId).toBe("client-trace-12345");
    expect(response.setHeader).toHaveBeenCalledWith("x-request-id", "client-trace-12345");
    expect(next).toHaveBeenCalled();
  });

  it("generates request id when header is missing or invalid", () => {
    const middleware = new RequestIdMiddleware();
    const request = {
      headers: {
        "x-request-id": "bad",
      },
    } as unknown as RequestWithId;
    const response = createResponse();

    middleware.use(request, response, next);

    expect(request.requestId).toBeDefined();
    expect(request.requestId?.length).toBeGreaterThanOrEqual(8);
    expect(response.setHeader).toHaveBeenCalledWith("x-request-id", request.requestId);
    expect(next).toHaveBeenCalled();
  });
});
