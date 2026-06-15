import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";
import { listRecruiterContacts } from "@/lib/jobs/service";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const contacts = await listRecruiterContacts(userId);
    return Response.json({ contacts });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return Response.json({ error: "Failed to load contacts" }, { status: 500 });
  }
}
