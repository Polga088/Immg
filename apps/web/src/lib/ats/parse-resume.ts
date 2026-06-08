const MAX_FILE_BYTES = 5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "txt", "md"]);

export class ResumeParseError extends Error {
  constructor(
    message: string,
    readonly code: "unsupported" | "empty" | "too_large" | "parse_failed",
  ) {
    super(message);
    this.name = "ResumeParseError";
  }
}

export function getResumeExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function isAllowedResumeFilename(filename: string): boolean {
  return ALLOWED_EXTENSIONS.has(getResumeExtension(filename));
}

export async function extractResumeText(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  if (buffer.byteLength > MAX_FILE_BYTES) {
    throw new ResumeParseError(
      "File exceeds 5 MB limit",
      "too_large",
    );
  }

  const ext = getResumeExtension(filename);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new ResumeParseError(
      `Unsupported file type: .${ext || "unknown"}`,
      "unsupported",
    );
  }

  let text: string;

  try {
    if (ext === "pdf") {
      text = await extractPdf(buffer);
    } else if (ext === "docx") {
      text = await extractDocx(buffer);
    } else {
      text = buffer.toString("utf8");
    }
  } catch (error) {
    if (error instanceof ResumeParseError) throw error;
    throw new ResumeParseError(
      error instanceof Error ? error.message : "Failed to parse resume",
      "parse_failed",
    );
  }

  const normalized = normalizeResumeText(text);
  if (normalized.length < 20) {
    throw new ResumeParseError(
      "Could not extract enough text from the file",
      "empty",
    );
  }

  return normalized;
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value ?? "";
}

function normalizeResumeText(text: string): string {
  return text
    .replace(/\0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** @deprecated Use extractResumeText for binary uploads */
export function parseResumeText(content: string, filename: string): string {
  const ext = getResumeExtension(filename);
  if (ext === "txt" || ext === "md" || !ext) {
    return normalizeResumeText(content);
  }
  return normalizeResumeText(content);
}
