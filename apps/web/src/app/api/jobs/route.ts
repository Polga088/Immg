import { prisma } from "@immg/db";
import { generateWithProvider } from "@/lib/ai/provider";
import { loadPrompt } from "@/agents/prompts/loader";
import { DEMO_USER_ID } from "@/lib/utils";
import { ensureDemoUser } from "@/lib/profile/service";

export async function GET() {
  await ensureDemoUser();
  const applications = await prisma.application.findMany({
    where: { userId: DEMO_USER_ID },
    orderBy: { updatedAt: "desc" },
  });
  return Response.json({ applications });
}

export async function POST(req: Request) {
  try {
    await ensureDemoUser();
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const app = await prisma.application.create({
        data: {
          userId: DEMO_USER_ID,
          company: body.company,
          title: body.title,
          jobUrl: body.jobUrl,
          status: "draft",
        },
      });
      return Response.json({ application: app });
    }

    if (action === "updateStatus") {
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
        await prisma.application.update({
          where: { id: body.id },
          data: { coverLetter: text, status: "ready" },
        });
      }

      return Response.json({ coverLetter: text });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Job action failed" }, { status: 500 });
  }
}
