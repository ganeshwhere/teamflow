import { TasksService } from "./tasks.service";

describe("TasksService", () => {
  it("applies list filters", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new TasksService(
      { task: { findMany } } as never,
      { sendTaskAssignedEmail: jest.fn() } as never
    );

    await service.listTasks("project_1", {
      status: "TODO" as never,
      priority: "HIGH" as never,
      assigneeId: "user_1"
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          projectId: "project_1",
          status: "TODO",
          priority: "HIGH",
          assigneeId: "user_1"
        })
      })
    );
  });

  it("does not fail update when mail send throws", async () => {
    const service = new TasksService(
      {
        task: {
          findFirst: jest.fn().mockResolvedValue({ id: "task_1", assigneeId: null }),
          update: jest.fn().mockResolvedValue({
            id: "task_1",
            title: "Task",
            priority: "MEDIUM",
            assignee: { email: "member@example.com", name: "Member" },
            project: { name: "P1", team: { name: "T1" } }
          })
        }
      } as never,
      {
        sendTaskAssignedEmail: jest.fn().mockRejectedValue(new Error("mail down"))
      } as never
    );

    await expect(service.updateTask("project_1", "task_1", { assigneeId: "user_2" })).resolves.toBeDefined();
  });
});
