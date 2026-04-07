import ProgressStepper from "../../components/ui/ProgressStepper";
import MaterialIcon from "../../components/ui/MaterialIcon";

type PageProps = { onNavigate: (page: string) => void };

export default function Step2Profile({ onNavigate }: PageProps) {
  return (
    <main className="min-h-screen bg-surface px-6 py-8">
      <div className="mx-auto max-w-6xl"><ProgressStepper current={2} total={5} /></div>
      <section className="mx-auto mt-10 grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px]">
        <form className="card space-y-5"><h1 className="font-headline text-4xl font-extrabold">Build your host profile</h1><p className="text-on-surface-variant">Introduce yourself to potential guests and tenants.</p><div className="rounded-lg bg-surface-container-low p-8 text-center"><MaterialIcon name="cloud_upload" className="text-5xl text-primary" /><p className="mt-3 text-sm font-semibold">Click to upload or drag and drop</p></div><textarea rows={5} defaultValue="We manage thoughtfully designed homes for people who value comfort, location, and reliable support." /><button type="button" onClick={() => onNavigate("owner3")} className="btn-primary w-full">Continue</button></form>
        <aside className="card h-fit text-center"><h3 className="font-headline text-lg font-bold">Live Preview</h3><div className="mx-auto mt-6 grid h-24 w-24 place-items-center rounded-full bg-primary/10 text-3xl font-black text-primary">A</div><p className="mt-4 font-bold">Avery Stone</p><p className="text-sm text-on-surface-variant">Individual Host - San Francisco, CA</p></aside>
      </section>
    </main>
  );
}
