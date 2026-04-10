import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";

type PageProps = { onNavigate: (page: string) => void };

export default function LoginSignup({ onNavigate }: PageProps) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  return (
    <main className="grid min-h-screen bg-surface md:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-primary-container p-12 text-white md:flex md:flex-col md:justify-between">
        <div>
          <h1 className="font-headline text-4xl font-black italic tracking-tight">Homigo</h1>
          <p className="mt-4 max-w-xs font-headline text-lg text-white/80">Where curated people meet curated places.</p>
        </div>
        <div className="rounded-lg bg-white p-6 text-on-surface shadow-ambient">
          <p className="font-headline text-lg font-bold italic text-primary">"The perfect roommate is curated."</p>
          <p className="mt-2 text-sm text-on-surface-variant">Sarah K., Resident since 2023</p>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <button onClick={() => onNavigate("landing")} className="mb-10 font-headline text-2xl font-black italic text-primary md:hidden">Homigo</button>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight">{mode === "sign-in" ? "Welcome Back" : "Create Your Account"}</h2>
          <p className="mt-2 text-on-surface-variant">Clerk handles secure sign-in, sign-up, sessions, and OAuth for Homigo.</p>
          <div className="mt-6 grid grid-cols-2 rounded-full bg-surface-container-high p-1 text-sm font-bold">
            <button onClick={() => setMode("sign-in")} className={`rounded-full py-2 ${mode === "sign-in" ? "bg-white text-primary shadow-ambient" : "text-on-surface-variant"}`}>Sign in</button>
            <button onClick={() => setMode("sign-up")} className={`rounded-full py-2 ${mode === "sign-up" ? "bg-white text-primary shadow-ambient" : "text-on-surface-variant"}`}>Sign up</button>
          </div>
          {clerkEnabled ? (
            <div className="mt-8">
              {mode === "sign-in" ? <SignIn routing="virtual" /> : <SignUp routing="virtual" />}
            </div>
          ) : (
            <form className="mt-8 space-y-5">
              <p className="rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant">Add `VITE_CLERK_PUBLISHABLE_KEY` in `Homigo/frontend/.env` to enable Clerk components.</p>
              <input type="email" placeholder="Email address" defaultValue="resident@homigo.com" />
              <input type="password" placeholder="Password" defaultValue="password" />
              <button type="button" onClick={() => onNavigate("dashboard")} className="btn-primary w-full">Continue in demo mode</button>
            </form>
          )}
          <p className="mt-8 text-center text-sm text-on-surface-variant">
            Continue onboarding? <button onClick={() => onNavigate("role")} className="font-bold text-primary">Choose role</button>
          </p>
        </div>
      </section>
    </main>
  );
}
