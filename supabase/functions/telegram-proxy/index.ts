// telegram-proxy Edge Function
// Receives notification requests from the browser and forwards them
// to the Telegram Bot API using server-side credentials.
// The bot token never appears in the client JavaScript bundle.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { message, threadId } = await req.json();

    if (!message || !threadId) {
      return new Response('Missing message or threadId', {
        status: 400,
        headers: corsHeaders,
      });
    }

    const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!BOT_TOKEN || !CHAT_ID) {
      return new Response('Missing credentials', {
        status: 500,
        headers: corsHeaders,
      });
    }

    const body: Record<string, unknown> = {
      chat_id: CHAT_ID,
      message_thread_id: Number(threadId),
      parse_mode: 'Markdown',
      text: message,
    };

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();

    if (!result.ok) {
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response('Server error', {
      status: 500,
      headers: corsHeaders,
    });
  }
});
