import TopNavBar from "../components/layout/TopNavBar";
import MaterialIcon from "../components/ui/MaterialIcon";
import { useEffect, useState } from "react";
import { useHomigoAuth } from "../components/auth/AuthContext";
import { api } from "../lib/api";
import type { Property } from "../lib/types";

type PageProps = { onNavigate: (page: string) => void };
type ListingCard = readonly [title: string, area: string, price: string, image: string, id: number];

const listings = [
  ["Skyline View Penthouse", "Brooklyn, NY", "$2,850/mo", "https://lh3.googleusercontent.com/aida-public/AB6AXuDpi-niPr-N0NfcMsOBqWNzKmj4HD9jAJNogMFnzlqYStK_yfAdCA-ydfreOH-C-JHiHTJwbmQyASL9JizpJ2JO0eNy2ysApcnQh-YmH9cDq3qHSh52xtgoWoqVJ4yudUMNHoGo1MvcBG1rpmRFF6gcXRkxS69Wi_XMifLaVfR5y9FQwKvKPbf3scs1F8NTuE3GqThRakGXS4fqg22wtxGiRx39qfoL7VdjRXtSnaofK4dkDEDdbYQ9zjfsS0_rtDAqBKyNEPZQV8lm"],
  ["The Artist's Haven", "Williamsburg, NY", "$1,950/mo", "https://lh3.googleusercontent.com/aida-public/AB6AXuD6NRdApVPPytQl9OQx7-_KAGInyleKYzMQS-napkulVveXHD_Ykhhbeq50hXlFTc3IGmQjtnADJJYAo45dpnQfzRFc69pfabf1Dh3oMVlAAB3fQDdtjbvSpnI8yxg_AoU03-BpcOSkKBarycZDFoUdkrH012EA3-ftwNRMY1WRkJW7zANVx9o6oPDdXbQsPN95Dv-cXb8i4Bgw3AGwJjKbFHKaUf90y5k4CnLCTsvybluJlw6L60SutQeGtM5StW__jEWY4Wr4KoVt"],
  ["Classic Heritage Brownstone", "Park Slope, NY", "$2,100/mo", "https://lh3.googleusercontent.com/aida-public/AB6AXuAz9YYovWOi2BH3w8WMoBAhWqdX6aWI3JNjNpl2SCQswbp8yFfjI4FTWy291rslPMthAlH_uGB4ktqa7-zEhfLyWK61sRjL45ETVAKlY9fuds_zAW25HmmwbgKjBBzJPCG2LyK9sOVWg9qpbEyp4JwUIh91fsslpYcc7CQv32ST36pSs48PGpvydAvdSM4lkrAnymsfyr3iRKoqkVnd-8EckyIAAILmBBITd4bFTwAh22_A9nnPDBQ3FEidM45d1QhalkUgsMNP2dts"],
  ["The Nexus Urban Suite", "Dumbo, NY", "$2,450/mo", "https://lh3.googleusercontent.com/aida-public/AB6AXuCk8ntFpgAG14o5-VOYGcc0VtU0s4o8dG4CiyL8LEee70GQrz2C14HtxRQzfybGlZGr0ZgvJRUZ7d0S767-m2REIT3CKpCsfkCU5j2PtiqbPFMp8rsEjR9L6aWZ7hiqbj1JGomS8AaWtPlm17t026IfhujrsFUBCxXWNEo9GzP0a-mbVZAFkNhClDKWMwwYpDl9F74mOYNWdSX_eNY0f-mTLrYdWjC7bC4U-hIzajUJojp0vEe_b-qLS7DWvqOyqbZ66INq-aHF7bZJ"],
];

export default function AccommodationSearch({ onNavigate }: PageProps) {
  const [remoteListings, setRemoteListings] = useState<Property[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { userId } = useHomigoAuth();
  const activeListings: ListingCard[] = remoteListings.length
    ? remoteListings.map((property) => [
        property.title,
        [property.city, property.state].filter(Boolean).join(", ") || property.address || "Verified location",
        `₹${Number(property.monthly_rent).toLocaleString("en-IN")}/mo`,
        property.cover_image || property.property_images?.[0]?.image_url || listings[0][3],
        property.property_id,
      ])
    : listings.map(([title, area, price, image], index) => [title, area, price, image, index]);

  useEffect(() => {
    api.searchProperties({ limit: 12 })
      .then((response) => setRemoteListings(response.data ?? []))
      .catch((error: Error) => setLoadError(error.message));
  }, []);

  return (
    <>
      <TopNavBar onNavigate={onNavigate} />
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-28">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight">Available Curations</h1>
            <p className="mt-1 font-medium text-on-surface-variant/70">248 premium listings found in Brooklyn, NY</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {["Brooklyn", "$900-$3,000", "Pet friendly", "Verified"].map((chip) => <span key={chip} className="chip">{chip}</span>)}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="grid gap-6 md:grid-cols-2">
            {loadError && <p className="md:col-span-2 rounded-lg bg-error-container p-4 text-sm text-on-surface">Using demo listings because the API is not reachable: {loadError}</p>}
            {activeListings.map(([title, area, price, image, id]) => (
              <article key={title} className="group card overflow-hidden p-0">
                <img src={image} alt={title} className="h-56 w-full object-cover" />
                <div className="p-6">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div><h3 className="font-headline text-lg font-bold group-hover:text-primary">{title}</h3><p className="text-sm text-on-surface-variant">{area}</p></div>
                    <p className="font-headline font-black text-primary">{price}</p>
                  </div>
                  <div className="mb-5 flex gap-2 text-xs text-on-surface-variant"><span>2 beds</span><span>Verified</span><span>4.8 safety</span></div>
                  <button onClick={() => {
                    if (typeof id === "number" && remoteListings.length) {
                      api.createInquiry({ user_id: userId, property_id: id, message: `I am interested in ${title}.` }).catch(() => undefined);
                    }
                    onNavigate("messages");
                  }} className="btn-tonal w-full">Ask about this home</button>
                </div>
              </article>
            ))}
          </section>
          <aside className="card h-fit bg-primary/10">
            <MaterialIcon name="map" className="text-4xl text-primary" fill />
            <h3 className="mt-4 font-headline text-xl font-bold">Neighborhood Pulse</h3>
            <p className="mt-3 text-sm leading-relaxed text-teal-950/60">You are viewing Brooklyn's top-rated residential zones. Average safety score is 4.8/5.</p>
          </aside>
        </div>
      </main>
    </>
  );
}
