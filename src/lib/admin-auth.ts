import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

export async function signInAdmin(email: string, password: string): Promise<Session> {
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user || !data.session) throw new Error("Não foi possível iniciar a sessão.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    await supabase.auth.signOut();
    throw new Error("Este usuário não tem acesso administrativo.");
  }

  return data.session;
}

export async function getAdminSession() {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.session.user.id)
    .maybeSingle();

  return profile?.role === "admin" ? data.session : null;
}

export async function signOutAdmin() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
