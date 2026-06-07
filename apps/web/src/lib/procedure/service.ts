import { prisma } from "@immg/db";
import {
  getProgramSteps,
  resolveProgram,
  type ProcedureProgram,
} from "@/lib/procedure/checklist";

export async function ensureProcedureSteps(userId: string, program: ProcedureProgram) {
  const steps = getProgramSteps(program);

  await Promise.all(
    steps.map((step) =>
      prisma.procedureStep.upsert({
        where: {
          userId_program_stepKey: {
            userId,
            program,
            stepKey: step.key,
          },
        },
        update: {},
        create: {
          userId,
          program,
          stepKey: step.key,
        },
      }),
    ),
  );
}

export async function getProcedureChecklist(userId: string, targetProgram?: string | null) {
  const program = resolveProgram(targetProgram);
  await ensureProcedureSteps(userId, program);

  const steps = await prisma.procedureStep.findMany({
    where: { userId, program },
    orderBy: { createdAt: "asc" },
  });

  const defs = getProgramSteps(program);
  const completed = steps.filter((s) => s.completed).length;
  const total = defs.length;

  const pendingDocuments = defs
    .filter((def) => {
      const step = steps.find((s) => s.stepKey === def.key);
      return !step?.completed && def.documents?.length;
    })
    .flatMap((def) => def.documents ?? []);

  return {
    program,
    steps: defs.map((def) => {
      const record = steps.find((s) => s.stepKey === def.key);
      return {
        stepKey: def.key,
        completed: record?.completed ?? false,
        completedAt: record?.completedAt?.toISOString() ?? null,
        documents: def.documents ?? [],
      };
    }),
    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    completed,
    total,
    pendingDocuments: [...new Set(pendingDocuments)],
  };
}

export async function toggleProcedureStep(
  userId: string,
  program: ProcedureProgram,
  stepKey: string,
  completed: boolean,
) {
  await ensureProcedureSteps(userId, program);

  return prisma.procedureStep.update({
    where: {
      userId_program_stepKey: { userId, program, stepKey },
    },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  });
}
