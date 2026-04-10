import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import { api, setAuthTokenGetter } from "../../lib/api";
import { markOnboardingComplete } from "../../lib/registrationDraft";

type AuthBridgeProps = {
  onNavigate: (page: string) => void;
  onUserIdChange: (userId: string | number | null) => void;
  onUserProfileChange: (
    profile: { fullName?: string | null; email?: string; phone?: string; imageUrl?: string } | null,
  ) => void;
};

export default function AuthBridge({ onNavigate, onUserIdChange, onUserProfileChange }: AuthBridgeProps) {
  const { getToken, isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  // Prevents duplicate sign-in processing across re-renders
  const didHandleSignIn = useRef(false);

  // Register the Clerk token getter so every api.* call is authenticated
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  // Keep app auth context in sync with Clerk state
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      onUserIdChange(user.id);
      onUserProfileChange({
        fullName: user.fullName,
        email: user.primaryEmailAddress?.emailAddress,
        phone: user.primaryPhoneNumber?.phoneNumber,
        imageUrl: user.imageUrl,
      });
    } else {
      onUserIdChange(null);
      onUserProfileChange(null);
    }
    // Callbacks are intentionally omitted — they are stable via useCallback in App.tsx
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user]);

  // On sign-in: upsert user record, then route to the right page
  useEffect(() => {
    // Reset gate on sign-out so the next sign-in is handled correctly
    if (isLoaded && !isSignedIn) {
      didHandleSignIn.current = false;
      return;
    }
    if (!isLoaded || !isSignedIn || !user) return;
    if (didHandleSignIn.current) return;
    didHandleSignIn.current = true;

    (async () => {
      // Upsert the basic user record. We intentionally omit `role` here so
      // we never overwrite a role that was set during onboarding.
      try {
        await api.saveUserProfile({
          user_id: user.id,
          basic_info: {
            full_name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Homigo User",
            email: user.primaryEmailAddress?.emailAddress,
            phone: user.primaryPhoneNumber?.phoneNumber,
            profile_photo: user.imageUrl,
          },
        });
      } catch {
        // Non-fatal — continue to redirect even if upsert fails
      }

      // Determine destination: returning users (role set) → dashboard; new users → role selection
      try {
        const result = await api.getUserDetails(user.id) as any;
        const role = result?.data?.basic_info?.role;
        if (role === "seeker" || role === "owner") {
          // Persist completion flag so ProfileGate works without another API call
          markOnboardingComplete(role);
          onNavigate("dashboard");
        } else {
          onNavigate("role");
        }
      } catch {
        // User not found in DB or network error → treat as new user
        onNavigate("role");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user]);

  return null;
}