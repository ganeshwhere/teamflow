import { DashboardFrame } from "@/components/layout/dashboard-frame";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <DashboardFrame
      user={{
        name: session?.user?.name,
        email: session?.user?.email
      }}
    >
      {children}
    </DashboardFrame>
  );
}
