import { PrismaClient, Priority, ProjectStatus, TaskStatus, TeamRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@teamflow.dev" },
    update: {
      name: "Demo User",
      provider: "github",
      providerId: "github-demo-user"
    },
    create: {
      email: "demo@teamflow.dev",
      name: "Demo User",
      provider: "github",
      providerId: "github-demo-user"
    }
  });

  const team = await prisma.team.create({
    data: {
      name: "Core Product",
      slug: `core-product-${Date.now()}`,
      description: "Default seeded team",
      ownerId: demoUser.id,
      members: {
        create: {
          userId: demoUser.id,
          role: TeamRole.OWNER
        }
      }
    }
  });

  const project = await prisma.project.create({
    data: {
      name: "Team Flow MVP",
      description: "Initial milestone",
      status: ProjectStatus.ACTIVE,
      teamId: team.id
    }
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Define API contracts",
        description: "Finalize endpoint payload shapes",
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        projectId: project.id,
        creatorId: demoUser.id,
        assigneeId: demoUser.id
      },
      {
        title: "Implement auth bridge",
        description: "Connect NextAuth token verification",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.URGENT,
        projectId: project.id,
        creatorId: demoUser.id,
        assigneeId: demoUser.id
      },
      {
        title: "Set up dashboard UI",
        description: "Create server component pages",
        status: TaskStatus.IN_REVIEW,
        priority: Priority.MEDIUM,
        projectId: project.id,
        creatorId: demoUser.id,
        assigneeId: demoUser.id
      }
    ]
  });

  console.log("Seed complete", { userId: demoUser.id, teamId: team.id, projectId: project.id });
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
