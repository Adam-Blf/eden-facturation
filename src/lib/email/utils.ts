// Email helpers - validation & formatting

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateClientEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

export function formatInvoiceName(numero: string): string {
  return `Facture ${numero}`;
}

export function formatInvoiceTotal(amountHT: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amountHT);
}

// Accepts dd/mm/yyyy or ISO date string, returns French-locale string.
export function formatEmailDate(dateStr: string): string {
  if (!dateStr) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("fr-FR");
    }
  }
  return dateStr;
}
