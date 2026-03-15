import { AuthContext } from "@/ctx/AuthContext";
import { Profile } from "@/types/profile";
import { supabase } from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { PropsWithChildren } from "react";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const premiumExpiresAt: string | null = profile?.premium_expires_at ?? null;
  //   chekc dieu kien premium. chi true khi đang là premium và vẫn còn hạn premium
  const isPremium =
    !!profile?.is_premium &&
    (!premiumExpiresAt || new Date(premiumExpiresAt) > new Date());

  const loadProfile = async (s: Session | null) => {
    if (!s) {
      setProfile(null);
      return;
    }
    const { error, data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", s.user.id)
      .maybeSingle();

    setProfile(error ? null : data);
  };

  const refreshProfile = () => loadProfile(session);

  //   loading state, get Session from database if not, set null
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      //   check auth
      const { data } = await supabase.auth.getSession();
      const initialSession = data.session ?? null;
      setSession(initialSession);
      await loadProfile(initialSession);
      setLoading(false);
    };

    init();

    // listen event when auth change and clean up
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setLoading(true);
      setSession(newSession);
      loadProfile(newSession).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        isAdmin: false,
        isPremium,
        premiumExpiresAt,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
