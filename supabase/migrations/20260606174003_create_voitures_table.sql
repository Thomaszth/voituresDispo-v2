
/*
# Create voitures table

## Summary
Creates the `voitures` table to persist vehicle listings for the Voitures Dispo catalogue.
This is a single-tenant admin app (no user authentication), so RLS policies allow
anon + authenticated access. All existing JSON data is seeded into the table.

## New Tables

### voitures
Stores all vehicle listings displayed on the public catalogue.

Columns:
- `id` (text, primary key) — short string ID matching existing JSON data
- `make` (text) — car brand (e.g. Mercedes-Benz)
- `model` (text) — car model (e.g. Classe S 500)
- `year` (integer) — production year
- `owner_asking_price` (integer) — owner's listed price in FCFA
- `service_fee` (integer) — Voitures Dispo service fee in FCFA
- `mileage` (text) — e.g. "12 000 km"
- `color` (text) — e.g. "Noir Obsidienne"
- `fuel_type` (text) — Essence | Diesel | Électrique | Hybride
- `licence_plate_letters` (text) — e.g. "EC"
- `fuel_consumption` (text) — e.g. "8.2L / 100km"
- `transmission` (text) — Automatique | Manuelle
- `motor_type` (text) — e.g. "V6 biturbo"
- `vehicle_location` (text) — e.g. "Cotonou, Bénin"
- `dealer_purchased` (boolean) — whether bought from a dealer
- `under_warranty` (boolean, nullable) — warranty status
- `warranty_details` (text, nullable) — warranty description
- `status` (text) — "available" | "sold"
- `description` (text) — long-form description
- `images` (text[]) — array of image URLs
- `created_at` (timestamptz) — auto-set on insert
- `sort_order` (integer) — for ordering in catalogue

## Security
- RLS enabled
- anon + authenticated can SELECT, INSERT, UPDATE, DELETE (single-tenant admin app)
*/

CREATE TABLE IF NOT EXISTS voitures (
  id text PRIMARY KEY,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  owner_asking_price integer NOT NULL DEFAULT 0,
  service_fee integer NOT NULL DEFAULT 0,
  mileage text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '',
  fuel_type text NOT NULL DEFAULT 'Essence',
  licence_plate_letters text NOT NULL DEFAULT '',
  fuel_consumption text NOT NULL DEFAULT '',
  transmission text NOT NULL DEFAULT 'Automatique',
  motor_type text NOT NULL DEFAULT '',
  vehicle_location text NOT NULL DEFAULT '',
  dealer_purchased boolean NOT NULL DEFAULT false,
  under_warranty boolean,
  warranty_details text,
  status text NOT NULL DEFAULT 'available',
  description text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE voitures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_voitures" ON voitures;
CREATE POLICY "anon_select_voitures" ON voitures FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_voitures" ON voitures;
CREATE POLICY "anon_insert_voitures" ON voitures FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_voitures" ON voitures;
CREATE POLICY "anon_update_voitures" ON voitures FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_voitures" ON voitures;
CREATE POLICY "anon_delete_voitures" ON voitures FOR DELETE
TO anon, authenticated USING (true);

-- Seed existing JSON data
INSERT INTO voitures (id, make, model, year, owner_asking_price, service_fee, mileage, color, fuel_type, licence_plate_letters, fuel_consumption, transmission, motor_type, vehicle_location, dealer_purchased, under_warranty, warranty_details, status, description, images, sort_order)
VALUES
(
  '1', 'Mercedes-Benz', 'Classe S 500', 2023, 129900, 1500,
  '12 000 km', 'Noir Obsidienne', 'Essence', 'EC', '8.2L / 100km',
  'Automatique', 'V6 biturbo', 'Cotonou, Bénin', true, true,
  'Garantie constructeur 2 ans / 40 000 km', 'available',
  'La Mercedes Classe S incarne l''excellence automobile dans sa forme la plus aboutie. Dotée d''un intérieur somptueux en cuir Nappa et d''une technologie de pointe, cette berline de prestige offre une expérience de conduite incomparable.',
  ARRAY['https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg','https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg','https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg'],
  1
),
(
  '2', 'BMW', 'Série 7 750e xDrive', 2024, 148500, 1800,
  '5 000 km', 'Blanc Alpin', 'Hybride', 'EC', '2.1L / 100km',
  'Automatique', 'V6 hybride rechargeable', 'Cotonou, Bénin', true, true,
  'Garantie constructeur 3 ans / 60 000 km', 'available',
  'La BMW Série 7 redéfinit le luxe à l''allemande avec son architecture avant-gardiste. Le groupe motopropulseur hybride rechargeable garantit une autonomie électrique impressionnante en ville.',
  ARRAY['https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg','https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg','https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg'],
  2
),
(
  '3', 'Porsche', 'Panamera Turbo S', 2023, 194700, 2200,
  '8 200 km', 'Gris Craie', 'Essence', 'EC', '11.5L / 100km',
  'Automatique', 'V8 biturbo', 'Cotonou, Bénin', true, true,
  'Garantie Porsche 3 ans / 100 000 km', 'available',
  'La Porsche Panamera Turbo S marie avec une perfection rare les performances sportives et le raffinement. Son V8 biturbo de 630 chevaux propulse cette élégante fastback de 0 à 100 km/h en 3,1 secondes.',
  ARRAY['https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg','https://images.pexels.com/photos/1638459/pexels-photo-1638459.jpeg','https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg'],
  3
),
(
  '4', 'Audi', 'A8 L 60 TFSI e', 2023, 138200, 1600,
  '18 500 km', 'Bleu Firmament', 'Hybride', 'EC', '2.4L / 100km',
  'Automatique', 'V6 hybride rechargeable', 'Cotonou, Bénin', false, false,
  null, 'sold',
  'L''Audi A8 L représente le summum de la technologie Audi appliquée au grand tourisme. La version longue offre un espace arrière généreux avec des sièges massants à réglages multiples.',
  ARRAY['https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg','https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg','https://images.pexels.com/photos/1231643/pexels-photo-1231643.jpeg'],
  4
),
(
  '5', 'Bentley', 'Continental GT V8', 2022, 289000, 3500,
  '22 000 km', 'Vert Britannique', 'Essence', 'EC', '13.2L / 100km',
  'Automatique', 'V8 biturbo', 'Cotonou, Bénin', true, true,
  'Garantie Bentley 1 an / 25 000 km', 'available',
  'La Bentley Continental GT est l''expression ultime du grand tourisme britannique. Assemblée à la main, chaque véhicule est une œuvre unique avec un intérieur en cuir Beluga.',
  ARRAY['https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg','https://images.pexels.com/photos/3786091/pexels-photo-3786091.jpeg','https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg'],
  5
),
(
  '6', 'Lexus', 'LS 500h AWD', 2023, 118900, 1400,
  '31 000 km', 'Noir Espresso', 'Hybride', 'EC', '5.8L / 100km',
  'Automatique', 'V6 hybride', 'Cotonou, Bénin', true, true,
  'Garantie constructeur 5 ans / 100 000 km', 'available',
  'La Lexus LS incarne la philosophie Omotenashi — l''hospitalité à la japonaise — dans chaque aspect de sa conception. La version hybride combine le raffinement d''un moteur V6 à la sérénité électrique.',
  ARRAY['https://images.pexels.com/photos/1231643/pexels-photo-1231643.jpeg','https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg','https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg'],
  6
)
ON CONFLICT (id) DO NOTHING;
