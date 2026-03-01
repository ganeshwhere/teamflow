import Link from "next/link";

import { CreateTeamForm } from "@/components/teams/create-team-form";
import { Card } from "@/components/ui/card";

export default function NewTeamPage() {
  return (
    <main className="mx-auto grid w-full max-w-xl gap-4">
      <Link href="/teams" className="text-sm text-blue-700 hover:underline">
        Back to teams
      </Link>
      <Card>
        <h1 className="mb-3 text-xl font-semibold">Create Team</h1>
        <CreateTeamForm />
      </Card>
    </main>
  );
}
