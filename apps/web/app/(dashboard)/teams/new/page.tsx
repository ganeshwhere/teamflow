import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { CreateTeamForm } from "@/components/teams/create-team-form";
import { Card } from "@/components/ui/card";

export default function NewTeamPage() {
  return (
    <main className="mx-auto grid w-full max-w-xl gap-4">
      <PageHeader
        eyebrow="Setup"
        title="Create Team"
        description="Define a team workspace and invite collaborators."
        actions={
          <Link href="/teams" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to teams
          </Link>
        }
      />
      <Card>
        <CreateTeamForm />
      </Card>
    </main>
  );
}
