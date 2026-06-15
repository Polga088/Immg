import { prisma } from "@immg/db";
import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";
import { getGoogleOAuthConfig } from "@/lib/jobs/gmail";
import { listJobIntegrations } from "@/lib/jobs/service";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const integrations = await listJobIntegrations(userId);
    const google = getGoogleOAuthConfig();

    const providers = [
      {
        provider: "gmail",
        connected: integrations.some((i) => i.provider === "gmail"),
        accountEmail:
          integrations.find((i) => i.provider === "gmail")?.accountEmail ?? null,
        configured: google.configured,
        connectHint:
          "Un clic — vous vous connectez avec votre compte Google. Immg ne voit jamais votre mot de passe.",
      },
      {
        provider: "indeed",
        connected: integrations.some((i) => i.provider === "indeed"),
        accountEmail: null,
        configured: true,
        note: "Via alertes Gmail (Indeed n'a pas d'API publique)",
        connectHint: "Connectez Gmail pour importer automatiquement vos alertes Indeed.",
      },
      {
        provider: "job_bank",
        connected: true,
        accountEmail: null,
        configured: true,
        note: "Recherche intégrée Job Bank Canada",
        connectHint: "Actif pour tous les utilisateurs — aucune connexion requise.",
      },
    ];

    return Response.json({ integrations: providers });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return Response.json({ error: "Failed to load integrations" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await requireSessionUserId();
    const { provider } = (await req.json()) as { provider?: string };
    if (!provider) {
      return Response.json({ error: "provider required" }, { status: 400 });
    }

    await prisma.jobIntegration.deleteMany({ where: { userId, provider } });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return Response.json({ error: "Disconnect failed" }, { status: 500 });
  }
}
