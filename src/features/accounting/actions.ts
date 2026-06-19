"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/supabase/server";

export async function addPayment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("payments").insert({
    user_id: user.id,
    amount: Number(formData.get("amount") ?? 0),
    paid_at: String(formData.get("paid_at") || new Date().toISOString().slice(0, 10)),
    method: String(formData.get("method") ?? "virement"),
  });
  revalidatePath("/app/compta");
  revalidatePath("/app");
}

export async function addExpense(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("expenses").insert({
    user_id: user.id,
    label: String(formData.get("label") ?? ""),
    amount: Number(formData.get("amount") ?? 0),
    category: String(formData.get("category") ?? "divers"),
    spent_at: String(formData.get("spent_at") || new Date().toISOString().slice(0, 10)),
  });
  revalidatePath("/app/compta");
}
