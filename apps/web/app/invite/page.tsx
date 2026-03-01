import { redirect } from "next/navigation";

import { joinTeam } from "@/actions/team.actions";
import { Card } from "@/components/ui/card";
import { decodeTeamIdFromToken } from "@/lib/invite-token";

export default async function InvitePage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const teamId = token ? decodeTeamIdFromToken(token) : null;

  async function acceptInvite(): Promise<void> {
    "use server";

    if (!token || !teamId) {
      redirect("/teams");
    }

    const result = await joinTeam(teamId, token);
    if (result.error) {
      redirect(`/teams?inviteError=${encodeURIComponent(result.error)}`);
    }

    redirect(`/teams/${teamId}`);
  }

  if (!token || !teamId) {
    return (
      <main className="mx-auto mt-10 max-w-lg px-6">
        <Card>
          <h1 className="text-xl font-semibold">Invalid Invite</h1>
          <p className="mt-2 text-sm text-slate-600">This invite link is invalid or expired.</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-10 max-w-lg px-6">
      <Card>
        <h1 className="text-xl font-semibold">Team Invitation</h1>
        <p className="mt-2 text-sm text-slate-600">You have been invited to join a team.</p>
        <form action={acceptInvite} className="mt-4">
          <button className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700" type="submit">
            Join Team
          </button>
        </form>
      </Card>
    </main>
  );
}
