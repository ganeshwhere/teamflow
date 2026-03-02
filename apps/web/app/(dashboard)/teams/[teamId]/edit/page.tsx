import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { TeamDetail } from "@repo/types";

import { getTeam } from "@/actions/team.actions";
import { PageHeader } from "@/components/layout/page-header";
import { EditTeamForm } from "@/components/teams/edit-team-form";
import { Card } from "@/components/ui/card";

export default async function EditTeamPage({
  params
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const teamResult = await getTeam(teamId);
  const team: TeamDetail | null = teamResult.data;

  if (!team) {
    return (
      <main className="mx-auto grid w-full max-w-xl gap-4">
        <Card>
          <p className="text-sm text-red-600">Failed to load team details.</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-xl gap-4">
      <PageHeader
        eyebrow="Team"
        title="Edit Team"
        description="Update team details."
        actions={
          <Link href={`/teams/${teamId}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to team
          </Link>
        }
      />
      <Card>
        <EditTeamForm teamId={teamId} initialName={team.name} initialDescription={team.description} />
      </Card>
    </main>
  );
}
