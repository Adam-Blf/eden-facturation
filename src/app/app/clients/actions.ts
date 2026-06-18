"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addClient(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("clients").insert({
    user_id: user.id,
    nom: String(formData.get("nom") ?? ""),
    adresse1: String(formData.get("adresse1") ?? ""),
    adresse2: String(formData.get("adresse2") ?? ""),
    email: String(formData.get("email") ?? ""),
    particulier: formData.get("particulier") === "on",
  });
  revalidatePath("/app/clients");
}

export async function deleteClient(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("clients").delete().eq("id", String(formData.get("id")));
  revalidatePath("/app/clients");
}
