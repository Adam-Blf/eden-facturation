// Domaine Automation — chargement de la config des envois automatiques

import { createClient } from "@/shared/supabase/server";
import { type AutomationSettings, DEFAULT_AUTOMATION } from "./types";

export async function loadAutomationSettings(): Promise<AutomationSettings> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_AUTOMATION;

  const { data } = await supabase
    .from("business_settings")
    .select(
      "auto_send_on_issue, auto_relance, relance_delai_jours, auto_declaration, declaration_email",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return DEFAULT_AUTOMATION;
  return {
    autoSendOnIssue: Boolean(data.auto_send_on_issue),
    autoRelance: Boolean(data.auto_relance),
    relanceDelaiJours: Number(data.relance_delai_jours ?? DEFAULT_AUTOMATION.relanceDelaiJours),
    autoDeclaration: Boolean(data.auto_declaration),
    declarationEmail: String(data.declaration_email ?? ""),
  };
}
