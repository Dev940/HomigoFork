export type RegistrationDraft = {
  basic_info: {
    full_name: string;
    email: string;
    phone: string;
    role: "seeker" | "owner" | "both";
    profile_photo?: string;
  };
  seeker_profile: {
    gender: "male" | "female" | "other";
    age: number;
    occupation: string;
    bio: string;
    preferred_locations: Array<{ location_name: string; lat?: number; lng?: number; priority: number }>;
    lifestyle_preferences: {
      smoking: "yes" | "no" | "occasionally";
      drinking: "yes" | "no" | "occasionally";
      sleep_schedule: "early_bird" | "night_owl" | "flexible";
      cleanliness: number;
    };
    roommate_preferences: {
      preferred_gender: "male" | "female" | "any";
      age_range: { min: number; max: number };
      pet_friendly: boolean;
      additional_notes: string;
    };
  };
};

const key = "homigo.registrationDraft";

export const defaultRegistrationDraft: RegistrationDraft = {
  basic_info: {
    full_name: "Cameron Williamson",
    email: "cameron@example.com",
    phone: "(555) 000-0000",
    role: "owner",
  },
  seeker_profile: {
    gender: "female",
    age: 26,
    occupation: "Senior Designer at Tech Co",
    bio: "I love calm shared homes, clean kitchens, late-night creative work, and neighborhoods with great coffee.",
    preferred_locations: [
      { location_name: "Brooklyn Heights, NY", priority: 1 },
      { location_name: "Williamsburg, NY", priority: 2 },
      { location_name: "DUMBO", priority: 3 },
    ],
    lifestyle_preferences: {
      smoking: "no",
      drinking: "no",
      sleep_schedule: "night_owl",
      cleanliness: 5,
    },
    roommate_preferences: {
      preferred_gender: "female",
      age_range: { min: 22, max: 35 },
      pet_friendly: true,
      additional_notes: "Prefer non-smoker and a tidy shared kitchen.",
    },
  },
};

export function readRegistrationDraft(): RegistrationDraft {
  const raw = localStorage.getItem(key);
  if (!raw) return defaultRegistrationDraft;
  try {
    return { ...defaultRegistrationDraft, ...JSON.parse(raw) };
  } catch {
    return defaultRegistrationDraft;
  }
}

export function saveRegistrationDraft(patch: Partial<RegistrationDraft>) {
  const current = readRegistrationDraft();
  const next = {
    ...current,
    ...patch,
    basic_info: { ...current.basic_info, ...patch.basic_info },
    seeker_profile: {
      ...current.seeker_profile,
      ...patch.seeker_profile,
      lifestyle_preferences: {
        ...current.seeker_profile.lifestyle_preferences,
        ...patch.seeker_profile?.lifestyle_preferences,
      },
      roommate_preferences: {
        ...current.seeker_profile.roommate_preferences,
        ...patch.seeker_profile?.roommate_preferences,
        age_range: {
          ...current.seeker_profile.roommate_preferences.age_range,
          ...patch.seeker_profile?.roommate_preferences?.age_range,
        },
      },
    },
  };
  localStorage.setItem(key, JSON.stringify(next));
  return next;
}
