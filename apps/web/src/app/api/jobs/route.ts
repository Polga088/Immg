import { prisma } from "@immg/db";
import { generateWithProvider } from "@/lib/ai/provider";
import { loadPrompt } from "@/agents/prompts/loader";
import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
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
      const app = await prisma.application.create({
        data: {
          userId,
          company: body.company,
          title: body.title,
          jobUrl: body.jobUrl,
          status: "draft",
        },
      });
      return Response.json({ application: app });
    }

    if (action === "updateStatus") {
      const existing = await prisma.application.findFirst({
        where: { id: body.id, userId },
      });
      if (!existing) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
      const app = await prisma.application.update({
        where: { id: body.id },
        data: { status: body.status },
      });
      return Response.json({ application: app });
    }

    if (action === "coverLetter") {
      const { text } = await generateWithProvider({
        system: loadPrompt("job"),
        prompt: `Generate a cover letter draft for:
Company: ${body.company}
Job title: ${body.title}
Job description: ${body.jobDescription ?? "N/A"}
Candidate background: ${body.profileSummary ?? "Skilled professional seeking immigration to Canada"}

Write a professional draft to be reviewed before sending.`,
      });

      if (body.id) {
        const existing = await prisma.application.findFirst({
          where: { id: body.id, userId },
        });
        if (existing) {
          await prisma.application.update({
            where: { id: body.id },
            data: { coverLetter: text, status: "ready" },
          });
        }
      }

      return Response.json({ coverLetter: text });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    console.error(error);
    return Response.json({ error: "Job action failed" }, { status: 500 });
  }
}
