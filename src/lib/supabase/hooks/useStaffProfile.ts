import { useEffect, useState } from "react";
import { useSession } from "./useSession";
import { supabase } from "../client";
import type { PengabdianStaff } from "../types";

export function useStaffProfile() {
  const { user, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState<PengabdianStaff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) return;

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    supabase
      .from("pengabdian_staff")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error: err }) => {
        if (err && err.code !== "PGRST116") {
          setError(err.message);
        }
        setProfile(data ?? null);
        setLoading(false);
      });
  }, [user, sessionLoading]);

  const isAdmin =
    profile?.role_pengabdian === "Admin" && (profile?.aktif ?? false);
  const isPicDiv =
    profile?.role_pengabdian === "PIC_Div" && (profile?.aktif ?? false);
  const isPicReg =
    profile?.role_pengabdian === "PIC_Reg" && (profile?.aktif ?? false);
  const isStaff = !!profile && (profile?.aktif ?? false);

  return { profile, loading, error, isAdmin, isPicDiv, isPicReg, isStaff };
}
