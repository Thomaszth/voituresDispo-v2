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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
    const threadIdDailyDigest = Deno.env.get("THREAD_ID_DAILY_DIGEST");
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

    // Send single combined message
    await sendTelegramMessage(botToken, chatId, threadIdDailyDigest, message);

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
