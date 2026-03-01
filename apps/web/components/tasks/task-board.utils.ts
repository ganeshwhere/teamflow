export type TaskBoardItem = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string | null;
};

export const taskStatuses: TaskBoardItem["status"][] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export function groupTasksByStatus(tasks: TaskBoardItem[]): Record<TaskBoardItem["status"], TaskBoardItem[]> {
  return taskStatuses.reduce<Record<TaskBoardItem["status"], TaskBoardItem[]>>(
    (acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    },
    {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: []
    }
  );
}
