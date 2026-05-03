import { useState } from "react";
import TopNavBar from "../components/layout/TopNavBar";
import MaterialIcon from "../components/ui/MaterialIcon";
import ProfileGate from "../components/ui/ProfileGate";
import { PROPERTIES, OWNERS } from "../lib/mockData";

type PageProps = { onNavigate: (page: string) => void };

export default function PropertyDetailPage({ onNavigate }: PageProps) {
  const propertyId = sessionStorage.getItem("homigo_selected_property");
  const property = PROPERTIES.find((p) => p.id === propertyId);
  const owner = property ? OWNERS.find((o) => o.id === property.ownerId) : undefined;

  const [activeImg, setActiveImg] = useState(0);
  const [saved, setSaved] = useState(false);

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col bg-surface">
        <TopNavBar onNavigate={onNavigate} />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 pt-20 text-center">
          <MaterialIcon name="apartment" className="text-6xl text-outline" />
          <p className="font-headline text-xl font-bold text-on-surface">Property not found</p>
          <button onClick={() => onNavigate("accommodation")} className="btn-primary">
            Back to listings
          </button>
        </main>
      </div>
    );
  }

  const roomLabel =
    property.roomType === "private" ? "Private Room"
    : property.roomType === "shared" ? "Shared Room"
    : "Full Apartment";

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopNavBar onNavigate={onNavigate} />

      <main className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">

        {/* Back breadcrumb */}
        <button
          onClick={() => onNavigate("accommodation")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary"
        >
          <MaterialIcon name="arrow_back" className="text-sm" /> All Listings
        </button>

        <div className="grid gap-8 lg:grid-cols-12">

          {/* ── Left column ── */}
          <div className="lg:col-span-8">

            {/* Hero image */}
            <div className="relative overflow-hidden rounded-2xl bg-surface-container-low">
              <img
                src={property.images[activeImg]}
                alt={property.title}
                className="h-72 w-full object-cover sm:h-96"
              />

              {/* Badges */}
              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {property.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow">
                    <MaterialIcon name="verified" className="text-[11px]" fill /> Verified
                  </span>
                )}
                <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-bold capitalize text-white backdrop-blur-sm">
                  {property.propertyType}
                </span>
              </div>

              {/* Save button */}
              <button
                onClick={() => setSaved((v) => !v)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur-sm hover:bg-white"
                aria-label="Save listing"
              >
                <MaterialIcon
                  name="favorite"
                  className={`text-xl transition ${saved ? "text-red-500" : "text-outline"}`}
                  fill={saved}
                />
              </button>

              {/* Dot nav */}
              {property.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {property.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`h-2 rounded-full transition-all ${i === activeImg ? "w-8 bg-white" : "w-2 bg-white/50"}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {property.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === activeImg ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title & price */}
            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-headline text-2xl font-extrabold leading-tight tracking-tight text-on-surface md:text-3xl">
                  {property.title}
                </h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant">
                  <MaterialIcon name="location_on" className="text-sm text-primary" />
                  {property.location}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-headline text-2xl font-black text-primary">
                  ₹{property.rent.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-outline">/month</p>
              </div>
            </div>

            {/* Stats strip */}
            <div className="mt-5 grid grid-cols-4 divide-x divide-surface-container overflow-hidden rounded-2xl border border-surface-container bg-surface-container-lowest">
              {[
                { icon: "bed", label: `${property.bedrooms}`, sub: "Bedroom" },
                { icon: "bathroom", label: `${property.bathrooms}`, sub: "Bathroom" },
                { icon: "straighten", label: `${property.areaSqFt}`, sub: "sq ft" },
                { icon: "star", label: property.rating.toFixed(1), sub: "Rating" },
              ].map(({ icon, label, sub }) => (
                <div key={sub} className="flex flex-col items-center gap-0.5 py-4">
                  <MaterialIcon name={icon} className="text-xl text-primary" fill={icon === "star"} />
                  <span className="font-headline text-lg font-black text-on-surface">{label}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-outline">{sub}</span>
                </div>
              ))}
            </div>

            {/* Availability */}
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-secondary/10 px-5 py-3">
              <MaterialIcon name="calendar_month" className="text-secondary" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">Available from</p>
                <p className="font-semibold text-on-surface">
                  {new Date(property.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Room type */}
            <div className="mt-6">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-outline">Room Type</h2>
              <span className="rounded-full bg-surface-container-high px-5 py-2 text-sm font-semibold text-on-surface">
                {roomLabel}
              </span>
            </div>

            {/* About */}
            <div className="mt-6">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-outline">About this place</h2>
              <p className="leading-relaxed text-on-surface-variant">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="mt-6">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-outline">
                Amenities &amp; Features
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary"
                  >
                    <MaterialIcon name="check_circle" className="text-sm" fill />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5 lg:col-span-4">

            {/* Owner card */}
            {owner && (
              <ProfileGate action="contact the owner" onNavigate={onNavigate}>
                <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-outline">Listed by</p>
                  <div className="flex items-center gap-3">
                    <img src={owner.avatar} alt={owner.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-headline font-bold text-on-surface">{owner.name}</p>
                        {owner.verified && <MaterialIcon name="verified" className="text-sm text-primary" fill />}
                      </div>
                      <p className="text-xs text-on-surface-variant">{owner.city} · {owner.totalProperties} properties</p>
                      <div className="mt-0.5 flex items-center gap-1">
                        <MaterialIcon name="star" className="text-[12px] text-amber-500" fill />
                        <span className="text-xs font-semibold">{owner.rating}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">{owner.bio}</p>
                  <div className="mt-4 space-y-2 text-xs text-on-surface-variant">
                    <p className="flex items-center gap-2">
                      <MaterialIcon name="call" className="text-sm text-primary" />
                      {owner.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <MaterialIcon name="mail" className="text-sm text-primary" />
                      {owner.email}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate("messages")}
                    className="btn-primary mt-5 w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <MaterialIcon name="chat" className="text-sm" /> Message owner
                  </button>
                </div>
              </ProfileGate>
            )}

            {/* Quick info card */}
            <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-outline">Quick Info</p>
              <ul className="space-y-3 text-sm">
                {[
                  ["apartment", "Type", property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)],
                  ["meeting_room", "Room", roomLabel],
                  ["location_city", "City", property.city],
                  ["square_foot", "Area", `${property.areaSqFt} sq ft`],
                ].map(([icon, label, value]) => (
                  <li key={label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-on-surface-variant">
                      <MaterialIcon name={icon} className="text-sm text-primary" />
                      {label}
                    </span>
                    <span className="font-semibold text-on-surface">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-surface-container bg-white/90 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="font-headline text-lg font-black text-primary">₹{property.rent.toLocaleString("en-IN")}<span className="text-xs font-normal text-outline">/mo</span></p>
            <p className="text-xs text-on-surface-variant">{property.location}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSaved((v) => !v)}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${saved ? "bg-red-50 text-red-500" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"}`}
            >
              <MaterialIcon name="favorite" className="text-sm" fill={saved} />
              {saved ? "Saved" : "Save"}
            </button>
            <ProfileGate action="send an inquiry" onNavigate={onNavigate}>
              <button
                onClick={() => onNavigate("messages")}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <MaterialIcon name="send" className="text-sm" /> Send Inquiry
              </button>
            </ProfileGate>
          </div>
        </div>
      </div>
    </div>
  );
}
