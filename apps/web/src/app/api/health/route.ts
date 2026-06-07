import { checkOllamaHealth } from "@/lib/ai/ollama";
import { prisma } from "@immg/db";

export async function GET() {
  let database = false;
  let ollama = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch {
    database = false;
  }

  ollama = await checkOllamaHealth();

  const status = database && ollama ? "ok" : "degraded";

  return Response.json({
    status,
    database,
    ollama,
    timestamp: new Date().toISOString(),
  });
}
