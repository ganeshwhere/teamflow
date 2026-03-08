import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { RolesGuard } from "./auth/guards/roles.guard";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { HttpObservabilityInterceptor } from "./observability/interceptors/http-observability.interceptor";
import { AppModule } from "./app.module";
import { AppThrottlerGuard } from "./security/guards/app-throttler.guard";

describe("AppModule guard registration", () => {
  it("registers JwtAuthGuard and AppThrottlerGuard as APP_GUARD", () => {
    const providers = (Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AppModule) ?? []) as Array<{
      provide?: unknown;
      useClass?: unknown;
    }>;

    const appGuards = providers
      .filter((provider) => provider.provide === APP_GUARD)
      .map((provider) => provider.useClass);

    expect(appGuards).toEqual([JwtAuthGuard, AppThrottlerGuard]);
    expect(appGuards).not.toContain(RolesGuard);
  });
});

describe("AppModule interceptor registration", () => {
  it("registers HttpObservabilityInterceptor as APP_INTERCEPTOR", () => {
    const providers = (Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AppModule) ?? []) as Array<{
      provide?: unknown;
      useClass?: unknown;
    }>;

    const appInterceptors = providers
      .filter((provider) => provider.provide === APP_INTERCEPTOR)
      .map((provider) => provider.useClass);

    expect(appInterceptors).toEqual([HttpObservabilityInterceptor]);
  });
});
