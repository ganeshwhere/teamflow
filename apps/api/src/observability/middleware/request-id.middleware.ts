import { Injectable, type NestMiddleware } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { NextFunction, Response } from "express";

import type { RequestWithId } from "../interfaces/request-with-id.interface";

const REQUEST_ID_HEADER = "x-request-id";
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

function isValidRequestId(candidate?: string): candidate is string {
  return Boolean(candidate && REQUEST_ID_PATTERN.test(candidate));
}

function readRequestIdHeader(request: RequestWithId): string | undefined {
  const headerValue = request.headers[REQUEST_ID_HEADER];
  const rawValue = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (typeof rawValue !== "string") {
    return undefined;
  }

  const trimmed = rawValue.trim();
  return isValidRequestId(trimmed) ? trimmed : undefined;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: RequestWithId, response: Response, next: NextFunction): void {
    const incomingRequestId = readRequestIdHeader(request);
    const requestId = incomingRequestId ?? randomUUID();

    request.requestId = requestId;
    response.setHeader(REQUEST_ID_HEADER, requestId);
    next();
  }
}
