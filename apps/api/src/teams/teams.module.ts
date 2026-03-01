import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { MailModule } from "../mail/mail.module";
import { PrismaModule } from "../prisma/prisma.module";

import { TeamGuard } from "./guards/team.guard";
import { TeamsController } from "./teams.controller";
import { TeamsService } from "./teams.service";

@Module({
  imports: [PrismaModule, JwtModule.register({}), MailModule],
  controllers: [TeamsController],
  providers: [TeamsService, TeamGuard],
  exports: [TeamsService, TeamGuard]
})
export class TeamsModule {}
