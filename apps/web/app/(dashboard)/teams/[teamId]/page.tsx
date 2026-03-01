import Link from "next/link";
import { Suspense } from "react";

import { getProjects } from "@/actions/project.actions";
import { getTeam } from "@/actions/team.actions";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { InviteMemberForm } from "@/components/teams/invite-member-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

async function TeamOverview({ teamId }: { teamId: string }): Promise<JSX.Element> {
  const teamResult = await getTeam(teamId);
  const projectsResult = await getProjects(teamId);

  const team =
    (teamResult.data as {
      id: string;
      name: string;
      description?: string | null;
      members?: Array<{ id: string; role: string; user: { id: string; email: string; name?: string | null } }>;
    } | null) ?? null;
  const projects = (projectsResult.data as Array<{ id: string; name: string; status?: string }> | null) ?? [];

  if (!team) {
    return (
      <Card>
        <p className="text-sm text-red-600">Failed to load team details.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <Card>
        <h1 className="text-2xl font-semibold">{team.name}</h1>
        <p className="mt-1 text-sm text-slate-600">{team.description ?? "No description"}</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-lg font-semibold">Members</h2>
          <div className="grid gap-2">
            {(team.members ?? []).map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-md border border-slate-200 p-2">
                <span className="text-sm text-slate-700">{member.user.name ?? member.user.email}</span>
                <Badge>{member.role}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 text-lg font-semibold">Invite Member</h2>
          <InviteMemberForm teamId={teamId} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Projects</h2>
            <Link href={`/teams/${teamId}/projects`} className="text-sm text-blue-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-2">
            {projects.map((project) => (
              <Link key={project.id} href={`/teams/${teamId}/projects/${project.id}`}>
                <div className="rounded-md border border-slate-200 p-3 transition hover:border-blue-300">
                  <p className="font-medium text-slate-900">{project.name}</p>
                  <p className="text-xs text-slate-500">{project.status ?? "ACTIVE"}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 text-lg font-semibold">Create Project</h2>
          <CreateProjectForm teamId={teamId} />
        </Card>
      </div>
    </div>
  );
}

export default function TeamPage({ params }: { params: { teamId: string } }): JSX.Element {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      {/* @ts-expect-error Async server component */}
      <TeamOverview teamId={params.teamId} />
    </Suspense>
  );
}
