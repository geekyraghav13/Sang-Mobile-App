import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getProfile, saveProfile } from '@/lib/storage';
import { Profile } from '@/types';

type ProfileContextValue = {
  /** Null until loaded; null after load means "not onboarded yet". */
  profile: Profile | null;
  /** True while reading from storage on startup. */
  loading: boolean;
  /** Persist a new/updated profile. */
  setProfile: (profile: Profile) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProfile()
      .then((p) => active && setProfileState(p))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const setProfile = useCallback(async (next: Profile) => {
    await saveProfile(next);
    setProfileState(next);
  }, []);

  const value = useMemo(() => ({ profile, loading, setProfile }), [profile, loading, setProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}
