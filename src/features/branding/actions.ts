"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/supabase/server";
import { settingsToRow } from "./settings-mapping";
import type { BusinessSettings } from "./types";

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
