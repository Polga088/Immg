import { prisma } from "@immg/db";
import { DEMO_USER_ID } from "@/lib/utils";
import type { EducationLevel } from "@/lib/crs/calculator";

export async function ensureDemoUser() {
  return prisma.user.upsert({
    where: { email: "demo@immg.local" },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: "demo@immg.local",
      name: "Demo User",
      locale: "fr",
    },
  });
}

export async function getOrCreateProfile(userId: string = DEMO_USER_ID) {
  await ensureDemoUser();

  return prisma.immigrationProfile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      age: 30,
      educationLevel: "bachelors",
      firstLanguageClb: 8,
      secondLanguageClb: 5,
      foreignWorkYears: 3,
      canadianWorkYears: 0,
      hasCanadianEducation: false,
      hasCanadianJobOffer: false,
      hasSiblingInCanada: false,
      targetProgram: "express_entry",
    },
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
    crsScore?: number;
  },
) {
  await ensureDemoUser();

  const profile = await prisma.immigrationProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  return profile;
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
