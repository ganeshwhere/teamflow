import Link from "next/link";
import { Suspense } from "react";
import type { TeamListItem } from "@repo/types";

import { getMyTeams } from "@/actions/team.actions";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";
import { Card } from "@/components/ui/card";

async function TeamsList() {
  const result = await getMyTeams();
  const teams: TeamListItem[] = result.data ?? [];

  return (
    <div className="grid gap-3">
      {teams.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">No teams yet. Create your first team.</p>
        </Card>
      ) : (
        teams.map((team) => (
          <Link key={team.id} href={`/teams/${team.id}`}>
            <Card className="transition hover:border-blue-300">
              <p className="font-semibold text-slate-900">{team.name}</p>
              <p className="text-sm text-slate-600">{team.description ?? "No description"}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                <span>{team.memberCount} members</span>
                <span>{team.projectCount} projects</span>
              </div>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}

export default function TeamsPage() {
  return (
    <main className="grid gap-6">
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Teams</h1>
          <CreateTeamDialog />
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <TeamsList />
        </Suspense>
      </section>
    </main>
  );
}
