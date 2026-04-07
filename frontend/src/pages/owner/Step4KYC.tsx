import ProgressStepper from "../../components/ui/ProgressStepper";
import MaterialIcon from "../../components/ui/MaterialIcon";

type PageProps = { onNavigate: (page: string) => void };

export default function Step4KYC({ onNavigate }: PageProps) {
  return (
    <main className="min-h-screen bg-surface px-6 py-8">
      <div className="mx-auto max-w-6xl"><ProgressStepper current={4} total={5} /></div>
      <section className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6"><h1 className="font-headline text-5xl font-extrabold tracking-tight">Identity Verification</h1><p className="text-lg text-on-surface-variant">Verify your identity to keep Homigo trusted for every resident.</p>{["Government ID", "Address Proof"].map((title) => <div key={title} className="card"><h3 className="font-headline text-xl font-bold">{title}</h3><p className="mt-1 text-sm text-on-surface-variant">{title === "Government ID" ? "Aadhar Card, Passport, or Driver's License" : "Utility bill, rent agreement, or bank statement"}</p><div className="mt-5 rounded-lg bg-surface-container-low p-8 text-center"><MaterialIcon name="cloud_upload" className="text-4xl text-primary" /><p className="mt-2 font-semibold">Click to upload document</p></div></div>)}<button onClick={() => onNavigate("owner5")} className="btn-primary">Submit verification</button></div>
        <aside className="card h-fit"><h3 className="font-headline text-lg font-bold">Liveness Check</h3><div className="mt-5 grid h-72 place-items-center rounded-lg bg-inverse-surface text-white"><p className="rounded-lg bg-slate-900/60 px-4 py-2 text-xs font-medium">Position your face inside the frame and blink</p></div></aside>
      </section>
    </main>
  );
}
