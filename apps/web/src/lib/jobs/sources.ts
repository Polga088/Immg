export const JOB_SOURCES = ["manual", "job_bank", "indeed", "gmail"] as const;
export type JobSource = (typeof JOB_SOURCES)[number];

export const INTEGRATION_PROVIDERS = ["gmail", "indeed"] as const;
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

export function isJobSource(value: string): value is JobSource {
  return (JOB_SOURCES as readonly string[]).includes(value);
}
