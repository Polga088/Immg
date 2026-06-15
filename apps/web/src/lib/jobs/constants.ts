export const APPLICATION_STATUSES = [
  "draft",
  "ready",
  "sent",
  "interview",
  "rejected",
  "offer",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const KANBAN_COLUMNS = ["draft", "ready", "sent", "interview"] as const;
export type KanbanColumn = (typeof KANBAN_COLUMNS)[number];

export function isValidApplicationStatus(status: string): status is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(status);
}

export function isKanbanColumn(status: string): status is KanbanColumn {
  return (KANBAN_COLUMNS as readonly string[]).includes(status);
}

export const PACKAGE_STATUSES = ["idle", "processing", "ready", "failed"] as const;
export type PackageStatus = (typeof PACKAGE_STATUSES)[number];
