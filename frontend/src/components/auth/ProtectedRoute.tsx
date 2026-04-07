import { SignedIn, SignedOut } from "@clerk/clerk-react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  clerkEnabled: boolean;
  onNavigate: (page: string) => void;
};

export default function ProtectedRoute({ children, clerkEnabled, onNavigate }: ProtectedRouteProps) {
  if (!clerkEnabled) return <>{children}</>;

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <main className="grid min-h-screen place-items-center bg-surface px-6 text-center">
          <section className="card max-w-md">
            <p className="font-headline text-3xl font-extrabold">Sign in to continue</p>
            <p className="mt-3 text-on-surface-variant">Homigo uses Clerk to keep profiles, chats, listings, and dashboards private.</p>
            <button onClick={() => onNavigate("login")} className="btn-primary mt-8 w-full">Open sign in</button>
          </section>
        </main>
      </SignedOut>
    </>
  );
}
