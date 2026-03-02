import { signIn } from "@/lib/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  async function signInWithGoogle(): Promise<void> {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }

  async function signInWithGitHub(): Promise<void> {
    "use server";
    await signIn("github", { redirectTo: "/dashboard" });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--secondary),transparent_40%),radial-gradient(circle_at_bottom_left,var(--accent),transparent_45%)] opacity-90" />
      <ThemeToggle className="absolute right-5 top-5 z-20" />

      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-6 px-6 py-12 lg:grid-cols-[1.2fr_1fr]">
        <section className="relative z-10 hidden rounded-2xl border border-border bg-card/70 p-10 shadow-xl backdrop-blur lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Team Flow</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-foreground">Build momentum from your first project day.</h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground">
            Create your workspace, invite your team, and move work across delivery stages with clarity.
          </p>
          <ul className="mt-8 grid gap-3 text-sm text-muted-foreground">
            <li className="rounded-lg border border-border bg-background/80 px-4 py-3">Fast OAuth onboarding</li>
            <li className="rounded-lg border border-border bg-background/80 px-4 py-3">Structured team and project hierarchy</li>
            <li className="rounded-lg border border-border bg-background/80 px-4 py-3">Consistent task execution visibility</li>
          </ul>
        </section>

        <Card className="relative z-10 mx-auto grid w-full max-w-md gap-4 p-6 shadow-xl sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Create Workspace</p>
            <h2 className="mt-2 text-2xl font-semibold">Register with OAuth</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose a provider to start your Team Flow workspace.</p>
          </div>
          <form action={signInWithGoogle}>
            <Button className="w-full" type="submit">
              Register with Google
            </Button>
          </form>
          <form action={signInWithGitHub}>
            <Button className="w-full" type="submit" variant="secondary">
              Register with GitHub
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">You can invite members and create teams immediately after sign-in.</p>
        </Card>
      </div>
    </main>
  );
}
