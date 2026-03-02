import Link from "next/link";
import { Suspense } from "react";
import { FolderKanban, PlusCircle, Users } from "lucide-react";
import type { ProjectItem, TeamDetail } from "@repo/types";

import { getProjects } from "@/actions/project.actions";
import { getTeam } from "@/actions/team.actions";
import { PageHeader } from "@/components/layout/page-header";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { InviteMemberDialog } from "@/components/teams/invite-member-dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

async function TeamOverview({ teamId }: { teamId: string }) {
  const teamResult = await getTeam(teamId);
  const projectsResult = await getProjects(teamId);

  const team: TeamDetail | null = teamResult.data;
  const projects: ProjectItem[] = projectsResult.data ?? [];

  if (!team) {
    return (
      <Card>
        <p className="text-sm text-red-600">Failed to load team details.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Team"
        title={team.name}
        description={team.description ?? "No description"}
        actions={<InviteMemberDialog teamId={teamId} />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Members</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {(team.members ?? []).length}
            </span>
          </div>
          <div className="grid gap-2">
            {(team.members ?? []).map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-md border border-border bg-muted/70 p-2">
                <span className="text-sm">{member.user.name ?? member.user.email}</span>
                <Badge>{member.role}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="mt-3 grid gap-2">
            <Link
              href={`/teams/${teamId}/projects/new`}
              className="inline-flex items-center justify-between rounded-md border border-border bg-muted/70 px-3 py-2 text-sm text-foreground transition hover:border-primary"
            >
              <span className="inline-flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-muted-foreground" />
                Create project
              </span>
              <span className="text-xs text-muted-foreground">New</span>
            </Link>
            <Link
              href={`/teams/${teamId}/projects`}
              className="inline-flex items-center justify-between rounded-md border border-border bg-muted/70 px-3 py-2 text-sm text-foreground transition hover:border-primary"
            >
              <span className="inline-flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                Manage projects
              </span>
              <span className="text-xs text-muted-foreground">Browse</span>
            </Link>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Link href={`/teams/${teamId}/projects`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <FolderKanban className="h-4 w-4" />
            View all
          </Link>
        </div>
        <div className="grid gap-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/teams/${teamId}/projects/${project.id}`}>
              <div className="rounded-md border border-border bg-muted/70 p-3 transition hover:border-primary">
                <p className="font-medium">{project.name}</p>
                <p className="text-xs text-muted-foreground">{project.status ?? "ACTIVE"}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default async function TeamPage({
  params
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  return (
    <Suspense fallback={<SectionSkeleton />}>
      <TeamOverview teamId={teamId} />
    </Suspense>
  );
}
