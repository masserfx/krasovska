import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_MKT = "Hala Krasovská <info@halakrasovska.cz>";

// --- Templates ---

export type CampaignType =
  | "soft-opening"
  | "grand-opening"
  | "newsletter"
  | "event"
  | "promo";

interface CampaignData {
  type: CampaignType;
  subject: string;
  preheader?: string;
  headline: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  eventDate?: string;
  eventLocation?: string;
  imageUrl?: string;
  footer?: string;
}

function campaignHtml(data: CampaignData): string {
  const accentColor =
    data.type === "soft-opening" || data.type === "grand-opening"
      ? "#b45309"
      : data.type === "event"
        ? "#7c3aed"
        : "#1e40af";

  const ctaButton = data.ctaText
    ? `<div style="text-align:center;margin:32px 0">
        <a href="${data.ctaUrl || "#"}" style="display:inline-block;padding:14px 32px;background:${accentColor};color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">
          ${data.ctaText}
        </a>
      </div>`
    : "";

  const eventInfo =
    data.eventDate || data.eventLocation
      ? `<div style="margin:24px 0;padding:16px;background:#fef3c7;border-radius:8px;border-left:4px solid ${accentColor}">
          ${data.eventDate ? `<div style="font-size:14px;color:#92400e"><strong>Datum:</strong> ${data.eventDate}</div>` : ""}
          ${data.eventLocation ? `<div style="font-size:14px;color:#92400e"><strong>Místo:</strong> ${data.eventLocation}</div>` : ""}
        </div>`
      : "";

  const heroImage = data.imageUrl
    ? `<div style="text-align:center;margin-bottom:24px">
        <img src="${data.imageUrl}" alt="${data.headline}" style="max-width:100%;border-radius:8px" />
      </div>`
    : "";

  const preheaderHidden = data.preheader
    ? `<div style="display:none;font-size:1px;color:#fefefe;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${data.preheader}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc">
  ${preheaderHidden}
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">

      <!-- Header -->
      <div style="background:${accentColor};padding:32px;text-align:center">
        <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:-0.5px">${data.headline}</h1>
      </div>

      <!-- Body -->
      <div style="padding:32px">
        ${heroImage}
        <div style="color:#334155;font-size:15px;line-height:1.7">
          ${data.body}
        </div>
        ${eventInfo}
        ${ctaButton}
      </div>

      <!-- Footer -->
      <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8">
        ${data.footer || "Hala Krasovská &middot; Brno"}
        <br>
        <a href="{{{unsubscribe}}}" style="color:#94a3b8">Odhlásit se</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// --- Pre-built templates ---

export function softOpeningTemplate(params: {
  recipientName?: string;
  date: string;
  rsvpUrl: string;
}): CampaignData {
  return {
    type: "soft-opening",
    subject: "Jste pozváni na Soft Opening Bistra Krasovská",
    preheader: `${params.date} — exkluzivní ochutnávka pro vás`,
    headline: "Soft Opening Bistra Krasovská",
    body: `
      <p>${params.recipientName ? `Dobrý den, ${params.recipientName},` : "Dobrý den,"}</p>
      <p>Rádi bychom Vás pozvali na <strong>exkluzivní soft opening</strong> nového Bistra v Hale Krasovská.</p>
      <p>Čeká na Vás:</p>
      <ul>
        <li>Ochutnávka z našeho menu</li>
        <li>Prohlídka nově zrekonstruovaného prostoru</li>
        <li>Setkání s naším šéfkuchařem</li>
        <li>Sklenka na přivítanou</li>
      </ul>
      <p>Počet míst je omezený. Potvrďte prosím svou účast.</p>
    `,
    ctaText: "Potvrdit účast",
    ctaUrl: params.rsvpUrl,
    eventDate: params.date,
    eventLocation: "Hala Krasovská, Brno",
  };
}

export function grandOpeningTemplate(params: {
  date: string;
  program: string;
}): CampaignData {
  return {
    type: "grand-opening",
    subject: "Grand Opening Bistra Krasovská — Přijďte!",
    preheader: `${params.date} — slavnostní otevření s programem`,
    headline: "Grand Opening Bistra Krasovská",
    body: `
      <p>Je to tady! Srdečně Vás zveme na <strong>slavnostní otevření</strong> Bistra v Hale Krasovská.</p>
      <p><strong>Program:</strong></p>
      ${params.program}
      <p>Vstup volný. Těšíme se na Vás!</p>
    `,
    ctaText: "Více informací",
    ctaUrl: "https://halakrasovska.cz/bistro",
    eventDate: params.date,
    eventLocation: "Hala Krasovská, Brno",
  };
}

export function newsletterTemplate(params: {
  headline: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
}): CampaignData {
  return {
    type: "newsletter",
    subject: params.headline,
    preheader: params.body.substring(0, 90).replace(/<[^>]*>/g, ""),
    headline: params.headline,
    body: params.body,
    ctaText: params.ctaText,
    ctaUrl: params.ctaUrl,
  };
}

export function eventTemplate(params: {
  name: string;
  date: string;
  description: string;
  rsvpUrl?: string;
}): CampaignData {
  return {
    type: "event",
    subject: `${params.name} — Hala Krasovská`,
    preheader: `${params.date} — ${params.name}`,
    headline: params.name,
    body: params.description,
    ctaText: params.rsvpUrl ? "Registrovat se" : undefined,
    ctaUrl: params.rsvpUrl,
    eventDate: params.date,
    eventLocation: "Hala Krasovská, Brno",
  };
}

// --- Send functions ---

export interface CampaignResult {
  sent: number;
  failed: number;
  errors: string[];
}

export async function sendCampaign(
  recipients: string[],
  campaign: CampaignData
): Promise<CampaignResult> {
  const resend = getResend();
  if (!resend) {
    return { sent: 0, failed: 0, errors: ["RESEND_API_KEY not configured"] };
  }

  const html = campaignHtml(campaign);
  const result: CampaignResult = { sent: 0, failed: 0, errors: [] };

  // Resend batch API (up to 100 per call)
  const batches: string[][] = [];
  for (let i = 0; i < recipients.length; i += 100) {
    batches.push(recipients.slice(i, i + 100));
  }

  for (const batch of batches) {
    try {
      const emails = batch.map((to) => ({
        from: FROM_MKT,
        to,
        subject: campaign.subject,
        html,
      }));

      await resend.batch.send(emails);
      result.sent += batch.length;
    } catch (err) {
      result.failed += batch.length;
      result.errors.push(String(err));
    }
  }

  return result;
}

export async function sendSingleCampaignEmail(
  to: string,
  campaign: CampaignData
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  try {
    await resend.emails.send({
      from: FROM_MKT,
      to,
      subject: campaign.subject,
      html: campaignHtml(campaign),
    });
    return true;
  } catch (err) {
    console.error(`Campaign email failed for ${to}:`, err);
    return false;
  }
}

export { campaignHtml };
export type { CampaignData };
