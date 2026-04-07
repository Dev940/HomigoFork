import BottomNavBar from "../components/layout/BottomNavBar";
import SideNavBar from "../components/layout/SideNavBar";
import MaterialIcon from "../components/ui/MaterialIcon";
import { useEffect, useState } from "react";
import { useHomigoAuth } from "../components/auth/AuthContext";
import { api } from "../lib/api";
import type { DashboardData } from "../lib/types";

type PageProps = { onNavigate: (page: string) => void };

const avatars = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBt6-rU3gXyjpmDiNHE44UgI-8tu1mYS1vGj0Q4Gt8skC0GX00RpglCCQ0H1Q24ekxC7cCfHe9D0GuA6h61RG_d_MWyc7-TCiQ_44C9VDuGKmbsLygg1XSGOFllwmb2cv0ZBSUNpVZmyn1xT7Dq5BWf_MEgUCh4exZK8OsoGtScvzCYZ08R8hexS6UN0unKR9Fa4TBIrZ_5xRuMSSaKmCEKk-Zs1MqDkj4IJ5EtJyytBKoOLao4YOxIENuiYths9Z55AyqOAvQY9ork",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBrPJBF7srrmk03peLPORbgHhvaGs38hHzbbFVse5StT8eWEyekgDzx49MuN6r9aT3pGGKRKvl_pbutlq5EkZxVPSWl0Rh3QqaIhhOr9OLkFj_qdYxYYSVBi-lh0Kr_rSLJr3947bW1Mj95iIaWYrGszmWGFbo62o3tzESnj7hcPU3FCfkYFO5oPVYodzUV8NNzUBs_dhqin9Y_eQnubU9KclTfHlcZAegl76AvkCMnMMe2ivPKJ225J5AD-o9WHKr6SH8Ag6s1YJS7",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB0OmWKPHyxAyKUoVld3y2DCdvltSYhXefSN7SaGt_cEofQYxY5_8mNpwtw3TL0QWCO4zoM9NKOYqTbpVWOHJ16Lx_MFonIoQ_Hr11SycRpL37Rg2c5g-9gJjtpSIQwVkIp4GFEat7u7lrhzAHSp6ceVtwyDpudXWu1x-0rmeU3WMZM2wS9arz1U5JFTXln8sfijeKHQ3jX64VDBlIewUIm2n9KIvtRZ2536LlqJ7IuEmj0TAVnx6DAYrSQyVzI77d9E6X3k2UvhWNX",
];

export default function Dashboard({ onNavigate }: PageProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const { userId } = useHomigoAuth();

  useEffect(() => {
    api.getDashboard(userId)
      .then((response) => setDashboard(response.data))
      .catch(() => setDashboard(null));
  }, [userId]);

  return (
    <div className="flex min-h-screen bg-surface">
      <SideNavBar onNavigate={onNavigate} />
      <main className="flex-1 px-5 py-8 pb-24 md:px-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">Welcome back, {dashboard?.user?.full_name?.split(" ")[0] ?? "Julian"}.</h1>
            <p className="mt-2 text-on-surface-variant">Your dashboard has {dashboard?.matches?.length ?? 12} new matches today.</p>
          </div>
          <button onClick={() => onNavigate("profile")} className="btn-tonal hidden md:block">Edit profile</button>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div className="card">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-headline text-xl font-bold">Suggested Roommates</h3>
                <button onClick={() => onNavigate("roommates")} className="font-bold text-primary">View all</button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {["Sasha, 26", "Marcus, 28", "Elena, 24"].map((name, index) => (
                  <article key={name} className="rounded-lg bg-surface-container-low p-4">
                    <img src={avatars[index]} alt={name} className="h-40 w-full rounded-lg object-cover" />
                    <h4 className="mt-4 font-headline font-bold">{name}</h4>
                    <p className="text-sm text-on-surface-variant">{["Designer - Quiet - Early Bird", "Developer - Social - Weekend Cook", "Chef - Night Owl - Musician"][index]}</p>
                    <span className="mt-3 inline-flex rounded-full bg-secondary-fixed px-3 py-1 text-xs font-bold text-on-secondary-fixed">{[96, 94, 89][index]}% match</span>
                  </article>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="mb-5 font-headline text-xl font-bold">Recent Listings</h3>
              {["Brooklyn Loft - $1,400/mo", "Austin Studio - $950/mo", "Chicago Brownstone - $2,100/mo"].map((listing) => (
                <button key={listing} onClick={() => onNavigate("accommodation")} className="flex w-full items-center justify-between rounded-lg bg-surface-container-low p-4 text-left hover:bg-surface-container">
                  <span>{listing}</span><MaterialIcon name="arrow_forward" />
                </button>
              ))}
            </div>
          </section>
          <aside className="space-y-6">
            <div className="card bg-gradient-to-br from-secondary to-primary text-white">
              <h3 className="font-headline text-xl font-bold">Compatibility Pulse</h3>
              <p className="mt-4 text-sm text-white/90">Your profile is 94% optimized for Quiet Creative living clusters.</p>
              <div className="mt-6 h-3 rounded-full bg-white/20"><div className="h-full w-[94%] rounded-full bg-white" /></div>
            </div>
            <div className="card">
              <h3 className="mb-4 flex items-center gap-2 font-headline text-xl font-bold"><MaterialIcon name="chat" /> Messages</h3>
              {["Sarah Jenkins", "Marcus Chen"].map((name) => (
                <button key={name} onClick={() => onNavigate("messages")} className="mb-3 w-full rounded-lg bg-surface-container-low p-4 text-left">
                  <p className="font-bold">{name}</p>
                  <p className="text-xs text-on-surface-variant">I will send over the lease details soon.</p>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <BottomNavBar onNavigate={onNavigate} />
    </div>
  );
}
