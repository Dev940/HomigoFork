import ProgressStepper from "../../components/ui/ProgressStepper";

type PageProps = { onNavigate: (page: string) => void };

export default function OwnerStep1Registration({ onNavigate }: PageProps) {
  return (
    <main className="min-h-screen bg-surface px-6 py-8">
      <div className="mx-auto max-w-5xl"><ProgressStepper current={1} total={5} /></div>
      <section className="mx-auto mt-10 max-w-3xl">
        <form className="card space-y-5">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight">Create your account</h1>
          <p className="text-on-surface-variant">Join our elite community of property managers and owners.</p>
          <div className="grid gap-4 md:grid-cols-2"><input placeholder="Owner name" defaultValue="Avery Stone" /><input placeholder="Company" defaultValue="Stone Living" /></div>
          <input placeholder="Work email" defaultValue="avery@stoneliving.com" /><input placeholder="Password" defaultValue="Password123" type="password" />
          <p className="text-xs font-medium text-tertiary">Strong Password: Professional security standard met.</p>
          <button type="button" onClick={() => onNavigate("owner2")} className="btn-primary w-full">Continue</button>
        </form>
      </section>
    </main>
  );
}
