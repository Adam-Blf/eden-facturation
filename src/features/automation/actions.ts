"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/shared/supabase/server";

export async function saveAutomationSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("business_settings")
    .update({
      auto_send_on_issue: formData.get("auto_send_on_issue") === "on",
      auto_relance: formData.get("auto_relance") === "on",
      relance_delai_jours: Number(formData.get("relance_delai_jours") ?? 7),
      auto_declaration: formData.get("auto_declaration") === "on",
      declaration_email: String(formData.get("declaration_email") ?? ""),
    })
    .eq("user_id", user.id);

  revalidatePath("/app/envois");
  redirect("/app/envois?saved=1");
}
