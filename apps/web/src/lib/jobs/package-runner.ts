import { prisma } from "@immg/db";
import { prepareApplicationPackage } from "./workflow";

export async function runPackageGeneration(
  userId: string,
  applicationId: string,
  locale: "fr" | "en",
): Promise<void> {
  try {
    await prepareApplicationPackage(userId, applicationId, locale);
  } catch (error) {
    const message = error instanceof Error ? error.message : "PACKAGE_FAILED";
    await prisma.application.updateMany({
      where: { id: applicationId, userId },
      data: {
        packageStatus: "failed",
        packageError: message,
      },
    });
  }
}

export async function startPackageGeneration(
  userId: string,
  applicationId: string,
  locale: "fr" | "en",
): Promise<{ started: boolean; packageStatus: string }> {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
  });
  if (!application) throw new Error("Application not found");

  if (application.packageStatus === "processing") {
    return { started: false, packageStatus: "processing" };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      packageStatus: "processing",
      packageError: null,
      packageReady: false,
    },
  });

  return { started: true, packageStatus: "processing" };
}
