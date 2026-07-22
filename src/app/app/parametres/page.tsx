import { createClient } from "@/shared/supabase/server";
import { settingsFromRow } from "@/features/branding/settings-mapping";
import BrandingForm from "@/features/branding/BrandingForm";

export default async function ParametresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: row } = await supabase
    .from("business_settings")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  return <BrandingForm initial={settingsFromRow(row)} userId={user!.id} />;
}
