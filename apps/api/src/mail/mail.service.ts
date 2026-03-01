import { Injectable, Logger } from "@nestjs/common";
import { render } from "@react-email/render";
import { Resend } from "resend";

import { InviteEmail } from "./templates/InviteEmail";
import { TaskAssignedEmail } from "./templates/TaskAssignedEmail";

type TeamInvitePayload = {
  to: string;
  inviterName: string;
  teamName: string;
  inviteUrl: string;
};

type TaskAssignedPayload = {
  to: string;
  assigneeName: string;
  taskTitle: string;
  projectName: string;
  teamName: string;
  taskUrl: string;
  priority?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.resend = null;
      this.logger.warn("RESEND_API_KEY is not configured. Email sending is disabled.");
      return;
    }

    this.resend = new Resend(apiKey);
  }

  async sendTeamInviteEmail(payload: TeamInvitePayload): Promise<void> {
    await this.sendEmailSafely({
      to: payload.to,
      subject: `${payload.inviterName} invited you to ${payload.teamName}`,
      html: await render(InviteEmail(payload))
    });
  }

  async sendTaskAssignedEmail(payload: TaskAssignedPayload): Promise<void> {
    await this.sendEmailSafely({
      to: payload.to,
      subject: `Task assigned: ${payload.taskTitle}`,
      html: await render(TaskAssignedEmail(payload))
    });
  }

  private async sendEmailSafely(input: { to: string; subject: string; html: string }): Promise<void> {
    const from = process.env.RESEND_FROM_EMAIL;
    if (!from) {
      this.logger.warn("RESEND_FROM_EMAIL is not configured. Skipping email send.");
      return;
    }
    if (!this.resend) {
      this.logger.warn("Resend client not configured. Skipping email send.");
      return;
    }

    try {
      await this.resend.emails.send({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html
      });
    } catch (error) {
      this.logger.error("Email send failed", error as Error);
    }
  }
}
