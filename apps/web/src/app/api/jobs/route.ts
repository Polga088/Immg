import { prisma } from "@immg/db";
import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";
import {
  createApplication,
  generateApplicationCoverLetter,
  listApplications,
  updateApplicationStatus,
} from "@/lib/jobs/service";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const applications = await listApplications(userId);
    return Response.json({ applications });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return Response.json({ error: "Failed to load applications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const app = await createApplication(userId, {
        company: body.company,
        title: body.title,
        jobUrl: body.jobUrl,
      });
      return Response.json({ application: app });
    }

    if (action === "updateStatus") {
      const app = await updateApplicationStatus(userId, body.id, body.status);
      if (!app) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
      return Response.json({ application: app });
    }

    if (action === "coverLetter") {
      const coverLetter = await generateApplicationCoverLetter(userId, {
        id: body.id,
        company: body.company,
        title: body.title,
        jobUrl: body.jobUrl,
        jobDescription: body.jobDescription,
        locale: body.locale === "en" ? "en" : "fr",
      });
      return Response.json({ coverLetter });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    if (error instanceof Error && error.message === "Invalid status") {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }
    console.error(error);
    return Response.json({ error: "Job action failed" }, { status: 500 });
  }
}
