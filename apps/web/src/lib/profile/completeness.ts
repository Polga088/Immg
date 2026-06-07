type ProfileFields = {
  age: number | null;
  educationLevel: string | null;
  firstLanguageClb: number | null;
  targetProgram: string | null;
};

export function isProfileComplete(profile: ProfileFields): boolean {
  return (
    profile.age != null &&
    profile.age >= 18 &&
    profile.age <= 65 &&
    !!profile.educationLevel &&
    profile.firstLanguageClb != null &&
    profile.firstLanguageClb >= 4 &&
    !!profile.targetProgram
  );
}

export function profileCompletionPercent(profile: ProfileFields): number {
  const fields = [
    profile.age != null && profile.age >= 18,
    !!profile.educationLevel,
    profile.firstLanguageClb != null && profile.firstLanguageClb >= 4,
    !!profile.targetProgram,
  ];
  const done = fields.filter(Boolean).length;
  return Math.round((done / fields.length) * 100);
}
