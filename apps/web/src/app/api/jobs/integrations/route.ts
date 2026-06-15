import { prisma } from "@immg/db";
import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";
import { connectGmailWithAppPassword } from "@/lib/jobs/gmail";
import { listJobIntegrations } from "@/lib/jobs/service";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const integrations = await listJobIntegrations(userId);
    const gmailIntegration = integrations.find((i) => i.provider === "gmail");

    const providers = [
      {
        provider: "gmail",
        connected: Boolean(gmailIntegration),
        accountEmail: gmailIntegration?.accountEmail ?? null,
        configured: true,
        connectionMethod:
          (gmailIntegration?.metadata as { connectionMethod?: string } | null)
            ?.connectionMethod ?? "app_password",
        connectHint:
          "Mot de passe d'application Google — sans validation OAuth. Vos identifiants sont chiffrés.",
      },
      {
        provider: "indeed",
        connected: Boolean(gmailIntegration),
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

export async function POST(req: Request) {
  try {
    const userId = await requireSessionUserId();
    const body = (await req.json()) as {
      provider?: string;
      email?: string;
      appPassword?: string;
    };

    if (body.provider !== "gmail") {
      return Response.json({ error: "provider required" }, { status: 400 });
    }

    if (!body.email?.trim() || !body.appPassword?.trim()) {
      return Response.json({ error: "EMAIL_AND_PASSWORD_REQUIRED" }, { status: 400 });
    }

    await connectGmailWithAppPassword(userId, body.email, body.appPassword);
    return Response.json({ ok: true, connected: true });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    if (error instanceof Error) {
      if (error.message === "INVALID_GMAIL_CREDENTIALS") {
        return Response.json({ error: "INVALID_GMAIL_CREDENTIALS" }, { status: 400 });
      }
      if (
        error.message.includes("AUTHENTICATIONFAILED") ||
        error.message.includes("Invalid credentials") ||
        error.message.includes("Failure")
      ) {
        return Response.json({ error: "GMAIL_AUTH_FAILED" }, { status: 401 });
      }
    }
    console.error("Gmail connect failed:", error);
    return Response.json({ error: "GMAIL_CONNECT_FAILED" }, { status: 500 });
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
