export type ProcedureProgram = "express_entry" | "pnp";

export interface ChecklistStepDef {
  key: string;
  documents?: string[];
}

export const PROCEDURE_STEPS: Record<ProcedureProgram, ChecklistStepDef[]> = {
  express_entry: [
    { key: "language_test", documents: ["language_test_results"] },
    { key: "education_assessment", documents: ["eca_report"] },
    { key: "gather_documents", documents: ["passport", "work_references", "police_certificate"] },
    { key: "create_express_entry_profile" },
    { key: "submit_profile" },
    { key: "wait_for_ita" },
    { key: "medical_exam", documents: ["medical_exam"] },
    { key: "submit_application", documents: ["proof_of_funds", "employment_letter"] },
  ],
  pnp: [
    { key: "check_province_criteria" },
    { key: "create_express_entry_profile" },
    { key: "apply_to_province", documents: ["province_application"] },
    { key: "receive_nomination", documents: ["nomination_certificate"] },
    { key: "update_crs_score" },
    { key: "wait_for_ita" },
    { key: "gather_documents", documents: ["passport", "work_references", "police_certificate"] },
    { key: "submit_application", documents: ["proof_of_funds", "employment_letter"] },
  ],
};

export function getProgramSteps(program: ProcedureProgram) {
  return PROCEDURE_STEPS[program] ?? PROCEDURE_STEPS.express_entry;
}

export function resolveProgram(value: string | null | undefined): ProcedureProgram {
  return value === "pnp" ? "pnp" : "express_entry";
}
