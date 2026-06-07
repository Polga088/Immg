import { getOrCreateProfile } from "@/lib/profile/service";
import { getProcedureChecklist, toggleProcedureStep } from "@/lib/procedure/service";
import { resolveProgram, type ProcedureProgram } from "@/lib/procedure/checklist";
import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const profile = await getOrCreateProfile(userId);
    const checklist = await getProcedureChecklist(userId, profile.targetProgram);
    return Response.json(checklist);
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    console.error(error);
    return Response.json({ error: "Failed to load checklist" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await requireSessionUserId();
    const { stepKey, completed, program } = (await req.json()) as {
      stepKey: string;
      completed: boolean;
      program?: ProcedureProgram;
    };

    if (!stepKey || typeof completed !== "boolean") {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const profile = await getOrCreateProfile(userId);
    const resolvedProgram = program ?? resolveProgram(profile.targetProgram);

    await toggleProcedureStep(userId, resolvedProgram, stepKey, completed);
    const checklist = await getProcedureChecklist(userId, resolvedProgram);
    return Response.json(checklist);
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    console.error(error);
    return Response.json({ error: "Failed to update step" }, { status: 500 });
  }
}
