const PROXY_URL = 'https://cfrkjnphcifbucufrvxu.supabase.co/functions/v1/telegram-proxy';

export const THREAD_IDS = {
  voirVehicule: "401",
  contacterWhatsapp: "889",
  partagerVehicule: "890",
  searchQueries: "892",
  dailyReport: "894",
  carSellerLeads: "895",
  catalogPageVisit: "982",
  carPageVisit: "983",
  palmaresPageVisit: "985",
  clicksThroughCarThumbnailsOfCarPage: "1016",
  timeSpentOnCarOfCarPage: "1051",
  paginationDepthTracking: "1209",
  recherchesPageVisit: "12469",
};

export async function sendTelegramNotification(message: string, threadId: string) {
  try {
    await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        threadId: threadId,
      }),
    });
  } catch {
    // silently ignored
  }
}
