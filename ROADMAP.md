# ROADMAP · EDEN

## ✅ Phase 0 — Fondations (fait)
- Scaffold Next.js 16 + TS + Tailwind v4 + framer-motion
- Design system EDEN (tokens, polices OFL)
- `InvoiceDocument` react-pdf (design EDEN, mentions légales)
- Éditeur facture + aperçu PDF live + export
- Compta de base (totaux, cotisations URSSAF, seuils)
- Schéma Supabase multi-tenant (RLS)

## 🛠️ Phase 1 — Auth & persistance
- Auth Supabase (email + OAuth)
- Sauvegarde settings émetteur, clients, factures
- Numérotation auto séquentielle par année

## 🛠️ Phase 2 — Cycle de vie facture (validation → envoi → acceptation)
- Statuts : `draft → issued (verrouillée) → sent → accepted → paid`
- Bouton **Valider** : fige la facture (snapshot émetteur + client), génère le numéro définitif
- **Envoi par email** au client (Resend) avec lien public
- **Page publique** `/facture/[public_token]** : le client voit la facture (aperçu + PDF)
- Bouton **« J'accepte »** côté client → `accepted_at` + IP horodatés, notification à l'émetteur
- Relances automatiques sur échéance dépassée

## 🛠️ Phase 3 — Compta
- Dashboard : CA encaissé vs facturé, échéancier URSSAF (mensuel/trimestriel)
- Suivi seuils franchise TVA (37 500 / 41 250 €) et plafond micro (77 700 €)
- Dépenses, export comptable (CSV / livre des recettes)

## 🛠️ Phase 4 — Billing SaaS
- Stripe : plan Free (X factures/mois) + Pro (illimité, branding, relances auto)
- Webhooks Stripe → table `subscriptions`
- Portail client Stripe

## 🛠️ Phase 5 — Déploiement & polish
- Déploiement Vercel + domaine
- Dark mode complet
- Audit `ui-ux-pro-max`
- Tests (Vitest) sur compta + numérotation
