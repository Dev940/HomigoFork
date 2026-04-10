import { useState } from "react";
import TopNavBar from "../components/layout/TopNavBar";
import BottomNavBar from "../components/layout/BottomNavBar";
import MaterialIcon from "../components/ui/MaterialIcon";
import ProfileGate from "../components/ui/ProfileGate";
import { PROPERTIES, OWNERS, type PropertyListing, type Owner } from "../lib/mockData";

type PageProps = { onNavigate: (page: string) => void };

// ─── Filters ──────────────────────────────────────────────────────────────────
type Filters = {
  city: string;
  type: string;
  roomType: string;
  maxRent: number;
  verified: boolean;
};

const DEFAULT_FILTERS: Filters = {
  city: "all",
  type: "all",
  roomType: "all",
  maxRent: 70000,
  verified: false,
};

const CITIES = ["all", "Bangalore", "Mumbai", "Hyderabad", "Delhi", "Gurgaon", "Pune", "Chennai", "Kolkata", "Noida"];
const PROP_TYPES = ["all", "apartment", "villa", "studio", "house", "pg"];
const ROOM_TYPES = ["all", "private", "shared", "full"];

// ─── Owner card (inside detail) ───────────────────────────────────────────────
function OwnerCard({ owner, onMessage }: { owner: Owner; onMessage: () => void }) {
  return (
    <div className="rounded-xl border border-surface-container bg-surface-container-low p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-outline">Listed by</p>
      <div className="flex items-center gap-3">
        <img src={owner.avatar} alt={owner.name} className="h-12 w-12 rounded-full object-cover" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-on-surface">{owner.name}</p>
            {owner.verified && (
              <MaterialIcon name="verified" className="text-sm text-primary" fill />
            )}
          </div>
          <p className="text-xs text-on-surface-variant">{owner.city} · {owner.totalProperties} properties</p>
          <div className="mt-0.5 flex items-center gap-1">
            <MaterialIcon name="star" className="text-[12px] text-amber-500" fill />
            <span className="text-xs font-semibold text-on-surface">{owner.rating}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">{owner.bio}</p>
      <div className="mt-3 space-y-1.5 text-xs text-on-surface-variant">
        <p className="flex items-center gap-2"><MaterialIcon name="call" className="text-sm text-primary" />{owner.phone}</p>
        <p className="flex items-center gap-2"><MaterialIcon name="mail" className="text-sm text-primary" />{owner.email}</p>
      </div>
      <button onClick={onMessage} className="btn-primary mt-4 w-full flex items-center justify-center gap-2 text-sm">
        <MaterialIcon name="chat" className="text-sm" /> Message owner
      </button>
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────
function PropertyDetail({
  property,
  owner,
  onMessage,
  onClose,
  onNavigate,
}: {
  property: PropertyListing;
  owner: Owner | undefined;
  onMessage: () => void;
  onClose: () => void;
  onNavigate: (page: string) => void;
}) {
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-surface">
      {/* Image gallery */}
      <div className="relative h-56 shrink-0 overflow-hidden bg-surface-container-low sm:h-64">
        <img
          src={property.images[activeImg]}
          alt={property.title}
          className="h-full w-full object-cover"
        />
        {property.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {property.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`h-1.5 rounded-full transition-all ${i === activeImg ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}
        {/* Back button */}
        <button
          onClick={onClose}
          className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-black/60"
        >
          <MaterialIcon name="arrow_back" className="text-sm" /> Back
        </button>
        {/* Badges */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 items-end">
          {property.verified && (
            <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white">
              <MaterialIcon name="verified" className="text-[11px]" fill /> Verified
            </span>
          )}
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold capitalize text-white backdrop-blur-sm">
            {property.propertyType}
          </span>
        </div>
      </div>

      <div className="flex-1 px-5 py-4">
        {/* Title & rent */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-headline text-xl font-extrabold leading-tight">{property.title}</h2>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-on-surface-variant">
              <MaterialIcon name="location_on" className="text-sm text-primary" />
              {property.location}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-headline text-xl font-black text-primary">₹{property.rent.toLocaleString("en-IN")}</p>
            <p className="text-xs text-outline">/month</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-4 divide-x divide-surface-container rounded-xl bg-surface-container-low py-3">
          {[
            { icon: "bed", label: `${property.bedrooms} Bed` },
            { icon: "bathroom", label: `${property.bathrooms} Bath` },
            { icon: "straighten", label: `${property.areaSqFt} ft²` },
            { icon: "star", label: property.rating.toFixed(1) },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-3">
              <MaterialIcon name={icon} className="text-primary" />
              <span className="text-xs font-bold">{label}</span>
            </div>
          ))}
        </div>

        {/* Available from */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
          <MaterialIcon name="calendar_month" className="text-base" />
          Available from {new Date(property.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </div>

        {/* Description */}
        <div className="mt-5">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-outline">About this place</h3>
          <p className="text-sm leading-relaxed text-on-surface-variant">{property.description}</p>
        </div>

        {/* Amenities */}
        <div className="mt-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-outline">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((a) => (
              <span key={a} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <MaterialIcon name="check_circle" className="text-[11px]" fill /> {a}
              </span>
            ))}
          </div>
        </div>

        {/* Room type */}
        <div className="mt-5">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-outline">Room type</h3>
          <span className="rounded-full bg-surface-container-high px-4 py-1.5 text-sm font-semibold capitalize text-on-surface">
            {property.roomType === "private" ? "Private room" : property.roomType === "shared" ? "Shared room" : "Full apartment"}
          </span>
        </div>

        {/* Owner */}
        {owner && (
          <div className="mt-5">
            <ProfileGate action="contact the owner" onNavigate={onNavigate}>
              <OwnerCard owner={owner} onMessage={onMessage} />
            </ProfileGate>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 flex gap-3 border-t border-surface-container bg-surface px-5 py-4">
        <ProfileGate action="send an inquiry" onNavigate={onNavigate}>
          <button onClick={onMessage} className="btn-primary flex flex-1 items-center justify-center gap-2 text-sm">
            <MaterialIcon name="send" className="text-sm" /> Send inquiry
          </button>
        </ProfileGate>
        <button className="btn-tonal flex items-center gap-2 px-4 text-sm">
          <MaterialIcon name="share" className="text-sm" />
        </button>
      </div>
    </div>
  );
}

// ─── Listing card ─────────────────────────────────────────────────────────────
function ListingCard({ property, onClick }: { property: PropertyListing; onClick: () => void }) {
  const owner = OWNERS.find((o) => o.id === property.ownerId);
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-surface-container-lowest shadow-ambient transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-surface-container-low">
        <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 items-start">
          {property.verified && (
            <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
              <MaterialIcon name="verified" className="text-[10px]" fill /> Verified
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold capitalize text-white backdrop-blur-sm">
            {property.propertyType}
          </span>
        </div>
        {/* Rent overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6">
          <p className="font-headline text-base font-black text-white">
            ₹{property.rent.toLocaleString("en-IN")}<span className="text-xs font-medium">/mo</span>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="truncate font-headline font-bold text-on-surface group-hover:text-primary">
          {property.title}
        </h3>
        <p className="mt-0.5 flex items-center gap-0.5 text-xs text-on-surface-variant">
          <MaterialIcon name="location_on" className="text-[11px] text-primary" />
          {property.location}
        </p>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1"><MaterialIcon name="bed" className="text-[13px]" /> {property.bedrooms} Bed</span>
          <span className="flex items-center gap-1"><MaterialIcon name="bathroom" className="text-[13px]" /> {property.bathrooms} Bath</span>
          <span className="flex items-center gap-1"><MaterialIcon name="straighten" className="text-[13px]" /> {property.areaSqFt} ft²</span>
          <span className="ml-auto flex items-center gap-0.5 font-semibold text-amber-500">
            <MaterialIcon name="star" className="text-[12px]" fill /> {property.rating}
          </span>
        </div>

        {/* Top amenities */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {property.amenities.slice(0, 3).map((a) => (
            <span key={a} className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant">{a}</span>
          ))}
          {property.amenities.length > 3 && (
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-semibold text-outline">+{property.amenities.length - 3}</span>
          )}
        </div>

        {/* Owner */}
        {owner && (
          <div className="mt-3 flex items-center gap-2 border-t border-surface-container pt-3">
            <img src={owner.avatar} alt={owner.name} className="h-6 w-6 rounded-full object-cover" />
            <span className="text-xs text-on-surface-variant">{owner.name}</span>
            {owner.verified && <MaterialIcon name="verified" className="ml-auto text-sm text-primary" fill />}
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AccommodationSearch({ onNavigate }: PageProps) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<PropertyListing | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const setF = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  const filtered = PROPERTIES.filter((p) => {
    if (filters.city !== "all" && p.city !== filters.city) return false;
    if (filters.type !== "all" && p.propertyType !== filters.type) return false;
    if (filters.roomType !== "all" && p.roomType !== filters.roomType) return false;
    if (p.rent > filters.maxRent) return false;
    if (filters.verified && !p.verified) return false;
    return true;
  });

  // ── Selected detail view ────────────────────────────────────────────────────
  if (selected) {
    const owner = OWNERS.find((o) => o.id === selected.ownerId);
    const detailPanel = (
      <PropertyDetail
        property={selected}
        owner={owner}
        onMessage={() => onNavigate("messages")}
        onClose={() => setSelected(null)}
        onNavigate={onNavigate}
      />
    );

    return (
      <div className="flex h-screen flex-col overflow-hidden bg-surface">
        {/* Desktop split */}
        <div className="hidden h-full lg:flex">
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-surface-container bg-white px-6 py-4">
              <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary">
                <MaterialIcon name="arrow_back" className="text-sm" /> All Listings
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ListingCard key={p.id} property={p} onClick={() => setSelected(p)} />
                ))}
              </div>
            </div>
          </div>
          <div className="w-[420px] shrink-0 overflow-hidden border-l border-surface-container">
            {detailPanel}
          </div>
        </div>

        {/* Mobile full-screen detail */}
        <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
          {detailPanel}
        </div>
      </div>
    );
  }

  // ── Grid view ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <TopNavBar onNavigate={onNavigate} />

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-24 sm:px-6">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Accommodation</p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight md:text-4xl">
              Find your perfect home
            </h1>
            <p className="mt-1 text-on-surface-variant">
              {filtered.length} listing{filtered.length !== 1 ? "s" : ""} across top Indian cities
            </p>
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="btn-tonal flex w-fit items-center gap-2 self-start sm:self-auto"
          >
            <MaterialIcon name="tune" className="text-sm" />
            {showFilters ? "Hide Filters" : "Filters"}
            {Object.entries(filters).some(([k, v]) => v !== DEFAULT_FILTERS[k as keyof Filters]) && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">!</span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-6 rounded-2xl border border-surface-container bg-surface-container-lowest p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {/* City */}
              <label className="col-span-2 space-y-1 sm:col-span-1">
                <span className="text-xs font-bold uppercase tracking-wider text-outline">City</span>
                <select value={filters.city} onChange={(e) => setF("city", e.target.value)} className="text-sm">
                  {CITIES.map((c) => <option key={c} value={c}>{c === "all" ? "All cities" : c}</option>)}
                </select>
              </label>

              {/* Type */}
              <label className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-outline">Type</span>
                <select value={filters.type} onChange={(e) => setF("type", e.target.value)} className="text-sm">
                  {PROP_TYPES.map((t) => <option key={t} value={t}>{t === "all" ? "Any type" : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </label>

              {/* Room type */}
              <label className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-outline">Room</span>
                <select value={filters.roomType} onChange={(e) => setF("roomType", e.target.value)} className="text-sm">
                  {ROOM_TYPES.map((t) => <option key={t} value={t}>{t === "all" ? "Any" : t === "private" ? "Private" : t === "shared" ? "Shared" : "Full flat"}</option>)}
                </select>
              </label>

              {/* Budget */}
              <label className="col-span-2 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-outline">
                  Max Rent: <span className="text-primary">₹{filters.maxRent.toLocaleString("en-IN")}</span>
                </span>
                <input
                  type="range" min={8000} max={70000} step={1000}
                  value={filters.maxRent}
                  onChange={(e) => setF("maxRent", Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-container-highest accent-primary"
                />
                <div className="flex justify-between text-[10px] text-outline">
                  <span>₹8k</span><span>₹70k</span>
                </div>
              </label>

              {/* Verified toggle */}
              <div className="flex items-end">
                <button
                  onClick={() => setF("verified", !filters.verified)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${filters.verified ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"}`}
                >
                  <MaterialIcon name="verified" className="text-sm" fill /> Verified only
                </button>
              </div>
            </div>
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="mt-4 text-xs font-semibold text-on-surface-variant underline-offset-2 hover:text-primary hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* City quick-filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setF("city", city)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${filters.city === city ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"}`}
            >
              {city === "all" ? "All Cities" : city}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-on-surface-variant">
            <MaterialIcon name="apartment" className="text-5xl text-outline" />
            <p className="mt-4 font-headline text-xl font-bold">No listings match your filters</p>
            <button onClick={() => setFilters(DEFAULT_FILTERS)} className="btn-primary mt-5">Clear filters</button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((property) => (
              <ListingCard key={property.id} property={property} onClick={() => setSelected(property)} />
            ))}
          </div>
        )}
      </main>

      <BottomNavBar onNavigate={onNavigate} />
    </div>
  );
}
