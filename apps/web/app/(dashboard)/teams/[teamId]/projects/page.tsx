import Link from "next/link";
import type { ProjectItem } from "@repo/types";

import { getProjects } from "@/actions/project.actions";
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link href={`/teams/${teamId}/projects/new`} className="text-sm text-blue-700 hover:underline">
          New project
        </Link>
      </div>

      <div className="grid gap-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/teams/${teamId}/projects/${project.id}`}>
            <Card className="transition hover:border-blue-300">
              <p className="font-semibold">{project.name}</p>
              <p className="text-sm text-slate-600">{project.description ?? "No description"}</p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
