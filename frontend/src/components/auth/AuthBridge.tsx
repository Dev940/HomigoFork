import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { api, setAuthTokenGetter } from "../../lib/api";

type AuthBridgeProps = {
  onNavigate: (page: string) => void;
  onUserIdChange: (userId: string | number | null) => void;
  onUserProfileChange: (profile: { fullName?: string | null; email?: string; phone?: string; imageUrl?: string } | null) => void;
};

export default function AuthBridge({ onNavigate, onUserIdChange, onUserProfileChange }: AuthBridgeProps) {
  const { getToken, isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  useEffect(() => {
    onUserIdChange(isLoaded && isSignedIn && user ? user.id : null);
    onUserProfileChange(isLoaded && isSignedIn && user ? {
      fullName: user.fullName,
      email: user.primaryEmailAddress?.emailAddress,
      phone: user.primaryPhoneNumber?.phoneNumber,
      imageUrl: user.imageUrl,
    } : null);
  }, [isLoaded, isSignedIn, onUserIdChange, onUserProfileChange, user]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    api.saveUserProfile({
      user_id: user.id,
      basic_info: {
        full_name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Homigo User",
        email: user.primaryEmailAddress?.emailAddress,
        phone: user.primaryPhoneNumber?.phoneNumber,
        role: "seeker",
        profile_photo: user.imageUrl,
      },
    }).catch(() => undefined);
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (isLoaded && isSignedIn && window.location.hash === "#/login") {
      onNavigate("dashboard");
    }
  }, [isLoaded, isSignedIn, onNavigate]);

  return null;
}
