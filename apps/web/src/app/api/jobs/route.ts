import { after } from "next/server";
import { prisma } from "@immg/db";
import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";
import {
  createApplication,
  generateApplicationCoverLetter,
  importGmailAlert,
  importJobBankListing,
  listApplications,
  updateApplicationStatus,
} from "@/lib/jobs/service";
import { fetchGmailJobAlerts } from "@/lib/jobs/gmail";
import {
  createApplicationDraftEmail,
  prepareApplicationPackage,
} from "@/lib/jobs/workflow";
import { runPackageGeneration, startPackageGeneration } from "@/lib/jobs/package-runner";

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
    const locale = body.locale === "en" ? "en" : "fr";

    if (action === "create") {
      const app = await createApplication(userId, {
        company: body.company,
        title: body.title,
        jobUrl: body.jobUrl,
        jobDescription: body.jobDescription,
        recruiterEmail: body.recruiterEmail,
        source: body.source ?? "manual",
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
        locale,
      });
      return Response.json({ coverLetter });
    }

    if (action === "importJobBank") {
      const app = await importJobBankListing(userId, body.listing);
      return Response.json({ application: app });
    }

    if (action === "syncGmail") {
      const alerts = await fetchGmailJobAlerts(userId);
      const imported = [];
      for (const alert of alerts) {
        const app = await importGmailAlert(userId, alert);
        imported.push(app);
      }
      return Response.json({ alerts, imported });
    }

    if (action === "preparePackage") {
      const { started, packageStatus } = await startPackageGeneration(
        userId,
        body.id,
        locale,
      );

      if (started) {
        after(async () => {
          await runPackageGeneration(userId, body.id, locale);
        });
      }

      return Response.json(
        { started, packageStatus, message: "PACKAGE_PROCESSING" },
        { status: started ? 202 : 200 },
      );
    }

    if (action === "preparePackageSync") {
      const result = await prepareApplicationPackage(userId, body.id, locale);
      return Response.json(result);
    }

    if (action === "createGmailDraft") {
      const result = await createApplicationDraftEmail(userId, body.id, locale);
      return Response.json(result);
    }

    if (action === "saveRecruiter") {
      const contact = await prisma.recruiterContact.create({
        data: {
          userId,
          email: body.email,
          name: body.name,
          company: body.company,
          title: body.title,
          source: body.source ?? "manual",
          notes: body.notes,
        },
      });
      return Response.json({ contact });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    if (error instanceof Error) {
      if (error.message === "Invalid status") {
        return Response.json({ error: "Invalid status" }, { status: 400 });
      }
      if (error.message === "NO_CV") {
        return Response.json({ error: "NO_CV" }, { status: 400 });
      }
      if (error.message === "Application not found") {
        return Response.json({ error: "NOT_FOUND" }, { status: 404 });
      }
      if (error.message === "NO_RECRUITER_EMAIL") {
        return Response.json({ error: "NO_RECRUITER_EMAIL" }, { status: 400 });
      }
      if (error.message === "Gmail not connected") {
        return Response.json({ error: "GMAIL_NOT_CONNECTED" }, { status: 400 });
      }
      if (
        error.message.includes("AUTHENTICATIONFAILED") ||
        error.message.includes("Invalid credentials") ||
        error.message === "Gmail list failed"
      ) {
        return Response.json({ error: "GMAIL_AUTH_FAILED" }, { status: 401 });
      }
    }
    console.error(error);
    return Response.json({ error: "Job action failed" }, { status: 500 });
  }
}
