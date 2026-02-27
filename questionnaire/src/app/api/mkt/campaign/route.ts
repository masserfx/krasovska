import { NextRequest, NextResponse } from "next/server";
import {
  sendCampaign,
  sendSingleCampaignEmail,
  softOpeningTemplate,
  grandOpeningTemplate,
  newsletterTemplate,
  eventTemplate,
  campaignHtml,
  type CampaignData,
  type CampaignType,
} from "@/lib/mkt-email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

function checkAuth(request: NextRequest): boolean {
  if (!CRON_SECRET) return true; // no secret = dev mode
  const authHeader = request.headers.get("authorization");
  const token = new URL(request.url).searchParams.get("token");
  const provided = authHeader?.replace("Bearer ", "") || token;
  return provided === CRON_SECRET;
}

/**
 * GET /api/mkt/campaign?template=soft-opening&preview=true
 * Preview a campaign template (returns HTML)
 */
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const template = searchParams.get("template") as CampaignType | null;

  if (!template) {
    return NextResponse.json({
      templates: ["soft-opening", "grand-opening", "newsletter", "event", "promo"],
      usage: "GET ?template=soft-opening&preview=true for HTML preview",
      send: "POST with { template, recipients, params }",
    });
  }

  let campaign: CampaignData;

  switch (template) {
    case "soft-opening":
      campaign = softOpeningTemplate({
        recipientName: searchParams.get("name") || "Jan Novák",
        date: searchParams.get("date") || "duben 2026",
        rsvpUrl: searchParams.get("rsvpUrl") || "https://halakrasovska.cz/rsvp",
      });
      break;
    case "grand-opening":
      campaign = grandOpeningTemplate({
        date: searchParams.get("date") || "květen 2026",
        program: "<ul><li>15:00 — Slavnostní otevření</li><li>16:00 — Ochutnávka menu</li><li>18:00 — Live hudba</li></ul>",
      });
      break;
    case "newsletter":
      campaign = newsletterTemplate({
        headline: searchParams.get("headline") || "Novinky z Haly Krasovská",
        body: "<p>Zde bude obsah newsletteru...</p>",
        ctaText: "Zobrazit více",
        ctaUrl: "https://halakrasovska.cz",
      });
      break;
    case "event":
      campaign = eventTemplate({
        name: searchParams.get("name") || "Wine & Dine večer",
        date: searchParams.get("date") || "15. dubna 2026",
        description: "<p>Přijďte na výjimečný gastronomický zážitek.</p>",
        rsvpUrl: "https://halakrasovska.cz/events",
      });
      break;
    default:
      return NextResponse.json(
        { error: `Unknown template: ${template}` },
        { status: 400 }
      );
  }

  const preview = searchParams.get("preview") === "true";
  if (preview) {
    return new NextResponse(campaignHtml(campaign), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.json({ template, campaign });
}

/**
 * POST /api/mkt/campaign
 * Send a campaign to recipients.
 *
 * Body:
 * {
 *   "template": "soft-opening" | "grand-opening" | "newsletter" | "event",
 *   "recipients": ["email1@example.com", "email2@example.com"],
 *   "params": { ...template-specific params },
 *   "dryRun": true  // optional: preview without sending
 * }
 */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { template, recipients, params, dryRun } = body;

  if (!template) {
    return NextResponse.json(
      { error: "template is required" },
      { status: 400 }
    );
  }

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return NextResponse.json(
      { error: "recipients array is required" },
      { status: 400 }
    );
  }

  // Build campaign from template
  let campaign: CampaignData;

  switch (template) {
    case "soft-opening":
      campaign = softOpeningTemplate({
        date: params?.date || "duben 2026",
        rsvpUrl: params?.rsvpUrl || "https://halakrasovska.cz/rsvp",
        recipientName: params?.recipientName,
      });
      break;
    case "grand-opening":
      campaign = grandOpeningTemplate({
        date: params?.date || "květen 2026",
        program: params?.program || "<ul><li>Program bude upřesněn</li></ul>",
      });
      break;
    case "newsletter":
      campaign = newsletterTemplate({
        headline: params?.headline || "Novinky z Haly Krasovská",
        body: params?.body || "<p>Obsah newsletteru</p>",
        ctaText: params?.ctaText,
        ctaUrl: params?.ctaUrl,
      });
      break;
    case "event":
      campaign = eventTemplate({
        name: params?.name || "Událost",
        date: params?.date || "",
        description: params?.description || "",
        rsvpUrl: params?.rsvpUrl,
      });
      break;
    default:
      return NextResponse.json(
        { error: `Unknown template: ${template}` },
        { status: 400 }
      );
  }

  // Override subject if provided
  if (params?.subject) {
    campaign.subject = params.subject;
  }

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      template,
      recipients: recipients.length,
      campaign: {
        subject: campaign.subject,
        type: campaign.type,
        headline: campaign.headline,
      },
      htmlPreview: campaignHtml(campaign).substring(0, 500) + "...",
    });
  }

  // Send for real
  if (recipients.length === 1) {
    const ok = await sendSingleCampaignEmail(recipients[0], campaign);
    return NextResponse.json({
      sent: ok ? 1 : 0,
      failed: ok ? 0 : 1,
      template,
    });
  }

  const result = await sendCampaign(recipients, campaign);
  return NextResponse.json({
    ...result,
    template,
    totalRecipients: recipients.length,
  });
}
