"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/supabase/server";

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

  // Ecriture via RPC SECURITY DEFINER : le plan est decide cote serveur
  // (le user ne peut pas se donner un plan illimite). Voir migration secure_subscriptions_onboarding.
  const { error } = await supabase.rpc("set_onboarding", {
    p_profile_type: profileType,
    p_rna: profileType === "asso" ? (input.rna ?? "").trim().toUpperCase() : "",
    p_proof_url: profileType === "asso" ? input.assoProofUrl ?? null : null,
  });
  if (error) return { error: error.message };

  revalidatePath("/app");
  redirect("/app");
}
