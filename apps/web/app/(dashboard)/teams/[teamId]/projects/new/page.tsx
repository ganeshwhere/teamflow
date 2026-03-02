import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { Card } from "@/components/ui/card";

export default async function NewProjectPage({
  params
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  return (
    <main className="mx-auto grid w-full max-w-xl gap-4">
      <PageHeader
        eyebrow="Planning"
        title="Create Project"
        description="Start a project stream and define the initial scope."
        actions={
          <Link href={`/teams/${teamId}/projects`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
        }
      />
      <Card>
        <CreateProjectForm teamId={teamId} />
      </Card>
    </main>
  );
}
