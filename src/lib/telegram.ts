const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID as string;

export const THREAD_IDS = {
  voirVehicule: Number(import.meta.env.VITE_TELEGRAM_CLICK_VOIR_VEHICULE_MESSAGE_THREAD_ID),
  contacterWhatsapp: Number(import.meta.env.VITE_TELEGRAM_CLICK_CONTACTER_SUR_WHATSAPP_MESSAGE_THREAD_ID),
  partagerVehicule: Number(import.meta.env.VITE_TELEGRAM_CLICK_PARTAGER_VEHICULE_MESSAGE_THREAD_ID),
  searchQueries: Number(import.meta.env.VITE_TELEGRAM_SEARCH_QUERIES_MESSAGE_THREAD_ID),
  dailyReport: Number(import.meta.env.VITE_TELEGRAM_DAILY_REPORT_MESSAGE_THREAD_ID),
  carSellerLeads: Number(import.meta.env.VITE_TELEGRAM_CAR_SELLER_LEADS_MESSAGE_THREAD_ID),
};

export async function sendTelegramNotification(message: string, threadId: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        message_thread_id: threadId,
        parse_mode: 'Markdown',
        text: message,
      }),
    });
  } catch {
    // silently ignored
  }
}
