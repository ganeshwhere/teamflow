import Link from "next/link";
import { Suspense } from "react";

import { getMyTeams } from "@/actions/team.actions";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { CreateTeamForm } from "@/components/teams/create-team-form";
import { Card } from "@/components/ui/card";

async function TeamsList(): Promise<JSX.Element> {
  const result = await getMyTeams();
  const teams = (result.data as Array<{ id: string; name: string; description?: string | null }> | null) ?? [];

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
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}

export default function TeamsPage(): JSX.Element {
  return (
    <main className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Teams</h1>
          <Link href="/teams/new" className="text-sm font-medium text-blue-700 hover:underline">
            Open full page form
          </Link>
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          {/* @ts-expect-error Async server component */}
          <TeamsList />
        </Suspense>
      </section>
      <Card className="h-fit">
        <h2 className="mb-3 text-lg font-semibold">Create Team</h2>
        <CreateTeamForm />
      </Card>
    </main>
  );
}
