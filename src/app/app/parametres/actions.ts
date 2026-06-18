"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { settingsToRow } from "@/lib/db";
import type { BusinessSettings } from "@/lib/types";

export async function saveSettings(settings: BusinessSettings) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { error } = await supabase
    .from("business_settings")
    .upsert(settingsToRow(settings, user.id));

  if (error) return { error: error.message };
  revalidatePath("/app/parametres");
  revalidatePath("/app");
  return { ok: true };
}
