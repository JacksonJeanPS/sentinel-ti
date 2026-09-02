"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) redirect("/entrar?erro=configuracao");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/entrar?erro=credenciais");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) redirect("/cadastro?erro=configuracao");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("name") ?? "");
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${site}/auth/callback`,
      data: { full_name: fullName },
    },
  });
  if (error) redirect(`/cadastro?erro=${error.code ?? "cadastro"}`);
  redirect("/entrar?mensagem=confirme-email");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/");
}

export async function requestReset(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase?.auth.resetPasswordForEmail(email, {
    redirectTo: `${site}/auth/callback?next=/redefinir-senha`,
  });
  redirect("/entrar?mensagem=recuperacao-enviada");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = String(formData.get("password") ?? "");
  if (password.length < 10) redirect("/redefinir-senha?erro=senha-curta");
  const { error } = await supabase!.auth.updateUser({ password });
  if (error) redirect("/redefinir-senha?erro=atualizacao");
  redirect("/dashboard?mensagem=senha-atualizada");
}
