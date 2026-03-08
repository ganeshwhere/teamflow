import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";

import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { MailModule } from "./mail/mail.module";
import { HttpObservabilityInterceptor } from "./observability/interceptors/http-observability.interceptor";
import { RequestIdMiddleware } from "./observability/middleware/request-id.middleware";
import { PrismaModule } from "./prisma/prisma.module";
import { ProjectChatModule } from "./project-chat/project-chat.module";
import { ProjectsModule } from "./projects/projects.module";
import { AppThrottlerGuard } from "./security/guards/app-throttler.guard";
import { getGlobalThrottlerOptions } from "./security/throttling.config";
import { TasksModule } from "./tasks/tasks.module";
import { TeamsModule } from "./teams/teams.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ThrottlerModule.forRoot(getGlobalThrottlerOptions()),
    PrismaModule,
    MailModule,
    AuthModule,
    TeamsModule,
    ProjectsModule,
    ProjectChatModule,
    TasksModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpObservabilityInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
