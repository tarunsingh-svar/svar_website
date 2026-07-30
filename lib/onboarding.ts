/**
 * Onboarding options. Values are stored verbatim in user_details, so they must
 * stay identical to the mobile screens in svar_ai/lib/modules/user_details or
 * the same person will look like two different segments.
 */

export const AGE_OPTIONS = [
  "Less than 18 Years",
  "18 - 24 years",
  "24 - 40 years",
  "40 - 50 years",
  "50 - 60 years",
  "60 + Years",
] as const;

export const PROFESSION_OPTIONS = [
  "Professional",
  "Content Creator",
  "Student",
  "Founder / C-level Executive",
  "Medical Professional",
  "Service",
] as const;

export const USAGE_OPTIONS = [
  "Meetings & Work",
  "Content Creation & Ideas",
  "Personal Notes",
  "Social Media Posts",
  "Journaling",
  "Take Lecture Notes",
] as const;
