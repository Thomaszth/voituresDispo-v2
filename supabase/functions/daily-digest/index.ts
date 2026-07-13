// SETUP INSTRUCTIONS:
// 1. Set these environment variables in Supabase dashboard → Edge Functions → daily-digest → Secrets:
//    TELEGRAM_BOT_TOKEN — your bot token from BotFather
//    TELEGRAM_CHAT_ID — your Telegram group chat ID
//    THREAD_ID_DAILY_DIGEST — topic ID for daily digest reports
// 2. Deploy with: supabase functions deploy daily-digest
// 3. After deploying, copy the Edge Function URL from Supabase dashboard → Edge Functions.
// 4. In the pg_cron SQL, replace YOUR_EDGE_FUNCTION_URL with the real URL.
// 5. Replace YOUR_SUPABASE_SERVICE_KEY with your service_role key from Supabase → Settings → API.
// 6. Run the pg_cron SQL in the Supabase SQL editor to activate the daily schedule.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ClickEvent {
  event_type: string;
  voiture_id: string | null;
  voiture_label: string | null;
  voiture_url: string | null;
  search_query: string | null;
  created_at: string;
}

interface VehicleStats {
  voiture_id: string;
  voiture_label: string;
  voiture_url: string;
  count: number;
}

function getDayRangeInUTC(date: Date): { start: Date; end: Date } {
  // Get current date components in UTC+1 (Cotonou time)
  const utcTime = date.getTime();
  const utcPlus1Time = utcTime + 60 * 60 * 1000;
  const utcPlus1Date = new Date(utcPlus1Time);

  // Get start of day in UTC+1 (00:00:00)
  const dayStartUTC1 = new Date(
    Date.UTC(
      utcPlus1Date.getUTCFullYear(),
      utcPlus1Date.getUTCMonth(),
      utcPlus1Date.getUTCDate(),
      0, 0, 0, 0
    )
  );

  // Get end of day in UTC+1 (23:59:59)
  const dayEndUTC1 = new Date(
    Date.UTC(
      utcPlus1Date.getUTCFullYear(),
      utcPlus1Date.getUTCMonth(),
      utcPlus1Date.getUTCDate(),
      23, 59, 59, 999
    )
  );

  // Convert back to UTC (subtract 1 hour)
  const startUTC = new Date(dayStartUTC1.getTime() - 60 * 60 * 1000);
  const endUTC = new Date(dayEndUTC1.getTime() - 60 * 60 * 1000);

  return { start: startUTC, end: endUTC };
}

function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  threadId: string,
  text: string
): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_thread_id: threadId,
        parse_mode: "Markdown",
        text,
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
}

async function getVehicleViewsStats(
  supabase: ReturnType<typeof createClient>,
  startUTC: Date,
  endUTC: Date
): Promise<{ total: number; vehicles: VehicleStats[] }> {
  const { data, error } = await supabase
    .from("click_events")
    .select("*")
    .eq("event_type", "voir_vehicule")
    .gte("created_at", startUTC.toISOString())
    .lte("created_at", endUTC.toISOString());

  if (error) {
    console.error("Error fetching vehicle views:", error);
    return { total: 0, vehicles: [] };
  }

  const events = data as ClickEvent[];
  const vehicleMap = new Map<string, VehicleStats>();

  for (const event of events) {
    if (!event.voiture_id) continue;
    const existing = vehicleMap.get(event.voiture_id);
    if (existing) {
      existing.count++;
    } else {
      vehicleMap.set(event.voiture_id, {
        voiture_id: event.voiture_id,
        voiture_label: event.voiture_label || "Véhicule inconnu",
        voiture_url: event.voiture_url || "",
        count: 1,
      });
    }
  }

  const sortedVehicles = Array.from(vehicleMap.values()).sort((a, b) => b.count - a.count);
  return { total: events.length, vehicles: sortedVehicles };
}

async function getWhatsAppContactsStats(
  supabase: ReturnType<typeof createClient>,
  startUTC: Date,
  endUTC: Date
): Promise<{ total: number; vehicles: VehicleStats[] }> {
  const { data, error } = await supabase
    .from("click_events")
    .select("*")
    .eq("event_type", "contacter_whatsapp")
    .gte("created_at", startUTC.toISOString())
    .lte("created_at", endUTC.toISOString());

  if (error) {
    console.error("Error fetching WhatsApp contacts:", error);
    return { total: 0, vehicles: [] };
  }

  const events = data as ClickEvent[];
  const vehicleMap = new Map<string, VehicleStats>();

  for (const event of events) {
    if (!event.voiture_id) continue;
    const existing = vehicleMap.get(event.voiture_id);
    if (existing) {
      existing.count++;
    } else {
      vehicleMap.set(event.voiture_id, {
        voiture_id: event.voiture_id,
        voiture_label: event.voiture_label || "Véhicule inconnu",
        voiture_url: event.voiture_url || "",
        count: 1,
      });
    }
  }

  const sortedVehicles = Array.from(vehicleMap.values()).sort((a, b) => b.count - a.count);
  return { total: events.length, vehicles: sortedVehicles };
}

async function getSearchQueriesCount(
  supabase: ReturnType<typeof createClient>,
  startUTC: Date,
  endUTC: Date
): Promise<number> {
  const { data, error } = await supabase
    .from("click_events")
    .select("*", { count: "exact", head: false })
    .eq("event_type", "search_query")
    .gte("created_at", startUTC.toISOString())
    .lte("created_at", endUTC.toISOString());

  if (error) {
    console.error("Error fetching search queries:", error);
    return 0;
  }

  return data?.length || 0;
}

// PHASE 3 REPORTS — added after initial deployment
// New secret required: THREAD_ID_SELLER_LEADS
// Add it in Supabase dashboard → Edge Functions → daily-digest → Secrets

interface LabelStats {
  label: string;
  count: number;
}

interface PageVisitsStats {
  total: number;
  catalogue: number;
  palmares: number;
  vehicleTotal: number;
  topVehicles: LabelStats[];
}

async function getPageVisitsStats(
  supabase: ReturnType<typeof createClient>,
  startUTC: Date,
  endUTC: Date
): Promise<PageVisitsStats> {
  const { data, error } = await supabase
    .from("click_events")
    .select("*")
    .eq("event_type", "page_visit")
    .gte("created_at", startUTC.toISOString())
    .lte("created_at", endUTC.toISOString());

  if (error) {
    console.error("Error fetching page visits:", error);
    return { total: 0, catalogue: 0, palmares: 0, vehicleTotal: 0, topVehicles: [] };
  }

  const events = data as ClickEvent[];
  let catalogue = 0;
  let palmares = 0;
  const vehicleMap = new Map<string, number>();

  for (const event of events) {
    const label = event.voiture_label || "";
    if (label === "catalogue") {
      catalogue++;
    } else if (label === "palmares") {
      palmares++;
    } else if (label.startsWith("/voitures/")) {
      vehicleMap.set(label, (vehicleMap.get(label) || 0) + 1);
    }
  }

  const vehicleTotal = Array.from(vehicleMap.values()).reduce((sum, c) => sum + c, 0);
  const topVehicles = Array.from(vehicleMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return { total: events.length, catalogue, palmares, vehicleTotal, topVehicles };
}

interface GalleryClicksStats {
  total: number;
  top: LabelStats[];
}

async function getGalleryClicksStats(
  supabase: ReturnType<typeof createClient>,
  startUTC: Date,
  endUTC: Date
): Promise<GalleryClicksStats> {
  const { data, error } = await supabase
    .from("click_events")
    .select("*")
    .eq("event_type", "gallery_click")
    .gte("created_at", startUTC.toISOString())
    .lte("created_at", endUTC.toISOString());

  if (error) {
    console.error("Error fetching gallery clicks:", error);
    return { total: 0, top: [] };
  }

  const events = data as ClickEvent[];
  const labelMap = new Map<string, number>();

  for (const event of events) {
    const label = event.voiture_label || "Véhicule inconnu";
    labelMap.set(label, (labelMap.get(label) || 0) + 1);
  }

  const top = Array.from(labelMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return { total: events.length, top };
}

interface TimeOnPageStats {
  total: number;
  rebond: number;
  lu_rapidement: number;
  lu_en_detail: number;
}

async function getTimeOnPageStats(
  supabase: ReturnType<typeof createClient>,
  startUTC: Date,
  endUTC: Date
): Promise<TimeOnPageStats> {
  const { data, error } = await supabase
    .from("click_events")
    .select("*")
    .eq("event_type", "time_on_page")
    .gte("created_at", startUTC.toISOString())
    .lte("created_at", endUTC.toISOString());

  if (error) {
    console.error("Error fetching time on page:", error);
    return { total: 0, rebond: 0, lu_rapidement: 0, lu_en_detail: 0 };
  }

  const events = data as ClickEvent[];
  let rebond = 0;
  let lu_rapidement = 0;
  let lu_en_detail = 0;

  for (const event of events) {
    const bucket = event.search_query;
    if (bucket === "rebond") rebond++;
    else if (bucket === "lu_rapidement") lu_rapidement++;
    else if (bucket === "lu_en_detail") lu_en_detail++;
  }

  return { total: events.length, rebond, lu_rapidement, lu_en_detail };
}

interface SellerFunnelStats {
  palmaresVisits: number;
  ctaClicks: number;
  formStarts: number;
  completedLeads: number;
}

async function getSellerFunnelStats(
  supabase: ReturnType<typeof createClient>,
  startUTC: Date,
  endUTC: Date
): Promise<SellerFunnelStats> {
  const [visitsRes, ctaRes, formRes, leadsRes] = await Promise.all([
    supabase
      .from("click_events")
      .select("*")
      .eq("event_type", "page_visit")
      .eq("voiture_label", "palmares")
      .gte("created_at", startUTC.toISOString())
      .lte("created_at", endUTC.toISOString()),
    supabase
      .from("click_events")
      .select("*")
      .eq("event_type", "cta_palmares")
      .gte("created_at", startUTC.toISOString())
      .lte("created_at", endUTC.toISOString()),
    supabase
      .from("click_events")
      .select("*")
      .eq("event_type", "form_started")
      .eq("voiture_label", "palmares_form")
      .gte("created_at", startUTC.toISOString())
      .lte("created_at", endUTC.toISOString()),
    supabase
      .from("palmares_leads")
      .select("*")
      .gte("submitted_at", startUTC.toISOString())
      .lte("submitted_at", endUTC.toISOString()),
  ]);

  return {
    palmaresVisits: visitsRes.data?.length || 0,
    ctaClicks: ctaRes.data?.length || 0,
    formStarts: formRes.data?.length || 0,
    completedLeads: leadsRes.data?.length || 0,
  };
}

interface RecherchesSourcingStats {
  pageVisits: number;
  whatsappClicks: number;
  topLabels: LabelStats[];
}

async function getRecherchesSourcingStats(
  supabase: ReturnType<typeof createClient>,
  startUTC: Date,
  endUTC: Date
): Promise<RecherchesSourcingStats> {
  const [visitsRes, clicksRes] = await Promise.all([
    supabase
      .from("click_events")
      .select("*")
      .eq("event_type", "page_visit")
      .eq("voiture_label", "recherches")
      .gte("created_at", startUTC.toISOString())
      .lte("created_at", endUTC.toISOString()),
    supabase
      .from("click_events")
      .select("*")
      .eq("event_type", "contacter_whatsapp")
      .gte("created_at", startUTC.toISOString())
      .lte("created_at", endUTC.toISOString()),
  ]);

  const clickEvents = (clicksRes.data as ClickEvent[]) || [];
  const labelMap = new Map<string, number>();

  for (const event of clickEvents) {
    const url = event.voiture_url || "";
    if (!url.includes("/recherches")) continue;
    const label = event.voiture_label || "Recherche inconnue";
    labelMap.set(label, (labelMap.get(label) || 0) + 1);
  }

  const topLabels = Array.from(labelMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    pageVisits: visitsRes.data?.length || 0,
    whatsappClicks: Array.from(labelMap.values()).reduce((sum, c) => sum + c, 0),
    topLabels,
  };
}

interface VisitorStats {
  newVisitors: number;
  returningVisitors: number;
}

async function getVisitorStats(
  supabase: ReturnType<typeof createClient>,
  startUTC: Date,
  endUTC: Date
): Promise<VisitorStats> {
  const startISO = startUTC.toISOString();
  const endISO = endUTC.toISOString();

  const [newRes, returningRes] = await Promise.all([
    supabase
      .from("visitor_profiles")
      .select("*", { count: "exact", head: true })
      .gte("first_seen", startISO)
      .lte("first_seen", endISO),
    supabase
      .from("visitor_profiles")
      .select("*", { count: "exact", head: true })
      .gte("last_seen", startISO)
      .lte("last_seen", endISO)
      .lt("first_seen", startISO),
  ]);

  return {
    newVisitors: newRes.count || 0,
    returningVisitors: returningRes.count || 0,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
    const threadIdDailyDigest = Deno.env.get("THREAD_ID_DAILY_DIGEST");
    const threadIdVoirVehicule = Deno.env.get("THREAD_ID_VOIR_VEHICULE");
    const threadIdSellerLeads = Deno.env.get("THREAD_ID_SELLER_LEADS");
    const threadIdResearchedCarsSellerLeads = Deno.env.get("THREAD_ID_SELLER_LEADS");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!botToken || !chatId || !threadIdDailyDigest) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Missing required environment variables" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ error: "Missing Supabase credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get day range in UTC (calculated from Cotonou time UTC+1)
    const now = new Date();
    const { start: startUTC, end: endUTC } = getDayRangeInUTC(now);
    const reportDate = formatDate(new Date(now.getTime() + 60 * 60 * 1000)); // Format date in UTC+1

    console.log("Generating combined daily digest for:", reportDate);
    console.log("UTC range:", startUTC.toISOString(), "to", endUTC.toISOString());

    // Fetch all data
    const vehicleViews = await getVehicleViewsStats(supabase, startUTC, endUTC);
    const whatsappContacts = await getWhatsAppContactsStats(supabase, startUTC, endUTC);
    const searchQueriesCount = await getSearchQueriesCount(supabase, startUTC, endUTC);

    // Fetch new reports data
    const pageVisits = await getPageVisitsStats(supabase, startUTC, endUTC);
    const galleryClicks = await getGalleryClicksStats(supabase, startUTC, endUTC);
    const timeOnPage = await getTimeOnPageStats(supabase, startUTC, endUTC);
    const sellerFunnel = await getSellerFunnelStats(supabase, startUTC, endUTC);
    const recherchesSourcing = await getRecherchesSourcingStats(supabase, startUTC, endUTC);
    const visitorStats = await getVisitorStats(supabase, startUTC, endUTC);

    // Build combined message
    let message = `📊 *Rapport quotidien — Voitures Dispo*
📅 ${reportDate}
─────────────────────
👁 *Intérêt véhicules*
`;

    if (vehicleViews.total > 0) {
      message += `*${vehicleViews.total} personne(s)* ont consulté un véhicule aujourd'hui.\n`;
      for (const v of vehicleViews.vehicles) {
        message += `- ${v.count} × *${v.voiture_label}* — ${v.voiture_url}\n`;
      }
    } else {
      message += `Aucune consultation aujourd'hui.\n`;
    }

    message += `─────────────────────
💬 *Contacts WhatsApp*
`;

    if (whatsappContacts.total > 0) {
      message += `*${whatsappContacts.total} personne(s)* ont cliqué sur Contacter sur WhatsApp.\n`;
      for (const v of whatsappContacts.vehicles) {
        message += `- ${v.count} × *${v.voiture_label}* — ${v.voiture_url}\n`;
      }
    } else {
      message += `Aucun contact WhatsApp aujourd'hui.\n`;
    }

    message += `─────────────────────
🔍 *Recherches*
`;

    if (searchQueriesCount > 0) {
      message += `*${searchQueriesCount}* recherche(s) effectuée(s) aujourd'hui.`;
    } else {
      message += `Aucune recherche aujourd'hui.`;
    }

    // REPORT 0 — Visiteurs du jour (ajouté Phase 3 visitor tracking)
    // Requires visitor_profiles table to be populated by src/lib/visitor.ts
    if (threadIdVoirVehicule) {
      const totalVisitors = visitorStats.newVisitors + visitorStats.returningVisitors;
      let report0: string;
      if (totalVisitors > 0) {
        report0 = `📊 *Rapport du jour — Visiteurs*
📅 ${reportDate}
👥 Visiteurs uniques aujourd'hui : ${totalVisitors}
  • Nouveaux visiteurs : ${visitorStats.newVisitors}
  • Visiteurs de retour : ${visitorStats.returningVisitors}`;
      } else {
        report0 = `📊 *Rapport du jour — Visiteurs*
📅 ${reportDate}
👥 Aucun visiteur aujourd'hui.`;
      }
      await sendTelegramMessage(botToken, chatId, threadIdVoirVehicule, report0);
    }

    // Send single combined message
    await sendTelegramMessage(botToken, chatId, threadIdDailyDigest, message);

    // REPORT 4 — Visites par page
    if (threadIdDailyDigest) {
      let report4: string;
      if (pageVisits.total > 0) {
        report4 = `📊 *Rapport du jour — Visites*
📅 ${reportDate}

📄 Visites aujourd'hui :
- Catalogue : ${pageVisits.catalogue}
- Palmarès : ${pageVisits.palmares}
- Fiches véhicules : ${pageVisits.vehicleTotal}

Top fiches visitées :
${pageVisits.topVehicles.map(v => `- ${v.count} × *${v.label}*`).join("\n")}`;
      } else {
        report4 = `📊 *Rapport du jour — Visites*
📅 ${reportDate}

📄 Aucune visite de page aujourd'hui.`;
      }
      await sendTelegramMessage(botToken, chatId, threadIdDailyDigest, report4);
    }

    // REPORT 5 — Intérêt galeries photos
    if (threadIdDailyDigest) {
      let report5: string;
      if (galleryClicks.total > 0) {
        report5 = `📊 *Rapport du jour — Galeries photos*
📅 ${reportDate}

🖼 ${galleryClicks.total} clic(s) sur des galeries photos aujourd'hui.

Détail :
${galleryClicks.top.map(v => `- ${v.count} × *${v.label}*`).join("\n")}`;
      } else {
        report5 = `📊 *Rapport du jour — Galeries photos*
📅 ${reportDate}

🖼 Aucun clic sur une galerie aujourd'hui.`;
      }
      await sendTelegramMessage(botToken, chatId, threadIdDailyDigest, report5);
    }

    // REPORT 6 — Temps passé sur les fiches
    if (threadIdDailyDigest) {
      let report6: string;
      if (timeOnPage.total > 0) {
        report6 = `📊 *Rapport du jour — Lecture des fiches*
📅 ${reportDate}

⏱ Comportement de lecture aujourd'hui :
- Rebonds (< 10s) : ${timeOnPage.rebond}
- Lecture rapide (10–59s) : ${timeOnPage.lu_rapidement}
- Lecture complète (60s+) : ${timeOnPage.lu_en_detail}`;
      } else {
        report6 = `📊 *Rapport du jour — Lecture des fiches*
📅 ${reportDate}

⏱ Aucune donnée de lecture aujourd'hui.`;
      }
      await sendTelegramMessage(botToken, chatId, threadIdDailyDigest, report6);
    }

    // REPORT 7 — Entonnoir vendeur palmarès
    if (threadIdDailyDigest) {
      let report7: string;
      const { palmaresVisits, ctaClicks, formStarts, completedLeads } = sellerFunnel;
      if (palmaresVisits > 0 || ctaClicks > 0 || formStarts > 0 || completedLeads > 0) {
        const conversionRate = formStarts > 0
          ? Math.round((completedLeads / formStarts) * 100) + "%"
          : "N/A";
        report7 = `📊 *Rapport du jour — Entonnoir vendeur*
📅 ${reportDate}

Palmarès visité : ${palmaresVisits}
CTA cliqué : ${ctaClicks}
Formulaire commencé : ${formStarts}
Demandes complètes : ${completedLeads}

Taux formulaire → demande : ${conversionRate}`;
      } else {
        report7 = `📊 *Rapport du jour — Entonnoir vendeur*
📅 ${reportDate}

Aucune activité vendeur aujourd'hui.`;
      }
      await sendTelegramMessage(botToken, chatId, threadIdDailyDigest, report7);
    }

    // REPORT 8 — Sourcing véhicules (/recherches page)
    // Uses THREAD_ID_SELLER_LEADS (already set in secrets)
    if (threadIdResearchedCarsSellerLeads) {
      let report8: string;
      if (recherchesSourcing.whatsappClicks > 0) {
        const detailLines = recherchesSourcing.topLabels
          .map(v => `- ${v.count} × *${v.label.length > 80 ? v.label.slice(0, 80) : v.label}*`)
          .join("\n");
        report8 = `📊 *Rapport du jour — Sourcing véhicules*
📅 ${reportDate}
👁 Visites page recherches : ${recherchesSourcing.pageVisits}
🚗 Propositions reçues : ${recherchesSourcing.whatsappClicks}
Détail :
${detailLines}`;
      } else {
        report8 = `📊 *Rapport du jour — Sourcing véhicules*
📅 ${reportDate}
👁 Visites page recherches : ${recherchesSourcing.pageVisits}
🚗 Aucune proposition reçue aujourd'hui.`;
      }
      await sendTelegramMessage(botToken, chatId, threadIdResearchedCarsSellerLeads, report8);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Daily digest sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in daily-digest:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
