import Link from "next/link";
import { Suspense } from "react";
import { FolderKanban, PlusCircle, Users } from "lucide-react";
import type { ProjectItem, TeamDetail } from "@repo/types";

import { getProjects } from "@/actions/project.actions";
import { getTeam } from "@/actions/team.actions";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectOverviewCard } from "@/components/projects/project-overview-card";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { InviteMemberDialog } from "@/components/teams/invite-member-dialog";
import { TeamMembersDialog } from "@/components/teams/team-members-dialog";
import { Card } from "@/components/ui/card";

async function TeamOverview({ teamId }: { teamId: string }) {
  const [teamResult, projectsResult] = await Promise.all([getTeam(teamId), getProjects(teamId)]);

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
        description={team.description ?? "No description provided."}
        actions={
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/70 p-1.5">
            <TeamMembersDialog members={team.members ?? []} />
            <InviteMemberDialog teamId={teamId} />
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="grid gap-1 border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Members</p>
          <p className="text-2xl font-semibold text-foreground">{(team.members ?? []).length}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Active collaborators
          </p>
        </Card>

        <Card className="grid gap-1 border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Projects</p>
          <p className="text-2xl font-semibold text-foreground">{projects.length}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <FolderKanban className="h-3.5 w-3.5" />
            Delivery workstreams
          </p>
        </Card>
      </div>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="grid gap-0.5">
            <h2 className="text-lg font-semibold text-foreground">Projects</h2>
            <p className="text-xs text-muted-foreground">Track active streams and jump directly into delivery.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/teams/${teamId}/projects/new`}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-popover px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
            >
              <PlusCircle className="h-4 w-4" />
              New project
            </Link>
            <Link
              href={`/teams/${teamId}/projects`}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-popover px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
            >
              <FolderKanban className="h-4 w-4" />
              Browse all
            </Link>
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 8).map((project) => (
              <ProjectOverviewCard key={project.id} teamId={teamId} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No projects yet. Use quick actions to create one.</p>
        )}
      </section>
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
