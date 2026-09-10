import { Resend } from "resend";
import React from "react";
import InvoiceNotification from "./templates/invoice-notification";
import type { InvoiceNotificationProps } from "./templates/invoice-notification";

export interface SendInvoiceNotificationOptions
  extends Omit<InvoiceNotificationProps, "businessColor"> {
  /** Recipient email address (not rendered inside the template). */
  clientEmail: string;
  businessColor?: string;
}

export interface SendInvoiceNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendInvoiceNotification(
  opts: SendInvoiceNotificationOptions,
): Promise<SendInvoiceNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "Clé API Resend manquante. Vérifiez la variable RESEND_API_KEY.",
    };
  }

  const resend = new Resend(apiKey);

  const fromAddress = process.env.EMAIL_FROM ?? "facturation@beloucif.com";

  // Sanitize the display name: strip CR/LF, escape internal quotes/backslashes,
  // then wrap in RFC 5322 quoted-string to prevent header spoofing.
  const rawName = opts.senderName?.replace(/[\r\n]/g, " ").replace(/["\\]/g, "") ?? "";
  const from = rawName ? `"${rawName}" <${fromAddress}>` : fromAddress;

  // Strip CR/LF from subject to prevent SMTP header injection (belt-and-suspenders
  // alongside Resend's own JSON-layer protection).
  const subject = `${opts.invoiceName} - ${opts.senderName?.replace(/[\r\n]/g, " ") || "Facture"}`;

  const businessColor = opts.businessColor ?? "#0b0b0c";

  const result = await resend.emails.send({
    from,
    to: opts.clientEmail,
    subject,
    react: React.createElement(InvoiceNotification, {
      ...opts,
      businessColor,
    }),
  });

  if (result.error) {
    return {
      success: false,
      error: result.error.message,
    };
  }

  return {
    success: true,
    messageId: result.data?.id,
  };
}
