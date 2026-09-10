# SPEC: Invoice Email Delivery via Resend

## Feature Overview

Enable users to send validated invoices to clients via email through Resend. After an invoice is marked "issued" (status validated), a new UI affordance allows one-click email delivery containing the public invoice link and professional HTML email template.

**Status Flow**:
- `draft` - Enregistré (editable)
- `issued` - Validée (locked, public_token generated)
- **`sent`** ← New: marked when email successfully delivered
- `accepted` - Client accepted
- `paid` - Marked paid
- `overdue` - Calculated by app logic
- `cancelled` - Manually cancelled

---

## Architecture & Integration

### Dependencies

Add to `package.json`:
```json
{
  "resend": "^4.0.0",
  "react-email": "^0.1.0"
}
```

Rationale: Resend provides reliable email delivery to SaaS; react-email enables clean, type-safe component-based email templates with preview support.

### Module Structure

Create `src/lib/email/` directory:

```
src/lib/email/
  ├── resend.ts              // Resend client + send logic
  ├── templates/
  │   └── invoice-notification.tsx  // React email component
  └── utils.ts               // Email helpers (validation, formatting)
```

### Key Files to Create

**1. `src/lib/email/resend.ts`**
- Initialize Resend client with `RESEND_API_KEY`
- Export `sendInvoiceEmail(options)` function
  - Input: `{ invoiceId, clientEmail, publicLink, invoiceName, settings }`
  - Calls `resend.emails.send()` with template component
  - Logs result to `email_logs` table
  - Returns success/error

**2. `src/lib/email/templates/invoice-notification.tsx`**
- React component accepting props: `{ invoiceName, clientName, publicLink, senderName, senderEmail }`
- Renders professional HTML email
- Mobile-responsive layout (inline Tailwind via `@react-email`)
- Contains: greeting, invoice details, CTA button (public link), footer with sender info

**3. `src/lib/email/utils.ts`**
- `validateClientEmail(email: string): boolean` - Basic email validation
- `formatInvoiceName(numero, dateEmission): string` - Display format

### Key Files to Modify

**1. `src/app/app/factures/actions.ts`**
- Add server action: `sendInvoiceEmail(invoiceId: string)`
  - Fetch invoice by ID, verify auth, load client email
  - Call `src/lib/email/resend.ts#sendInvoiceEmail()`
  - On success:
    - Update invoice.status → "sent"
    - Update invoice.sent_at → now()
    - Insert audit log to `email_logs`
  - Revalidate cache: `/app/factures`, `/app/factures/[id]` (if exists)
  - Return: `{ success: boolean, error?: string, timestamp?: string }`

**2. `src/components/invoice/InvoiceWorkbench.tsx`**
- After `onIssue()` succeeds and link is shown:
  - Add new UI section (conditionally rendered if `invoice.status === "issued"` && !sent)
  - Button: "Envoyer au client" (Send to Client)
    - Icon: Mail
    - Disabled if invoice missing `client.email`
    - On click: call server action `sendInvoiceEmail(invoice.id!)`
    - Handle loading state & toast feedback
    - On success: show confirmation toast, optionally disable button or show "✓ Envoyé"
- Optional: Show email status indicator if `invoice.status === "sent"` with timestamp

**3. `.env.example`**
- Add line: `RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- Ensure `NEXT_PUBLIC_APP_URL` is documented (already present)

**4. `src/lib/types.ts` (optional)**
- Review `Invoice` type: already includes implicit support via `status: InvoiceStatus`
- No changes needed if sent_at tracked at DB level

---

## Database Schema

### Existing Support (No Migration Needed)

✓ `invoices.sent_at: timestamptz` - Already exists (0001_init.sql:64)
✓ `invoices.status: invoice_status enum` - Includes "sent" (0001_init.sql:45)
✓ `email_logs` table - Audit trail (20260618083846_mailing_setup.sql)
  - `id, user_id, invoice_id, recipient_email, subject, sent_at, status`

---

## User Flow (Happy Path)

1. User creates invoice in `/app/factures/nouvelle`
2. Clicks "Valider & Lien" (Validate & Generate Link)
   - Status transitions to "issued"
   - Public token generated
   - Client email pre-populated from invoice.client.email
3. New UI affordance appears: "Envoyer au client" button
4. User enters/confirms client email (or auto-filled)
5. Clicks "Envoyer au client"
   - Button shows spinner (pending state)
   - Server action sends email via Resend
   - Email contains:
     - Professional greeting
     - Invoice number, date, total amount
     - CTA button: "Voir la facture" → link to `/facture/{public_token}`
     - Sender business info
6. On success:
   - Toast: "Email envoyé avec succès"
   - Button disabled/hidden
   - Status badge shows "Envoyée" + timestamp
   - Audit log created in `email_logs`
7. Client receives email, clicks link, lands on public invoice page
8. Client can accept invoice (existing flow via PublicInvoiceAccept)

---

## Email Template Design

### Structure

```
┌─────────────────────────────────────────────┐
│ HEADER (business color)                     │
│ Logo (if available), business name          │
├─────────────────────────────────────────────┤
│ GREETING                                    │
│ "Bonjour [ClientName],                      │
│                                             │
│ Veuillez trouver ci-dessous la facture     │
│ que nous vous adressons."                  │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Invoice Number: 2026-0001           │   │
│ │ Date: dd/mm/yyyy                    │   │
│ │ Total: EUR 1,000.00                 │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ [CTA Button] Voir la facture (public_link) │
│                                             │
│ FOOTER                                      │
│ Sender: [BusinessName]                      │
│ Contact: [Email] · [Phone]                  │
│ "404 Monkey • Facturation"                 │
└─────────────────────────────────────────────┘
```

### Template Props

```typescript
interface InvoiceNotificationProps {
  invoiceName: string;        // "Facture 2026-0001"
  clientName: string;         // "Acme Inc."
  publicLink: string;         // "https://facturation.beloucif.com/facture/{token}"
  senderName: string;         // "Adam Beloucif"
  senderEmail: string;        // "facturation@beloucif.com"
  senderPhone?: string;       // "+33 7 86 46 68 34"
  total: string;              // "1 000,00 EUR"
  dateEmission: string;       // "19 juin 2026"
  businessColor: string;      // "#14342b" (colorPrimary from settings)
}
```

### Styling

- Use `@react-email` primitives: `Html`, `Body`, `Section`, `Row`, `Column`, `Button`, `Text`
- Inline Tailwind utilities via `style` prop (no external CSS)
- Dark/light-safe colors (test with Gmail, Outlook, Apple Mail)
- Responsive: single column on mobile, centered max-width 600px
- Button CTA: 48px height (touch-safe), contrasting color (brass accent if applicable)
- Font: Sans-serif fallback (Arial, Helvetica, -apple-system)

---

## Environment Variables

### Required

```env
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

- Obtain from https://resend.com/api-keys
- Store in `.env.local` (dev) + Vercel secrets (prod)
- Never commit to repo

### Already Existing (Ensure Documented)

```env
NEXT_PUBLIC_APP_URL=https://facturation.beloucif.com  # or http://localhost:3000 for dev
```

- Used to construct public invoice link
- Must point to deployed domain for email links to resolve in production

---

## Implementation Details

### Server Action: `sendInvoiceEmail(invoiceId: string)`

**Location**: `src/app/app/factures/actions.ts`

**Behavior**:
1. Authenticate user (via supabase.auth.getUser())
2. Fetch invoice + snapshot (settings)
3. Verify ownership (invoice.user_id === currentUser.id)
4. Extract client.email from snapshot.invoice.client
5. Validate email (not empty, basic regex)
6. Build public link: `${process.env.NEXT_PUBLIC_APP_URL}/facture/${invoice.public_token}`
7. Call `sendInvoiceEmail()` from `src/lib/email/resend.ts`
8. On success:
   - Update invoice: `status = 'sent', sent_at = now()`
   - Insert email_logs entry
   - Revalidate `/app/factures`
   - Return: `{ success: true, sentAt: string }`
9. On error:
   - Log to error handler (Sentry if available)
   - Return: `{ success: false, error: string }`

**Error Cases**:
- Missing/invalid client email → `{ success: false, error: "Adresse email du client manquante" }`
- Resend API failure → `{ success: false, error: "Échec d'envoi. Ressai ultérieurement." }`
- Invoice already sent → `{ success: false, error: "Cette facture a déjà été envoyée" }`
- Invoice not issued → `{ success: false, error: "Veuillez valider la facture d'abord" }`

### Resend Module: `src/lib/email/resend.ts`

```typescript
import { Resend } from "resend";
import InvoiceNotification from "./templates/invoice-notification";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail({
  invoiceId,
  clientEmail,
  publicLink,
  invoiceName,
  settings,
}: {
  invoiceId: string;
  clientEmail: string;
  publicLink: string;
  invoiceName: string;
  settings: BusinessSettings;
}): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "facturation@beloucif.com",
      to: clientEmail,
      subject: `Facture ${invoiceName} - ${settings.marque}`,
      react: (
        <InvoiceNotification
          invoiceName={invoiceName}
          clientName={/* extracted from snapshot */}
          publicLink={publicLink}
          senderName={settings.nom}
          senderEmail={settings.email}
          senderPhone={settings.tel}
          total={/* calculated */}
          dateEmission={/* from invoice */}
          businessColor={settings.colorPrimary}
        />
      ),
    });

    if (!result.error) {
      return { success: true, messageId: result.id };
    } else {
      return { success: false, error: result.error?.message };
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
```

### UI Integration: InvoiceWorkbench

After `onIssue()` succeeds, conditionally render:

```typescript
{link && invoice.status === "issued" && !invoice.sent_at && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-8 border-l-2 border-green-500 bg-green-500/10 p-4"
  >
    <p className="mb-4 text-sm font-bold text-ink">Envoyer au client</p>
    <button
      onClick={onSendEmail}
      disabled={pending || !invoice.client?.email}
      className="btn-primary w-full"
    >
      {pending ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Mail size={15} />
      )}
      Envoyer au client
    </button>
    {!invoice.client?.email && (
      <p className="mt-2 text-xs text-mist">Ajoutez une adresse email client d'abord.</p>
    )}
  </motion.div>
)}
```

---

## Testing Checklist

### Unit Tests
- [ ] `sendInvoiceEmail()` with valid inputs
- [ ] `sendInvoiceEmail()` with missing/invalid email
- [ ] `validateClientEmail()` edge cases (empty, invalid format, +1 char, etc.)
- [ ] Email template renders without errors

### Integration Tests
- [ ] Server action updates invoice status + sent_at
- [ ] Email audit log created in database
- [ ] Cache revalidation works
- [ ] Resend API key validation on startup

### Manual Tests
- [ ] Create invoice, issue, send email (dev with Resend test mode)
- [ ] Verify email arrives in recipient inbox
- [ ] Click link in email, lands on public invoice page
- [ ] Email renders correctly in Gmail, Outlook, Apple Mail
- [ ] UI shows success toast and updates status badge
- [ ] Repeated sends are prevented (already sent check)
- [ ] Missing client email shows helpful error

### Acceptance Criteria

- [ ] Invoice email sent via Resend on user action
- [ ] Email contains invoice details + public link
- [ ] Invoice status transitions: issued → sent
- [ ] sent_at timestamp recorded in database
- [ ] Audit log created in email_logs
- [ ] UI shows clear feedback (loading, success, error)
- [ ] User cannot re-send already-sent invoice
- [ ] Email is mobile-responsive & renders in major clients
- [ ] No API key leakage to client-side code
- [ ] Server action authenticates user ownership

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Resend API down | Medium | Graceful error message, retry logic, fallback docs |
| Email bounces/spam | Low | Validate email format, test with real addresses, monitor |
| Duplicate sends | Medium | Check status before allowing re-send, UI prevents |
| Sensitive data in logs | High | Mask client email in audit logs, never log email body |
| XSS in email template | Medium | Use react-email strict rendering, no user input in template |
| Unauthed email send | High | Verify user ownership via Supabase auth + RLS |

---

## Future Enhancements

- [ ] Email scheduling (send later, recurring reminders)
- [ ] Template personalization (custom branding per user)
- [ ] Email templates for other events (payment received, invoice overdue)
- [ ] Batch sending (multiple invoices to multiple clients)
- [ ] Email open tracking via Resend webhooks
- [ ] Bounce/complaint handling
- [ ] SMTP fallback (SendGrid, AWS SES)
- [ ] Signature integration (digital signing pre-send)

---

## Deliverables

1. ✓ Feature spec (this document)
2. Code implementation:
   - `src/lib/email/resend.ts` + utils
   - `src/lib/email/templates/invoice-notification.tsx`
   - Updated `src/app/app/factures/actions.ts`
   - Updated `src/components/invoice/InvoiceWorkbench.tsx`
   - Updated `.env.example`
   - Updated `package.json`
3. Tests (unit + integration)
4. Documentation update (README email section)
5. Deploy to staging + smoke test
6. Deploy to production + monitoring

---

## References

- Resend Docs: https://resend.com/docs
- React Email: https://react.email
- Invoice Statuses: SPEC-invoice-statuses.md (if exists)
- Public Invoice RPC: supabase/migrations/0003_public_invoice_rpc.sql
- Existing Audit Pattern: email_logs table (0002_mailing_setup.sql)
