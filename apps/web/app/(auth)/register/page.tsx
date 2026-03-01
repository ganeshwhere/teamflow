import { signIn } from "@/lib/auth";

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
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center p-6">
      <div className="grid w-full gap-4 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Register</h1>
        <p className="text-sm text-gray-600">Use OAuth to create your account.</p>
        <form action={signInWithGoogle}>
          <button className="h-10 w-full rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500" type="submit">
            Register with Google
          </button>
        </form>
        <form action={signInWithGitHub}>
          <button className="h-10 w-full rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700" type="submit">
            Register with GitHub
          </button>
        </form>
      </div>
    </main>
  );
}
