import ProgressStepper from "../../components/ui/ProgressStepper";

type PageProps = { onNavigate: (page: string) => void };

export default function Step3PropertySetup({ onNavigate }: PageProps) {
  return (
    <main className="min-h-screen bg-surface px-6 py-8">
      <div className="mx-auto max-w-6xl"><ProgressStepper current={3} total={5} /></div>
      <form className="mx-auto mt-10 max-w-5xl space-y-6">
        <div><h1 className="font-headline text-4xl font-extrabold">Build your listing</h1><p className="mt-2 text-on-surface-variant">Details about your space help us find the perfect match.</p></div>
        <section className="card"><h2 className="mb-5 font-headline text-2xl font-bold">Property Details</h2><div className="grid gap-4 md:grid-cols-2"><input placeholder="Listing title" defaultValue="Sunlit Brooklyn Loft" /><select defaultValue="Private room"><option>Private room</option><option>Full apartment</option></select></div></section>
        <section className="card"><h2 className="mb-5 font-headline text-2xl font-bold">Location</h2><input placeholder="Address" defaultValue="Williamsburg, Brooklyn, NY" /></section>
        <section className="card"><h2 className="mb-5 font-headline text-2xl font-bold">Pricing & Availability</h2><div className="grid gap-4 md:grid-cols-2"><input placeholder="Monthly rent" defaultValue="$1,950" /><input placeholder="Available from" defaultValue="May 1, 2026" /></div></section>
        <section className="card"><h2 className="mb-5 font-headline text-2xl font-bold">Amenities & Features</h2><div className="flex flex-wrap gap-3">{["Wi-Fi", "Laundry", "Furnished", "Balcony", "Gym", "Pet friendly"].map((x) => <span key={x} className="chip">{x}</span>)}</div></section>
        <section className="card"><h2 className="mb-5 font-headline text-2xl font-bold">Photos</h2><div className="rounded-lg bg-surface-container-low p-10 text-center text-on-surface-variant">Drop listing photos here</div></section>
        <div className="flex justify-between"><button type="button" onClick={() => onNavigate("owner2")} className="btn-tonal">Back</button><button type="button" onClick={() => onNavigate("owner4")} className="btn-primary">Continue</button></div>
      </form>
    </main>
  );
}
