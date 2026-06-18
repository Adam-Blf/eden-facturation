import { createClient } from "@/lib/supabase/server";
import { settingsFromRow } from "@/lib/db";
import BrandingForm from "@/components/settings/BrandingForm";

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
