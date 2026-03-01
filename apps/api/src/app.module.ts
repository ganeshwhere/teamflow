import { Module } from "@nestjs/common";

import { MailModule } from "./mail/mail.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [PrismaModule, MailModule]
})
export class AppModule {}
