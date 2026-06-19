import { createClient } from "@/lib/supabase/server";
import BillingPlans from "@/components/billing/BillingPlans";

export default async function AbonnementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, max_clients")
    .eq("user_id", user!.id)
    .maybeSingle();

  const { count: clientCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const currentPlan = sub?.plan ?? "free";
  const maxClients = sub?.max_clients ?? 1;
  const used = clientCount ?? 0;
  const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <div className="mx-auto max-w-5xl px-2 py-4">
      <p className="eyebrow text-xs text-brass">Abonnement</p>
      <h1 className="mb-2 font-display text-4xl font-bold text-ink">Choisis ton plan</h1>
      <p className="mb-1 text-mist">
        Statut actuel : <span className="font-bold uppercase text-ink">{currentPlan}</span>
      </p>
      <p className="mb-8 text-sm text-mist">
        Clients utilisés :{" "}
        <span className="font-bold text-ink">
          {used} / {maxClients === null ? "∞" : maxClients}
        </span>
      </p>

      <BillingPlans currentPlan={currentPlan} stripeEnabled={stripeEnabled} />
    </div>
  );
}
