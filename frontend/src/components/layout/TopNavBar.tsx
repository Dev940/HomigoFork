import MaterialIcon from "../ui/MaterialIcon";

type TopNavBarProps = {
  onNavigate?: (page: string) => void;
};

const links = [
  ["Roommates", "roommates"],
  ["Homes", "accommodation"],
  ["Dashboard", "dashboard"],
  ["Messages", "messages"],
];

export default function TopNavBar({ onNavigate }: TopNavBarProps) {
  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 shadow-ambient backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <button onClick={() => onNavigate?.("landing")} className="font-headline text-2xl font-black italic tracking-tight text-primary">
          Homigo
        </button>
        <div className="hidden items-center gap-6 md:flex">
          {links.map(([label, page]) => (
            <button key={page} onClick={() => onNavigate?.(page)} className="font-headline text-sm font-bold text-on-surface-variant hover:text-primary">
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <button onClick={() => onNavigate?.("messages")} aria-label="Messages">
            <MaterialIcon name="mail" />
          </button>
          <button onClick={() => onNavigate?.("profile")} aria-label="Profile">
            <MaterialIcon name="account_circle" />
          </button>
          <button onClick={() => onNavigate?.("login")} className="hidden rounded-full bg-surface-container-high px-4 py-2 text-sm font-bold md:block">
            Sign in
          </button>
        </div>
      </nav>
    </header>
  );
}
