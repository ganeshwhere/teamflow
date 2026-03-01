import { Logger } from "@nestjs/common";
import { Resend } from "resend";

import { MailService } from "./mail.service";

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn()
    }
  }))
}));

describe("MailService", () => {
  const originalFrom = process.env.RESEND_FROM_EMAIL;

  beforeEach(() => {
    process.env.RESEND_FROM_EMAIL = "noreply@example.com";
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.RESEND_FROM_EMAIL = originalFrom;
  });

  it("sends invite email successfully", async () => {
    const service = new MailService();
    const resendInstance = (Resend as unknown as jest.Mock).mock.results[0].value;

    await service.sendTeamInviteEmail({
      to: "member@example.com",
      inviterName: "Alex",
      teamName: "Core",
      inviteUrl: "http://localhost:3000/invite?token=123"
    });

    expect(resendInstance.emails.send).toHaveBeenCalledTimes(1);
  });

  it("does not throw when resend fails", async () => {
    const service = new MailService();
    const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
    const resendInstance = (Resend as unknown as jest.Mock).mock.results[0].value;

    resendInstance.emails.send.mockRejectedValueOnce(new Error("boom"));

    await expect(
      service.sendTaskAssignedEmail({
        to: "member@example.com",
        assigneeName: "Jamie",
        taskTitle: "Review PR",
        projectName: "Team Flow",
        teamName: "Core",
        taskUrl: "http://localhost:3000/tasks/1"
      })
    ).resolves.toBeUndefined();

    expect(loggerSpy).toHaveBeenCalled();
  });
});
