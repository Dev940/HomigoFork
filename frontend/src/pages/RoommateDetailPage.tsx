import { useState } from "react";
import TopNavBar from "../components/layout/TopNavBar";
import MaterialIcon from "../components/ui/MaterialIcon";
import ProfileGate from "../components/ui/ProfileGate";
import { ROOMMATES, PROPERTIES } from "../lib/mockData";

type PageProps = { onNavigate: (page: string) => void };

const SCHEDULE_LABEL: Record<string, string> = {
  early_bird: "Early Bird",
  night_owl: "Night Owl",
  flexible: "Flexible",
};
const SCHEDULE_ICON: Record<string, string> = {
  early_bird: "wb_sunny",
  night_owl: "nightlight",
  flexible: "schedule",
};
const CLEAN_LABEL: Record<string, string> = {
  high: "Very tidy",
  medium: "Balanced",
  relaxed: "Relaxed",
};

export default function RoommateDetailPage({ onNavigate }: PageProps) {
  const roommateId = sessionStorage.getItem("homigo_selected_roommate");
  const profile = ROOMMATES.find((r) => r.id === roommateId);
  const linkedProperty = profile?.propertyId
    ? PROPERTIES.find((p) => p.id === profile.propertyId)
    : undefined;

  const [saved, setSaved] = useState(false);

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col bg-surface">
        <TopNavBar onNavigate={onNavigate} />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 pt-20 text-center">
          <MaterialIcon name="person_search" className="text-6xl text-outline" />
          <p className="font-headline text-xl font-bold text-on-surface">Profile not found</p>
          <button onClick={() => onNavigate("roommates")} className="btn-primary">
            Back to roommates
          </button>
        </main>
      </div>
    );
  }

  const openLinkedProperty = () => {
    if (!linkedProperty) return;
    sessionStorage.setItem("homigo_selected_property", linkedProperty.id);
    onNavigate("property");
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopNavBar onNavigate={onNavigate} />

      <main className="mx-auto max-w-5xl px-4 pt-24 sm:px-6">

        {/* Back breadcrumb */}
        <button
          onClick={() => onNavigate("roommates")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary"
        >
          <MaterialIcon name="arrow_back" className="text-sm" /> All Roommates
        </button>

        <div className="grid gap-8 lg:grid-cols-12">

          {/* ── Left column ── */}
          <div className="space-y-6 lg:col-span-8">

            {/* Hero card */}
            <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-ambient">
              {/* Gradient banner */}
              <div className="relative h-36 bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/10">
                <button
                  onClick={() => setSaved((v) => !v)}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur-sm hover:bg-white"
                  aria-label="Save profile"
                >
                  <MaterialIcon
                    name="favorite"
                    className={`text-xl transition ${saved ? "text-red-500" : "text-outline"}`}
                    fill={saved}
                  />
                </button>
                {/* Compatibility badge */}
                <span
                  className={`absolute right-4 bottom-4 rounded-full px-3 py-1 text-xs font-black shadow ${
                    profile.compatibility >= 90 ? "bg-secondary text-white" : "bg-secondary-fixed text-on-secondary-fixed"
                  }`}
                >
                  {profile.compatibility}% match
                </span>
              </div>

              {/* Avatar + identity */}
              <div className="px-6 pb-6">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="-mt-12 h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg"
                />
                <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
                      {profile.name}, {profile.age}
                    </h1>
                    <p className="mt-0.5 font-semibold text-primary">{profile.occupation} · {profile.company}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-on-surface-variant">
                      <MaterialIcon name="location_on" className="text-sm" />
                      {profile.city}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.lifestyle.smoking === false && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Non-smoker</span>
                    )}
                    <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold capitalize text-on-surface-variant">
                      {profile.gender}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget & gender preference */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-primary/10 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Monthly Budget</p>
                <p className="mt-1 font-headline text-2xl font-black text-primary">
                  ₹{profile.budget.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-on-surface-variant">per month</p>
              </div>
              <div className="rounded-2xl bg-secondary/10 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary">Looking for</p>
                <p className="mt-1 font-headline text-2xl font-black capitalize text-secondary">
                  {profile.preferredGender === "any" ? "Anyone" : profile.preferredGender}
                </p>
                <p className="text-xs text-on-surface-variant">flatmate</p>
              </div>
            </div>

            {/* Bio */}
            <div className="rounded-2xl bg-surface-container-lowest p-6">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-outline">About</h2>
              <p className="leading-relaxed text-on-surface-variant">{profile.bio}</p>
            </div>

            {/* Lifestyle */}
            <div className="rounded-2xl bg-surface-container-lowest p-6">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-outline">Lifestyle</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {/* Schedule */}
                <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MaterialIcon name={SCHEDULE_ICON[profile.lifestyle.schedule]} className="text-sm text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Schedule</p>
                    <p className="text-sm font-semibold text-on-surface">{SCHEDULE_LABEL[profile.lifestyle.schedule]}</p>
                  </div>
                </div>

                {/* Cleanliness */}
                <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MaterialIcon name="cleaning_services" className="text-sm text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Cleanliness</p>
                    <p className="text-sm font-semibold text-on-surface">{CLEAN_LABEL[profile.lifestyle.cleanliness]}</p>
                  </div>
                </div>

                {/* Smoking */}
                <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${profile.lifestyle.smoking ? "bg-error/10" : "bg-green-100"}`}>
                    <MaterialIcon name={profile.lifestyle.smoking ? "smoking_rooms" : "smoke_free"} className={`text-sm ${profile.lifestyle.smoking ? "text-error" : "text-green-700"}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Smoking</p>
                    <p className="text-sm font-semibold text-on-surface">{profile.lifestyle.smoking ? "Smoker" : "Non-smoker"}</p>
                  </div>
                </div>

                {/* Drinking */}
                <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MaterialIcon name="sports_bar" className="text-sm text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Drinking</p>
                    <p className="text-sm font-semibold text-on-surface">{profile.lifestyle.drinking ? "Social drinker" : "Non-drinker"}</p>
                  </div>
                </div>

                {/* Pets */}
                <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MaterialIcon name="pets" className="text-sm text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Pets</p>
                    <p className="text-sm font-semibold text-on-surface">{profile.lifestyle.pets ? "Pet friendly" : "No pets"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="rounded-2xl bg-surface-container-lowest p-6">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-outline">Flatmate Preferences</h2>
              <div className="flex flex-wrap gap-2">
                {profile.preferences.map((pref) => (
                  <span
                    key={pref}
                    className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>

            {/* Looking in */}
            <div className="rounded-2xl bg-surface-container-lowest p-6">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-outline">Looking In</h2>
              <div className="flex flex-wrap gap-2">
                {profile.lookingIn.map((loc) => (
                  <span
                    key={loc}
                    className="flex items-center gap-1.5 rounded-full bg-surface-container-high px-4 py-1.5 text-sm font-semibold text-on-surface"
                  >
                    <MaterialIcon name="location_on" className="text-xs text-primary" />
                    {loc}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="rounded-2xl bg-surface-container-lowest p-6">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-outline">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full bg-surface-container-high px-4 py-1.5 text-sm font-semibold text-on-surface"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5 lg:col-span-4">

            {/* Quick stats */}
            <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-outline">At a Glance</p>
              <ul className="space-y-3 text-sm">
                {[
                  ["person", "Age", `${profile.age} years`],
                  ["wc", "Gender", profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)],
                  ["location_city", "City", profile.city],
                  ["work", "Works at", profile.company],
                  ["payments", "Budget", `₹${profile.budget.toLocaleString("en-IN")}/mo`],
                ].map(([icon, label, value]) => (
                  <li key={label} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-on-surface-variant">
                      <MaterialIcon name={icon} className="text-sm text-primary" />
                      {label}
                    </span>
                    <span className="text-right font-semibold text-on-surface">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Linked property */}
            {linkedProperty && (
              <div className="rounded-2xl border border-primary/20 bg-surface-container-lowest p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-outline">
                  Interested In This Property
                </p>
                <button
                  onClick={openLinkedProperty}
                  className="group w-full overflow-hidden rounded-xl border border-surface-container bg-surface-container-low text-left transition hover:border-primary hover:shadow-md"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={linkedProperty.images[0]}
                      alt={linkedProperty.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {linkedProperty.verified && (
                      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                        <MaterialIcon name="verified" className="text-[10px]" fill /> Verified
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6">
                      <p className="font-headline text-sm font-black text-white">
                        ₹{linkedProperty.rent.toLocaleString("en-IN")}<span className="text-[10px] font-normal">/mo</span>
                      </p>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-headline font-bold text-on-surface group-hover:text-primary line-clamp-1">
                      {linkedProperty.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-0.5 text-xs text-on-surface-variant">
                      <MaterialIcon name="location_on" className="text-[11px] text-primary" />
                      {linkedProperty.location}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1"><MaterialIcon name="bed" className="text-[12px]" /> {linkedProperty.bedrooms} Bed</span>
                      <span className="flex items-center gap-1"><MaterialIcon name="bathroom" className="text-[12px]" /> {linkedProperty.bathrooms} Bath</span>
                      <span className="flex items-center gap-1"><MaterialIcon name="star" className="text-[12px] text-amber-500" fill /> {linkedProperty.rating}</span>
                    </div>
                    <p className="mt-2 flex items-center justify-end gap-1 text-xs font-bold text-primary">
                      View property <MaterialIcon name="arrow_forward" className="text-sm" />
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* Contact CTA */}
            <ProfileGate action="message this roommate" onNavigate={onNavigate}>
              <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5">
                <p className="mb-1 font-headline font-bold text-on-surface">Interested?</p>
                <p className="mb-4 text-xs text-on-surface-variant">Send a message to connect with {profile.name.split(" ")[0]}.</p>
                <button
                  onClick={() => onNavigate("messages")}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <MaterialIcon name="chat" className="text-sm" /> Send Message
                </button>
              </div>
            </ProfileGate>
          </div>
        </div>
      </main>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-surface-container bg-white/90 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={profile.avatar} alt={profile.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate font-headline font-bold text-on-surface">{profile.name}</p>
              <p className="text-xs text-on-surface-variant">₹{profile.budget.toLocaleString("en-IN")}/mo · {profile.city}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              onClick={() => setSaved((v) => !v)}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${saved ? "bg-red-50 text-red-500" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"}`}
            >
              <MaterialIcon name="favorite" className="text-sm" fill={saved} />
              {saved ? "Saved" : "Save"}
            </button>
            <ProfileGate action="message this roommate" onNavigate={onNavigate}>
              <button
                onClick={() => onNavigate("messages")}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <MaterialIcon name="chat" className="text-sm" /> Message
              </button>
            </ProfileGate>
          </div>
        </div>
      </div>
    </div>
  );
}
