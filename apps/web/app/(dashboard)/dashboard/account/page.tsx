import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export default async function AccountPage() {
  const session = await auth();

  return (
    <section className="grid gap-6 pb-10">
      <PageHeader
        eyebrow="Profile"
        title="Account"
        description="Your basic account details from your OAuth profile."
      />

      <Card className="grid gap-4 border-border bg-card">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Name</p>
          <p className="mt-1 text-sm text-foreground">{session?.user?.name ?? "Not available"}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Email</p>
          <p className="mt-1 text-sm text-foreground">{session?.user?.email ?? "Not available"}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">User ID</p>
          <p className="mt-1 break-all text-sm text-foreground">{session?.user?.id ?? "Not available"}</p>
        </div>
      </Card>
    </section>
  );
}
