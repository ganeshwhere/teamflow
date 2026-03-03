import Link from "next/link";
import { PlusCircle } from "lucide-react";
import type { ProjectItem } from "@repo/types";

import { getProjects } from "@/actions/project.actions";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectOverviewCard } from "@/components/projects/project-overview-card";
import { Card } from "@/components/ui/card";

export default async function TeamProjectsPage({
  params
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const result = await getProjects(teamId);
  const projects: ProjectItem[] = result.data ?? [];

  return (
    <main className="grid gap-4">
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Track project streams and jump into delivery details."
        actions={
          <Link href={`/teams/${teamId}/projects/new`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <PlusCircle className="h-4 w-4" />
            New project
          </Link>
        }
      />

      {projects.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectOverviewCard key={project.id} teamId={teamId} project={project} />
          ))}
        </div>
      ) : (
        <Card className="text-sm text-muted-foreground">No projects yet. Create your first project to get started.</Card>
      )}
    </main>
  );
}
