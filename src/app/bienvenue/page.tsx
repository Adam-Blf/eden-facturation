import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

export const metadata = { title: "Bienvenue sur 404 Monkey" };

export default async function BienvenuePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: settings } = await supabase
    .from("business_settings")
    .select("onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (settings?.onboarded) redirect("/app");

  return <OnboardingFlow userId={user.id} />;
}
