import Link from "next/link";
import { PlusCircle } from "lucide-react";
import type { ProjectItem } from "@repo/types";

import { getProjects } from "@/actions/project.actions";
import { PageHeader } from "@/components/layout/page-header";
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

      <div className="grid gap-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/teams/${teamId}/projects/${project.id}`}>
            <Card className="transition hover:-translate-y-0.5 hover:border-primary">
              <p className="font-semibold">{project.name}</p>
              <p className="text-sm text-muted-foreground">{project.description ?? "No description"}</p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
