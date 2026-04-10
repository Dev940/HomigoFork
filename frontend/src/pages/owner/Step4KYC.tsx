import { useState } from "react";
import MaterialIcon from "../../components/ui/MaterialIcon";
import RegistrationShell from "../../components/ui/RegistrationShell";
import { api } from "../../lib/api";
import { useHomigoAuth } from "../../components/auth/AuthContext";

type PageProps = { onNavigate: (page: string) => void };

const selfiePreview = "https://lh3.googleusercontent.com/aida-public/AB6AXuClzXEZ5zHMvYVGcZF29M-y3hKd-O_aBRoNGwL8p8gKssHButuVymuY6WwIdO7671NkWKd33uyaH5J2gjvj-GCvtjtx6gLLy2ZodIqgnewjbPe9Fj1TBQqAsJ4ak3YahU1Ql1UtiQXKwuGI08HKZFx5NHmm85WUmijvumnVKTlsAXgC66uHhf1j5EjHZ7O81b0cNRoDOXWrj7wbAkf6xWUKiw6zuDsC-qliAgc2u4kK7N0mf2qAVwxMGVmko3iz1yWcToryjKwoOS3Q";

export default function Step4KYC({ onNavigate }: PageProps) {
  const { userId, userProfile } = useHomigoAuth();
  const [governmentIdType, setGovernmentIdType] = useState("aadhar");
  const [governmentIdNumber, setGovernmentIdNumber] = useState("XXXX-XXXX-1234");
  const [addressProofType, setAddressProofType] = useState("utility_bill");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const submitKyc = async () => {
    if (loading) return;
    setLoading(true);
    setStatus(null);
    try {
      await api.saveOwnerProfile({
        owner_id: userId,
        basic_info: {
          full_name: userProfile?.fullName ?? "Homigo Owner",
          email: userProfile?.email ?? "owner@homigo.com",
          phone: userProfile?.phone ?? "",
          profile_photo: userProfile?.imageUrl,
        },
        owner_profile: {
          business_name: "Homigo Rentals",
          owner_type: "individual",
          bio: "Providing quality rental spaces with trusted service.",
        },
        verification_details: {
          kyc_status: "pending",
          government_id: {
            id_type: governmentIdType,
            id_number: governmentIdNumber,
            document_images: [
              "https://cdn.homigo.com/kyc/id_front.jpg",
              "https://cdn.homigo.com/kyc/id_back.jpg",
            ],
          },
          address_proof: {
            document_type: addressProofType,
            document_image: "https://cdn.homigo.com/kyc/address.jpg",
          },
        },
      });
      setStatus({ type: "success", message: "Verification submitted successfully!" });
      onNavigate("owner5");
    } catch (error) {
      console.error("[Step4KYC] submitKyc failed:", error);
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Could not submit verification. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationShell currentStep={4} title="Identity Verification" subtitle="Verify your identity to ensure a safe and trusted community for all Homigo users." onBack={() => onNavigate("owner3")} onContinue={submitKyc} continueLabel="Save & Continue" loading={loading}>
      <section className="mb-12 flex flex-col justify-between gap-6 text-center md:flex-row md:items-end md:text-left">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
            <MaterialIcon name="verified_user" className="text-sm" fill />
            <span className="text-xs font-bold uppercase tracking-widest">Bank-Grade Security</span>
          </div>
        </div>
        <div className="hidden rounded-xl bg-secondary-fixed px-4 py-2 text-on-secondary-fixed md:flex md:items-center md:gap-2">
          <MaterialIcon name="pending" />
          <span className="text-sm font-semibold">Status: Pending</span>
        </div>
      </section>
      {status && (
        <p className={`mb-6 rounded-lg p-4 text-sm font-semibold ${status.type === "error" ? "bg-error/10 text-error" : "bg-secondary-fixed text-on-secondary-fixed"}`}>
          {status.message}
        </p>
      )}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="space-y-8 md:col-span-7">
          <div className="rounded-xl bg-surface-container-lowest p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-xl bg-primary-container/20 p-3 text-primary"><MaterialIcon name="badge" /></div>
              <div>
                <h3 className="font-headline text-xl font-bold">Government ID</h3>
                <p className="text-sm text-on-surface-variant">Aadhar Card, Passport, or Driver's License</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <select value={governmentIdType} onChange={(event) => setGovernmentIdType(event.target.value)}><option value="aadhar">Aadhar</option><option value="passport">Passport</option><option value="pan">PAN</option><option value="dl">Driver's License</option></select>
                <input value={governmentIdNumber} onChange={(event) => setGovernmentIdNumber(event.target.value)} placeholder="XXXX-XXXX-1234" />
              </div>
              <div className="cursor-pointer rounded-xl border-2 border-dashed border-outline-variant p-10 text-center transition-colors hover:bg-surface-container-low">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-container"><MaterialIcon name="upload_file" className="text-outline" /></div>
                <p className="mb-1 font-semibold text-on-surface">Click to upload or drag and drop</p>
                <p className="text-xs text-on-surface-variant">PNG, JPG or PDF (max. 10MB)</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-surface-container-lowest p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-xl bg-primary-container/20 p-3 text-primary"><MaterialIcon name="home_pin" /></div>
              <div>
                <h3 className="font-headline text-xl font-bold">Address Proof</h3>
                <p className="text-sm text-on-surface-variant">Utility bill, Rent agreement, or Bank statement</p>
              </div>
            </div>
            <div className="space-y-4">
              <select value={addressProofType} onChange={(event) => setAddressProofType(event.target.value)}><option value="utility_bill">Utility bill</option><option value="bank_statement">Bank statement</option><option value="rent_agreement">Rent agreement</option></select>
              <div className="cursor-pointer rounded-xl border-2 border-dashed border-outline-variant p-10 text-center transition-colors hover:bg-surface-container-low">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-container"><MaterialIcon name="description" className="text-outline" /></div>
                <p className="mb-1 font-semibold text-on-surface">Click to upload document</p>
                <p className="text-xs text-on-surface-variant">Recent document issued within last 3 months</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-8 md:col-span-5">
          <div className="overflow-hidden rounded-xl bg-surface-container-lowest">
            <div className="border-b border-surface-container p-6"><div className="flex items-center gap-3"><MaterialIcon name="face" className="text-secondary" /><h3 className="font-headline text-lg font-bold">Liveness Check</h3></div></div>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-slate-900 p-6">
              <img alt="Verification Background" className="absolute inset-0 h-full w-full object-cover opacity-50 blur-[2px]" src={selfiePreview} />
              <div className="relative z-10 flex h-64 w-64 items-center justify-center rounded-[4rem] border-2 border-primary-fixed">
                <div className="absolute -left-1 -top-1 h-6 w-6 rounded-tl-xl border-l-4 border-t-4 border-primary" />
                <div className="absolute -right-1 -top-1 h-6 w-6 rounded-tr-xl border-r-4 border-t-4 border-primary" />
                <div className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-xl border-b-4 border-l-4 border-primary" />
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-xl border-b-4 border-r-4 border-primary" />
                <button className="group rounded-full border border-white/20 bg-white/10 p-6 text-white backdrop-blur-md transition-all hover:bg-white/20" type="button"><MaterialIcon name="photo_camera" className="text-3xl transition-transform group-active:scale-90" /></button>
              </div>
              <div className="absolute bottom-4 left-0 w-full px-6 text-center"><p className="rounded-lg bg-slate-900/60 py-2 text-xs font-medium tracking-wide text-white backdrop-blur-sm">Position your face inside the frame and blink</p></div>
            </div>
          </div>
          <div className="rounded-xl bg-surface-container-low p-6">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-on-surface"><MaterialIcon name="info" className="text-lg text-primary" fill />Why verify?</h4>
            <ul className="space-y-3">
              {["Premium badge on your profile", "Higher priority in roommate search", "Secure encrypted data handling"].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-on-surface-variant"><MaterialIcon name="check_circle" className="mt-0.5 text-sm text-teal-600" />{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </RegistrationShell>
  );
}
