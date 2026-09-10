import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

export interface InvoiceNotificationProps {
  invoiceName: string;
  clientName: string;
  publicLink: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  total: string;
  dateEmission: string;
  businessColor: string;
}

export default function InvoiceNotification({
  invoiceName,
  clientName,
  publicLink,
  senderName,
  senderEmail,
  senderPhone,
  total,
  dateEmission,
  businessColor,
}: InvoiceNotificationProps) {
  const headerBg = businessColor || "#0b0b0c";

  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>
        {invoiceName} - {total}
      </Preview>
      <Body
        style={{
          backgroundColor: "#f5f5f5",
          fontFamily: "Arial, Helvetica, -apple-system, sans-serif",
          margin: "0",
          padding: "0",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "40px auto",
            padding: "0 20px 40px",
          }}
        >
          {/* Header */}
          <Section
            style={{
              backgroundColor: headerBg,
              borderRadius: "8px 8px 0 0",
              padding: "32px 40px",
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: "700",
                margin: "0",
                letterSpacing: "0.04em",
              }}
            >
              {senderName}
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "13px",
                margin: "6px 0 0 0",
              }}
            >
              {invoiceName}
            </Text>
          </Section>

          {/* Body card */}
          <Section
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "0 0 8px 8px",
              padding: "40px",
            }}
          >
            {/* Greeting */}
            <Text
              style={{
                fontSize: "16px",
                color: "#141414",
                margin: "0 0 12px 0",
                fontWeight: "600",
              }}
            >
              Bonjour {clientName},
            </Text>
            <Text
              style={{
                fontSize: "14px",
                color: "#555555",
                lineHeight: "1.7",
                margin: "0 0 28px 0",
              }}
            >
              Veuillez trouver ci-dessous la facture que nous vous adressons.
              Vous pouvez la consulter et l'accepter en cliquant sur le bouton
              ci-dessous.
            </Text>

            {/* Invoice summary box */}
            <Section
              style={{
                backgroundColor: "#f9f9f9",
                border: "1px solid #e5e5e5",
                borderRadius: "6px",
                padding: "20px 24px",
                margin: "0 0 28px 0",
              }}
            >
              <Row>
                <Column style={{ width: "50%", paddingBottom: "12px" }}>
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#999999",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Facture
                  </Text>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#141414",
                      fontWeight: "600",
                      margin: "0",
                    }}
                  >
                    {invoiceName}
                  </Text>
                </Column>
                <Column style={{ width: "50%", paddingBottom: "12px" }}>
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#999999",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Date
                  </Text>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#141414",
                      fontWeight: "600",
                      margin: "0",
                    }}
                  >
                    {dateEmission}
                  </Text>
                </Column>
              </Row>
              <Hr
                style={{
                  borderColor: "#e5e5e5",
                  margin: "8px 0 16px 0",
                }}
              />
              <Text
                style={{
                  fontSize: "11px",
                  color: "#999999",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 4px 0",
                }}
              >
                Montant total
              </Text>
              <Text
                style={{
                  fontSize: "26px",
                  color: "#141414",
                  fontWeight: "700",
                  margin: "0",
                  letterSpacing: "-0.02em",
                }}
              >
                {total}
              </Text>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center", margin: "0 0 32px 0" }}>
              <Button
                href={publicLink}
                style={{
                  backgroundColor: headerBg,
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "700",
                  padding: "14px 36px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  display: "inline-block",
                  lineHeight: "1",
                }}
              >
                Voir la facture
              </Button>
            </Section>

            <Hr style={{ borderColor: "#e5e5e5", margin: "0 0 24px 0" }} />

            {/* Footer */}
            <Text
              style={{
                fontSize: "12px",
                color: "#888888",
                margin: "0 0 4px 0",
                lineHeight: "1.6",
              }}
            >
              {senderName}
              {" - "}
              {senderEmail}
              {senderPhone ? ` - ${senderPhone}` : ""}
            </Text>
            <Text
              style={{
                fontSize: "11px",
                color: "#cccccc",
                margin: "0",
              }}
            >
              404 Monkey - Facturation
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
