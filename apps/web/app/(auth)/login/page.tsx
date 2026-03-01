import { signIn } from "@/lib/auth";

export default function LoginPage(): JSX.Element {
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
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="text-sm text-gray-600">Sign in with Google or GitHub.</p>
        <form action={signInWithGoogle}>
          <button className="h-10 w-full rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500" type="submit">
            Continue with Google
          </button>
        </form>
        <form action={signInWithGitHub}>
          <button className="h-10 w-full rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700" type="submit">
            Continue with GitHub
          </button>
        </form>
      </div>
    </main>
  );
}
