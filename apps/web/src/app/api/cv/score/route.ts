import { scoreATS } from "@/lib/ats/scorer";
import {
  extractResumeText,
  isAllowedResumeFilename,
  parseResumeText,
  ResumeParseError,
} from "@/lib/ats/parse-resume";
import { prisma } from "@immg/db";
import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const userId = await requireSessionUserId();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const textInput = formData.get("text") as string | null;
    const jobDescription = formData.get("jobDescription") as string | null;

    let parsed: string;
    let filename = "resume.txt";

    if (file && file.size > 0) {
      filename = file.name;
      if (!isAllowedResumeFilename(filename)) {
        return Response.json(
          { error: "unsupported_type", code: "unsupported" },
          { status: 400 },
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      parsed = await extractResumeText(buffer, filename);
    } else if (textInput?.trim()) {
      parsed = parseResumeText(textInput, filename);
    } else {
      return Response.json({ error: "no_content", code: "empty" }, { status: 400 });
    }

    const result = scoreATS(parsed, jobDescription ?? undefined);

    await prisma.document.create({
      data: {
        userId,
        type: "cv",
        filename,
        content: parsed,
      },
    });

    return Response.json({
      ...result,
      filename,
      parsedLength: parsed.length,
      extractedText: parsed,
    });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    if (error instanceof ResumeParseError) {
      return Response.json(
        { error: error.code, message: error.message, code: error.code },
        { status: 400 },
      );
    }
    console.error(error);
    return Response.json({ error: "analysis_failed", code: "parse_failed" }, { status: 500 });
  }
}
