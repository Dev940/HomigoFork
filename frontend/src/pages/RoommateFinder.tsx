import TopNavBar from "../components/layout/TopNavBar";
import MaterialIcon from "../components/ui/MaterialIcon";
import { useEffect, useState } from "react";
import { useHomigoAuth } from "../components/auth/AuthContext";
import { api } from "../lib/api";
import type { RoommateMatch } from "../lib/types";

type PageProps = { onNavigate: (page: string) => void };

const people = [
  ["Sasha Miller, 26", "UX Designer at TechCorp. Early riser, clean enthusiast, occasional home chef.", "96%", "https://lh3.googleusercontent.com/aida-public/AB6AXuBmFCNF5-GpzIvV1gJK-mLNPRu7ptWU4K4WKmIiPPBPXxrlMuagVjYfTRz_HBJN7vwjDvK5DxEzV-eHeLZXgoE_TSczLI1_Z_FNWmUkxLBapVq0GNjReiCOgwfnw3zWU1uqm2rn1rgq0kCM1J3AHNchBh6hRzUdROSXhJIStKRIYerhgXNolJR_F9ybQa--Zzxwczq4YvoouCOnoXElSqJJei3LBJgsrMgHtMkUkpqndoWqpEG8nSzXhD8fPYvT9JlUlaBIs5Fqz90M"],
  ["Marcus Chen, 28", "Master's student. Night owl but respectful, into fitness and sci-fi movies.", "94%", "https://lh3.googleusercontent.com/aida-public/AB6AXuCeDXBpxLAVG3d9Cd_XLhwhNABx2OAjfgdGrpUpeF6KNfPFPaXj8lAWM265jc41h8meLK2eHjPfOl38v8zH3-gIUrpEjmoMhjVbNo6odw64BFSSMno6xLMHAxXPgQoYnUn0z2OjYIJshPAm4SHM7QqYzyzq5Lr2jvcJEXnfxyekY89b0KFXIrAmWMd01h5eWNY5EUxv119ut-Zb2BjOhkh79B4m87BV7iPCGFW1EsuCc_fhqxa1NBx8XzMWKDbAkfsxYhokk2d6Vy2u"],
  ["Elena Rodriguez, 24", "Medical resident. Prefers a quiet environment and a non-smoking household.", "89%", "https://lh3.googleusercontent.com/aida-public/AB6AXuBLwIAkzpIZH2c73-MF30qwW_eXhQkbUfSjAkvA6tqkNo3swjV2Q-B8cDjTnpfyM-7l8s_6mHGgWe-DgOL2ZVGOHmnobBYcfa7mztzoi-E3RxYyTEB1Gz0G_Pbeel9btOh1hhdo3fAQhkpFcUdFUvKSPACeJvZjVTjE5F6tvSQeILuoyedTw8BiPMVrO1MVa7pRCKVbVtW0uH02Q2qlenGkm8mhTl_wuB-sSzP_kiZKmE1agwcwYxxdqNvLidz4fAwZfeK-svWMIzLK"],
];

export default function RoommateFinder({ onNavigate }: PageProps) {
  const [matches, setMatches] = useState<RoommateMatch[]>([]);
  const { userId } = useHomigoAuth();

  useEffect(() => {
    api.getMatches(userId)
      .then((response) => setMatches(response.data ?? []))
      .catch(() => setMatches([]));
  }, [userId]);

  const renderedPeople = matches.length
    ? matches.map((match, index) => [
        match.matched_user?.full_name ?? `Matched roommate ${index + 1}`,
        match.matched_user?.email ?? "Verified Homigo member",
        `${match.compatibility ?? 90}%`,
        match.matched_user?.profile_photo || people[index % people.length][3],
      ])
    : people;

  return (
    <>
      <TopNavBar onNavigate={onNavigate} />
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-28">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Roommate Finder</p>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight">Meet Sasha Miller, 26</h1>
            <p className="mt-2 text-on-surface-variant">Product Designer - Downtown, Seattle - Active 2h ago</p>
          </div>
          <button onClick={() => onNavigate("messages")} className="btn-primary">Send message</button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-4">
            {renderedPeople.map(([name, bio, score, photo]) => (
              <article key={name} className="card">
                <img src={photo} alt={name} className="h-48 w-full rounded-lg object-cover" />
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div><h3 className="font-headline text-lg font-bold">{name}</h3><p className="mt-1 text-xs text-on-surface-variant">{bio}</p></div>
                  <span className="rounded-full bg-secondary-fixed px-3 py-1 text-xs font-black text-on-secondary-fixed">{score}</span>
                </div>
              </article>
            ))}
          </aside>
          <section className="space-y-6">
            <div className="card">
              <h2 className="font-headline text-xl font-bold">About Me</h2>
              <p className="mt-4 leading-relaxed text-on-surface-variant">I am a product designer who loves calm mornings, clean shared spaces, and cooking big Sunday breakfasts. Looking for a thoughtful roommate who enjoys a peaceful, creative home.</p>
            </div>
            <div className="card">
              <h2 className="mb-6 font-headline text-xl font-bold">Lifestyle & Habits</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {["Non-Smoker", "Social Drinker", "Early Riser", "Pet Friendly", "Quiet Weeknights", "Clean Kitchen"].map((item) => (
                  <div key={item} className="rounded-lg bg-surface-container-low p-4"><MaterialIcon name="check_circle" className="text-primary" /><p className="mt-3 font-bold">{item}</p></div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
