import { scoreATS, parseResumeText } from "@/lib/ats/scorer";
import { prisma } from "@immg/db";
import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const userId = await requireSessionUserId();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const textInput = formData.get("text") as string | null;
    const jobDescription = formData.get("jobDescription") as string | null;

    let text = textInput ?? "";
    let filename = "resume.txt";

    if (file) {
      text = await file.text();
      filename = file.name;
    }

    if (!text.trim()) {
      return Response.json({ error: "No resume content" }, { status: 400 });
    }

    const parsed = parseResumeText(text, filename);
    const result = scoreATS(parsed, jobDescription ?? undefined);

    await prisma.document.create({
      data: {
        userId,
        type: "cv",
        filename,
        content: parsed,
      },
    });

    return Response.json({ ...result, parsedLength: parsed.length });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    console.error(error);
    return Response.json({ error: "CV analysis failed" }, { status: 500 });
  }
}
