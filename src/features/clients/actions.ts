"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/shared/supabase/server";

export async function addClient(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from("clients").insert({
    user_id: user.id,
    nom: String(formData.get("nom") ?? ""),
    adresse1: String(formData.get("adresse1") ?? ""),
    adresse2: String(formData.get("adresse2") ?? ""),
    email: String(formData.get("email") ?? ""),
    particulier: formData.get("particulier") === "on",
  });
  if (error) {
    const quota = error.message?.includes("CLIENT_QUOTA_REACHED");
    redirect(quota ? "/app/clients?error=quota" : "/app/clients?error=1");
  }
  revalidatePath("/app/clients");
}

export async function updateClient(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const id = String(formData.get("id"));
  await supabase
    .from("clients")
    .update({
      nom: String(formData.get("nom") ?? ""),
      adresse1: String(formData.get("adresse1") ?? ""),
      adresse2: String(formData.get("adresse2") ?? ""),
      email: String(formData.get("email") ?? ""),
      particulier: formData.get("particulier") === "on",
    })
    .eq("id", id);
  revalidatePath("/app/clients");
  revalidatePath(`/app/clients/${id}`);
  redirect(`/app/clients/${id}?saved=1`);
}

export async function deleteClient(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("clients").delete().eq("id", String(formData.get("id")));
  revalidatePath("/app/clients");
}
