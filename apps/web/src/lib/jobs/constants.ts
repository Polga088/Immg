export const APPLICATION_STATUSES = [
  "draft",
  "ready",
  "sent",
  "interview",
  "rejected",
  "offer",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const KANBAN_COLUMNS: ApplicationStatus[] = [
  "draft",
  "ready",
  "sent",
  "interview",
];

export function isValidApplicationStatus(status: string): status is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(status);
}
