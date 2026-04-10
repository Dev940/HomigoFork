import { useState } from "react";
import ProgressStepper from "../../components/ui/ProgressStepper";
import { readOwnerDraft, saveOwnerDraft } from "../../lib/registrationDraft";

type PageProps = { onNavigate: (page: string) => void };

const ALL_AMENITIES = ["Wi-Fi", "Laundry", "Furnished", "Balcony", "Gym", "Pet friendly", "Parking", "AC"];

export default function Step3PropertySetup({ onNavigate }: PageProps) {
  const draft = readOwnerDraft();
  const p = draft.property;

  const [title, setTitle] = useState(p.title);
  const [propertyType, setPropertyType] = useState(p.property_type);
  const [roomType, setRoomType] = useState(p.room_type);
  const [address, setAddress] = useState(p.address);
  const [city, setCity] = useState(p.city);
  const [monthlyRent, setMonthlyRent] = useState(p.monthly_rent);
  const [availableFrom, setAvailableFrom] = useState(p.available_from);
  const [amenities, setAmenities] = useState<string[]>(p.amenities);
  const [errors, setErrors] = useState<{ title?: string; city?: string; monthlyRent?: string }>({});

  const toggleAmenity = (item: string) =>
    setAmenities((prev) => (prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]));

  const validate = () => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = "Listing title is required.";
    if (!city.trim()) next.city = "City is required.";
    if (!monthlyRent || Number(monthlyRent) <= 0) next.monthlyRent = "Enter a valid monthly rent.";
    return next;
  };

  const handleContinue = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    saveOwnerDraft({
      property: {
        title: title.trim(),
        property_type: propertyType,
        room_type: roomType,
        address: address.trim(),
        city: city.trim(),
        monthly_rent: monthlyRent,
        available_from: availableFrom,
        amenities,
      },
    });
    onNavigate("owner4");
  };

  return (
    <main className="min-h-screen bg-surface px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <ProgressStepper current={3} total={5} />
      </div>
      <form className="mx-auto mt-10 max-w-5xl space-y-6" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
        <div>
          <h1 className="font-headline text-4xl font-extrabold">Build your listing</h1>
          <p className="mt-2 text-on-surface-variant">Details about your space help us find the perfect match.</p>
        </div>

        <section className="card space-y-4">
          <h2 className="font-headline text-2xl font-bold">Property Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })); }}
                placeholder="Listing title e.g. Sunlit Brooklyn Loft"
                className={errors.title ? "border-error ring-1 ring-error" : ""}
              />
              {errors.title && <p className="text-xs font-medium text-error">{errors.title}</p>}
            </label>
            <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              <option value="private_room">Private room</option>
              <option value="full_apartment">Full apartment</option>
              <option value="shared_room">Shared room</option>
            </select>
          </div>
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="studio">Studio</option>
            <option value="villa">Villa</option>
          </select>
        </section>

        <section className="card space-y-4">
          <h2 className="font-headline text-2xl font-bold">Location</h2>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" />
          <label className="block space-y-1">
            <input
              value={city}
              onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, city: undefined })); }}
              placeholder="City e.g. Brooklyn, NY"
              className={errors.city ? "border-error ring-1 ring-error" : ""}
            />
            {errors.city && <p className="text-xs font-medium text-error">{errors.city}</p>}
          </label>
        </section>

        <section className="card space-y-4">
          <h2 className="font-headline text-2xl font-bold">Pricing &amp; Availability</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <input
                value={monthlyRent}
                onChange={(e) => { setMonthlyRent(e.target.value); setErrors((p) => ({ ...p, monthlyRent: undefined })); }}
                placeholder="Monthly rent e.g. 1950"
                type="number"
                min="0"
                className={errors.monthlyRent ? "border-error ring-1 ring-error" : ""}
              />
              {errors.monthlyRent && <p className="text-xs font-medium text-error">{errors.monthlyRent}</p>}
            </label>
            <input
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              placeholder="Available from"
              type="date"
            />
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="font-headline text-2xl font-bold">Amenities &amp; Features</h2>
          <div className="flex flex-wrap gap-3">
            {ALL_AMENITIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleAmenity(item)}
                className={`chip ${amenities.includes(item) ? "bg-primary text-on-primary" : ""}`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="mb-5 font-headline text-2xl font-bold">Photos</h2>
          <div className="rounded-lg bg-surface-container-low p-10 text-center text-on-surface-variant">
            Drop listing photos here
          </div>
        </section>

        <div className="flex justify-between">
          <button type="button" onClick={() => onNavigate("owner2")} className="btn-tonal">Back</button>
          <button type="button" onClick={handleContinue} className="btn-primary">Continue</button>
        </div>
      </form>
    </main>
  );
}