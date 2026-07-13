// og-preview Edge Function
// Returns an HTML page with Open Graph meta tags for a given car ID.
// Called by social media crawlers via Netlify redirect rules.
// Human visitors never hit this function — they get the React app.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SITE_URL = 'https://voituresdispo.netlify.app';

// When you get your domain, update this to:
// const SITE_URL = 'https://voituresdispo.com';
// Then redeploy this function. Nothing else needs to change.

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const carId = url.searchParams.get('id');

    if (!carId) {
      return new Response('Missing id', { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: car, error } = await supabase
      .from('voitures')
      .select('id, make, model, year, displayed_price, description, images')
      .eq('id', carId)
      .single();

    if (error || !car) {
      return new Response('Car not found', { status: 404 });
    }

    const title = `${car.year} ${car.make} ${car.model} — Voitures Dispo`;

    const photo = Array.isArray(car.images) && car.images.length > 0
      ? car.images[0]
      : `${SITE_URL}/og-default.svg`;

    const price = car.displayed_price
      ? new Intl.NumberFormat('fr-FR').format(car.displayed_price) + ' FCFA'
      : '';

    const description = car.description
      ? car.description.slice(0, 160)
      : `${car.year} ${car.make} ${car.model}${price ? ' — ' + price : ''} — Disponible sur Voitures Dispo.`;

    const pageUrl = `${SITE_URL}/voitures/${car.id}`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${photo}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Voitures Dispo" />
  <meta property="og:locale" content="fr_FR" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${photo}" />

  <meta http-equiv="refresh" content="0;url=${pageUrl}" />
</head>
<body>
  <p>Redirection en cours...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (err) {
    return new Response('Server error', { status: 500 });
  }
});
