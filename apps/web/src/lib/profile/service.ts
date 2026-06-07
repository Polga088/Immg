import { prisma } from "@immg/db";
import { calculateCRS } from "@/lib/crs/calculator";
import type { EducationLevel } from "@/lib/crs/calculator";

export async function getOrCreateProfile(userId: string) {
  return prisma.immigrationProfile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function updateProfile(
  userId: string,
  data: {
    age?: number;
    educationLevel?: string;
    firstLanguageClb?: number;
    secondLanguageClb?: number;
    foreignWorkYears?: number;
    canadianWorkYears?: number;
    hasCanadianEducation?: boolean;
    hasCanadianJobOffer?: boolean;
    hasSiblingInCanada?: boolean;
    nocCode?: string;
    settlementFunds?: number;
    targetProgram?: string;
    crsScore?: number;
  },
) {
  const profile = await prisma.immigrationProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  return profile;
}

export async function saveProfileWithCRS(
  userId: string,
  data: Parameters<typeof updateProfile>[1],
) {
  const profile = await updateProfile(userId, data);
  const crs = calculateCRS(profileToCRSInput(profile));
  const updated = await updateProfile(userId, { crsScore: crs.total });
  return { profile: updated, crs };
}

export function profileToCRSInput(profile: {
  age: number | null;
  educationLevel: string | null;
  firstLanguageClb: number | null;
  secondLanguageClb: number | null;
  foreignWorkYears: number;
  canadianWorkYears: number;
  hasCanadianEducation: boolean;
  hasCanadianJobOffer: boolean;
  hasSiblingInCanada: boolean;
}) {
  return {
    age: profile.age ?? 30,
    educationLevel: (profile.educationLevel ?? "bachelors") as EducationLevel,
    firstLanguageClb: profile.firstLanguageClb ?? 7,
    secondLanguageClb: profile.secondLanguageClb ?? 0,
    foreignWorkYears: profile.foreignWorkYears,
    canadianWorkYears: profile.canadianWorkYears,
    hasCanadianEducation: profile.hasCanadianEducation,
    hasCanadianJobOffer: profile.hasCanadianJobOffer,
    hasSiblingInCanada: profile.hasSiblingInCanada,
  };
}
