import Link from "next/link";
import { Suspense } from "react";
import { FolderKanban, PlusCircle, Users } from "lucide-react";

import { getProjects } from "@/actions/project.actions";
import { getMyTeams } from "@/actions/team.actions";
import { PageHeader } from "@/components/layout/page-header";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { ProjectsBrowser, type GlobalProjectItem } from "@/components/projects/projects-browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

async function ProjectsContent() {
  const teamsResult = await getMyTeams();
  const teams = teamsResult.data ?? [];

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 px-6 text-center">
        <h2 className="text-2xl font-bold mb-3 tracking-tight">No teams found</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Create your first team to start organizing projects, tasks and collaborate with your
          colleagues.
        </p>
        <Link href="/teams/new">
          <Button className="font-semibold px-8 h-12">Create Team</Button>
        </Link>
      </div>
    );
  }

  const projectResults = await Promise.all(
    teams.map(async (team) => {
      const result = await getProjects(team.id);
      return { team, result };
    }),
  );

  const allProjects: GlobalProjectItem[] = projectResults.flatMap(({ team, result }) => {
    const projects = result.data ?? [];
    return projects.map((project) => ({
      teamId: team.id,
      teamName: team.name,
      project,
    }));
  });

  const failedTeams = projectResults.filter(({ result }) => Boolean(result.error));

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="grid gap-1 border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Teams
          </p>
          <p className="text-2xl font-semibold text-foreground">{teams.length}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            In your workspace
          </p>
        </Card>

        <Card className="grid gap-1 border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Projects
          </p>
          <p className="text-2xl font-semibold text-foreground">{allProjects.length}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <FolderKanban className="h-3.5 w-3.5" />
            Across all teams
          </p>
        </Card>

        <Card className="grid gap-1 border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Load Status
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {failedTeams.length === 0 ? "OK" : "Partial"}
          </p>
          <p className="text-xs text-muted-foreground">
            {failedTeams.length === 0
              ? "All team projects loaded."
              : `${failedTeams.length} team(s) could not be loaded.`}
          </p>
        </Card>
      </div>

      <ProjectsBrowser items={allProjects} />
    </section>
  );
}

export default function ProjectsPage() {
  return (
    <main className="grid gap-6">
      <PageHeader
        eyebrow="Portfolio"
        title="All Projects"
        description="Search every project across your teams and jump directly to execution."
        actions={
          <Link
            href="/teams"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <PlusCircle className="h-4 w-4" />
            Create in team
          </Link>
        }
      />
      <Suspense fallback={<SectionSkeleton />}>
        <ProjectsContent />
      </Suspense>
    </main>
  );
}
