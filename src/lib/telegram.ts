const BOT_TOKEN = 'YOUR_BOT_TOKEN';
const CHAT_ID = 'YOUR_CHAT_ID';

export const THREAD_IDS = {
  voirVehicule: 'YOUR_THREAD_ID_VOIR_VEHICULE',
  contacterWhatsapp: 'YOUR_THREAD_ID_CONTACTER_WHATSAPP',
  partagerVehicule: 'YOUR_THREAD_ID_PARTAGER_VEHICULE',
  searchQuery: 'YOUR_THREAD_ID_SEARCH_QUERY',
  dailyDigest: 'YOUR_THREAD_ID_DAILY_DIGEST',
  sellerLeads: 'YOUR_THREAD_ID_SELLER_LEADS',
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
