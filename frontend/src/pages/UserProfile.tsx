import TopNavBar from "../components/layout/TopNavBar";
import MaterialIcon from "../components/ui/MaterialIcon";

type PageProps = { onNavigate: (page: string) => void };

export default function UserProfile({ onNavigate }: PageProps) {
  return (
    <>
      <TopNavBar onNavigate={onNavigate} />
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-28">
        <section className="card overflow-hidden p-0">
          <div className="h-56 bg-gradient-to-br from-primary to-secondary" />
          <div className="-mt-16 px-6 pb-8 md:px-10">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrttYiGSnz3mIxd0tdo4A4VTkLx8NWevJbTqcdszWAt2t3SmnISydHo3l1lGLnwQUShZLyyUDlmeISfyM5oLbhom-78GQFwxKgQ49r3ZJWQI8Kns9ZQDXlo-wGzDRUpdHuFpR_RVlUpM1evFPwsCN30Ok8AoEdhNqbe9SiWgrzUXEHXNyRDDej79bYKtdll6v_zNDDFILklynWAb9QtKkS3vHK1zhhAKagt6dHIkISKg9iYGk2AE4bRkcqwEafO1w5A7lR0qabspdk" alt="Julian profile" className="h-32 w-32 rounded-full object-cover ring-4 ring-white" />
            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div><h1 className="font-headline text-4xl font-extrabold">Julian Parker</h1><p className="text-on-surface-variant">Product Designer - Seattle - Verified seeker</p></div>
              <button className="btn-primary">Edit profile</button>
            </div>
          </div>
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div className="card"><h2 className="font-headline text-xl font-bold">About</h2><p className="mt-4 leading-relaxed text-on-surface-variant">Calm, creative, tidy, and looking for a warm home with people who communicate clearly.</p></div>
            <div className="card"><h2 className="mb-4 font-headline text-xl font-bold">Preferences</h2><div className="flex flex-wrap gap-3">{["Quiet evenings", "Pet friendly", "Non-smoker", "Downtown", "Under $1,900"].map((x) => <span key={x} className="chip">{x}</span>)}</div></div>
          </section>
          <aside className="space-y-6">
            <div className="card"><MaterialIcon name="verified" className="text-primary" fill /> <span className="ml-2 font-bold">Identity verified</span></div>
            <div className="card"><p className="text-xs font-bold uppercase text-outline">Profile strength</p><p className="mt-2 font-headline text-3xl font-black text-primary">94%</p></div>
          </aside>
        </div>
      </main>
    </>
  );
}
