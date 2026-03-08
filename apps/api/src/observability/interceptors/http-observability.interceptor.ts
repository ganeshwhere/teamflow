import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, catchError, tap, throwError } from "rxjs";

import type { RequestWithId } from "../interfaces/request-with-id.interface";

type ObservabilityEvent = "http.request" | "http.mutation" | "http.error";

type ObservabilityLog = {
  actorEmail?: string;
  actorId?: string;
  durationMs: number;
  errorMessage?: string;
  errorName?: string;
  event: ObservabilityEvent;
  method: string;
  path: string;
  requestId: string;
  routeParams?: Record<string, string>;
  statusCode: number;
  timestamp: string;
};

@Injectable()
export class HttpObservabilityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpObservabilityInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const { request, response } = this.getRequestResponse(context);
    const startedAt = performance.now();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Number((performance.now() - startedAt).toFixed(1));
        const statusCode = this.readStatusCode(response?.statusCode, 200);
        const event: ObservabilityEvent = this.isMutation(request.method)
          ? "http.mutation"
          : "http.request";

        this.logger.log(this.toJsonLog(this.buildBaseLog(request, event, statusCode, durationMs)));
      }),
      catchError((error: unknown) => {
        const durationMs = Number((performance.now() - startedAt).toFixed(1));
        const statusCode = this.resolveErrorStatusCode(error);
        const logPayload: ObservabilityLog = {
          ...this.buildBaseLog(request, "http.error", statusCode, durationMs),
          errorName: error instanceof Error ? error.name : "UnknownError",
          errorMessage: error instanceof Error ? error.message : "Unhandled error",
        };

        this.logger.error(this.toJsonLog(logPayload));
        return throwError(() => error);
      }),
    );
  }

  private buildBaseLog(
    request: RequestWithId,
    event: ObservabilityEvent,
    statusCode: number,
    durationMs: number,
  ): ObservabilityLog {
    return {
      timestamp: new Date().toISOString(),
      event,
      requestId: this.getRequestId(request),
      method: (request.method ?? "UNKNOWN").toUpperCase(),
      path: request.originalUrl ?? request.url ?? "unknown",
      statusCode,
      durationMs,
      actorId: request.user?.sub,
      actorEmail: request.user?.email,
      routeParams: this.getRouteParams(request),
    };
  }

  private getRouteParams(request: RequestWithId): Record<string, string> | undefined {
    const params = request.params;
    if (!params || typeof params !== "object") {
      return undefined;
    }

    const pairs = Object.entries(params)
      .map(([key, value]) => [key, typeof value === "string" ? value : String(value)] as const)
      .filter(([, value]) => value.trim().length > 0);

    if (pairs.length === 0) {
      return undefined;
    }

    return Object.fromEntries(pairs);
  }

  private getRequestId(request: RequestWithId): string {
    const requestId = request.requestId?.trim();
    if (requestId && requestId.length > 0) {
      return requestId;
    }

    return "unknown";
  }

  private resolveErrorStatusCode(error: unknown): number {
    if (error instanceof HttpException) {
      return error.getStatus();
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status: unknown }).status === "number"
    ) {
      return this.readStatusCode((error as { status: number }).status, 500);
    }

    return 500;
  }

  private readStatusCode(candidate: unknown, fallback: number): number {
    if (typeof candidate !== "number" || !Number.isInteger(candidate) || candidate < 100) {
      return fallback;
    }

    return candidate;
  }

  private isMutation(method?: string): boolean {
    if (!method) {
      return false;
    }

    const normalizedMethod = method.toUpperCase();
    return (
      normalizedMethod === "POST" ||
      normalizedMethod === "PATCH" ||
      normalizedMethod === "PUT" ||
      normalizedMethod === "DELETE"
    );
  }

  private toJsonLog(payload: ObservabilityLog): string {
    return JSON.stringify(payload);
  }

  private getRequestResponse(context: ExecutionContext): {
    request: RequestWithId;
    response: { statusCode?: number };
  } {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithId>();
    const response = http.getResponse<{ statusCode?: number }>();

    return { request, response };
  }
}
