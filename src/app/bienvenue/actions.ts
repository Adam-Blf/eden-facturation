"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileType = "entreprise" | "asso";

export async function completeOnboarding(input: {
  profileType: ProfileType;
  rna?: string;
  assoProofUrl?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { profileType } = input;

  if (profileType === "asso") {
    const rna = (input.rna ?? "").trim().toUpperCase();
    if (!/^W\d{9}$/.test(rna)) {
      return { error: "Numéro RNA invalide (format attendu : W suivi de 9 chiffres)." };
    }
    if (!input.assoProofUrl) {
      return { error: "Merci de joindre un justificatif (récépissé, statuts, ou publication JOAFE)." };
    }
  }

  const { error: settingsError } = await supabase
    .from("business_settings")
    .update({
      profile_type: profileType,
      onboarded: true,
      rna: profileType === "asso" ? (input.rna ?? "").trim().toUpperCase() : "",
      asso_proof_url: profileType === "asso" ? input.assoProofUrl ?? null : null,
      asso_verified: false,
    })
    .eq("user_id", user.id);
  if (settingsError) return { error: settingsError.message };

  // Association = gratuit illimité (loi 1901). Entreprise reste sur le palier
  // gratuit (1 client) avec upsell vers les plans payants.
  const free = profileType === "asso";
  const { error: subError } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        plan: profileType === "entreprise" ? "free" : profileType,
        status: "active",
        max_clients: free ? null : 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (subError) return { error: subError.message };

  revalidatePath("/app");
  redirect("/app");
}
