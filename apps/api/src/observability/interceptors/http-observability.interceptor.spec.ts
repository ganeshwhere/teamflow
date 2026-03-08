import {
  HttpException,
  HttpStatus,
  Logger,
  type CallHandler,
  type ExecutionContext,
} from "@nestjs/common";
import { lastValueFrom, of, throwError } from "rxjs";

import { HttpObservabilityInterceptor } from "./http-observability.interceptor";

function createHttpExecutionContext(
  request: Record<string, unknown>,
  response: Record<string, unknown>,
): ExecutionContext {
  return {
    getType: () => "http",
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as ExecutionContext;
}

describe("HttpObservabilityInterceptor", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("emits structured mutation log with request and actor context", async () => {
    const logSpy = jest.spyOn(Logger.prototype, "log").mockImplementation();
    const interceptor = new HttpObservabilityInterceptor();
    const request = {
      requestId: "req-12345678",
      method: "POST",
      originalUrl: "/projects/proj_1/tasks",
      params: { projectId: "proj_1" },
      user: { sub: "user_1", email: "member@teamflow.dev" },
    };
    const response = { statusCode: 201 };
    const context = createHttpExecutionContext(request, response);
    const next: CallHandler = {
      handle: () => of({ ok: true }),
    };

    await lastValueFrom(interceptor.intercept(context, next));

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(logSpy.mock.calls[0]?.[0] as string) as Record<string, unknown>;

    expect(payload.event).toBe("http.mutation");
    expect(payload.requestId).toBe("req-12345678");
    expect(payload.method).toBe("POST");
    expect(payload.path).toBe("/projects/proj_1/tasks");
    expect(payload.statusCode).toBe(201);
    expect(payload.actorId).toBe("user_1");
    expect(payload.actorEmail).toBe("member@teamflow.dev");
    expect(payload.routeParams).toEqual({ projectId: "proj_1" });
  });

  it("emits structured error log with status and request context", async () => {
    const errorSpy = jest.spyOn(Logger.prototype, "error").mockImplementation();
    const interceptor = new HttpObservabilityInterceptor();
    const request = {
      requestId: "req-err-87654321",
      method: "PATCH",
      originalUrl: "/projects/proj_1/tasks/task_1",
      params: { projectId: "proj_1", id: "task_1" },
      user: { sub: "user_1", email: "member@teamflow.dev" },
    };
    const response = {};
    const context = createHttpExecutionContext(request, response);
    const next: CallHandler = {
      handle: () => throwError(() => new HttpException("Forbidden resource", HttpStatus.FORBIDDEN)),
    };

    await expect(lastValueFrom(interceptor.intercept(context, next))).rejects.toBeInstanceOf(
      HttpException,
    );

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(errorSpy.mock.calls[0]?.[0] as string) as Record<string, unknown>;

    expect(payload.event).toBe("http.error");
    expect(payload.requestId).toBe("req-err-87654321");
    expect(payload.statusCode).toBe(403);
    expect(payload.errorName).toBe("HttpException");
    expect(payload.errorMessage).toBe("Forbidden resource");
    expect(payload.routeParams).toEqual({ projectId: "proj_1", id: "task_1" });
  });
});
