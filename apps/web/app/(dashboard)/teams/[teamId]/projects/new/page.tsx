import Link from "next/link";

import { CreateProjectForm } from "@/components/projects/create-project-form";
import { Card } from "@/components/ui/card";

export default function NewProjectPage({ params }: { params: { teamId: string } }): JSX.Element {
  return (
    <main className="mx-auto grid w-full max-w-xl gap-4">
      <Link href={`/teams/${params.teamId}/projects`} className="text-sm text-blue-700 hover:underline">
        Back to projects
      </Link>
      <Card>
        <h1 className="mb-3 text-xl font-semibold">Create Project</h1>
        <CreateProjectForm teamId={params.teamId} />
      </Card>
    </main>
  );
}
