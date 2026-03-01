"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { groupTasksByStatus, taskStatuses, type TaskBoardItem } from "./task-board.utils";

export function TaskBoard({ tasks, basePath }: { tasks: TaskBoardItem[]; basePath: string }) {
  const [view, setView] = useState<"kanban" | "table">("kanban");

  const grouped = useMemo(() => groupTasksByStatus(tasks), [tasks]);

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <div className="flex items-center gap-2">
          <Button variant={view === "kanban" ? "secondary" : "ghost"} onClick={() => setView("kanban")}>
            Kanban
          </Button>
          <Button variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}>
            Table
          </Button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {taskStatuses.map((status) => (
            <Card key={status} className="grid gap-2 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700">{status}</h3>
              {grouped[status].length === 0 ? <p className="text-xs text-slate-500">No tasks</p> : null}
              {grouped[status].map((task) => (
                <a
                  key={task.id}
                  href={`${basePath}/tasks/${task.id}`}
                  className="rounded-md border border-slate-200 bg-white p-3 transition hover:border-blue-400"
                >
                  <p className="text-sm font-medium">{task.title}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <Badge>{task.priority}</Badge>
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
                  </div>
                </a>
              ))}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <a href={`${basePath}/tasks/${task.id}`} className="font-medium text-blue-700 hover:underline">
                      {task.title}
                    </a>
                  </td>
                  <td className="px-4 py-3">{task.status}</td>
                  <td className="px-4 py-3">{task.priority}</td>
                  <td className="px-4 py-3">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </section>
  );
}
