import { ProjectsService } from "./projects.service";

describe("ProjectsService", () => {
  it("returns task counts grouped by status", async () => {
    const service = new ProjectsService(
      {
        project: {
          findFirst: jest.fn().mockResolvedValue({
            id: "project_1",
            teamId: "team_1",
            name: "Core",
            status: "ACTIVE"
          })
        },
        task: {
          groupBy: jest.fn().mockResolvedValue([
            { status: "TODO", _count: { _all: 2 } },
            { status: "DONE", _count: { _all: 1 } }
          ])
        }
      } as never
    );

    const result = await service.getProjectWithStats("team_1", "project_1");

    expect(result.taskCounts.TODO).toBe(2);
    expect(result.taskCounts.DONE).toBe(1);
    expect(result.taskCounts.IN_PROGRESS).toBe(0);
    expect(result.taskCounts.IN_REVIEW).toBe(0);
  });
});
