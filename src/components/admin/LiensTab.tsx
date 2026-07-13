import { useState } from 'react';

const SITE_URL = 'https://voituresdispo.netlify.app';

const DESTINATIONS = [
  { label: "Page d'accueil du catalogue", value: '/catalogue' },
  { label: 'Page Palmarès', value: '/palmares' },
  { label: 'Page Recherches', value: '/recherches' },
];

const PLATFORMS = [
  { label: 'Facebook + Instagram (Meta Ads)', value: 'meta' },
  { label: 'Facebook uniquement', value: 'facebook' },
  { label: 'Instagram uniquement', value: 'instagram' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Autre', value: 'autre' },
];

interface HistoryEntry {
  id: string;
  name: string;
  link: string;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '-');
}

function buildTerrainLink(name: string, destination: string): string {
  return `${SITE_URL}${destination}?ref=${name}`;
}

function buildAdLink(campaign: string, platform: string, destination: string): string {
  if (platform === 'meta') {
    return `${SITE_URL}${destination}?utm_source={{site_source_name}}&utm_medium=paid&utm_campaign=${campaign}`;
  }
  return `${SITE_URL}${destination}?utm_source=${platform}&utm_medium=paid&utm_campaign=${campaign}`;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-jost uppercase text-[10px] tracking-[0.25em] text-vd-caption">
      {children}
    </p>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-jost uppercase text-[10px] tracking-[0.18em] text-vd-caption mb-2">
      {children}
    </label>
  );
}

function BlackButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="font-jost uppercase font-light tracking-[0.15em] text-white bg-vd-text rounded-[2px] px-6 py-3.5 transition-opacity duration-150 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function ResultBlock({
  link,
  helperNote,
  onCopy,
  copied,
}: {
  link: string;
  helperNote?: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[2px] p-4 md:p-5 mt-5">
      <p className="font-jost uppercase text-[10px] tracking-[0.2em] text-vd-caption mb-2">
        LIEN GÉNÉRÉ
      </p>
      <p className="font-jost font-light text-[13px] text-vd-text break-all">{link}</p>
      {helperNote && (
        <p className="font-jost font-light text-[11px] text-vd-caption mt-2">{helperNote}</p>
      )}
      <button
        type="button"
        onClick={onCopy}
        className="w-full font-jost uppercase font-light tracking-[0.15em] text-white bg-vd-text rounded-[2px] px-6 py-3.5 mt-4 transition-opacity duration-150 hover:opacity-90"
      >
        {copied ? 'COPIÉ ✓' : 'COPIER LE LIEN'}
      </button>
    </div>
  );
}

function HistoryList({
  label,
  entries,
  onCopy,
}: {
  label: string;
  entries: HistoryEntry[];
  onCopy: (link: string) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <div className="mt-8">
      <p className="font-jost uppercase text-[10px] text-vd-caption mb-3">{label}</p>
      <ul className="flex flex-col gap-2">
        {entries.map(entry => (
          <li
            key={entry.id}
            className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 py-2 border-b border-[#E0E0E0] last:border-b-0"
          >
            <span className="font-jost font-normal text-vd-text md:min-w-[140px]">
              {entry.name}
            </span>
            <span className="font-jost font-light text-[13px] text-[#6B6B6B] break-all flex-1">
              {entry.link}
            </span>
            <button
              type="button"
              onClick={() => onCopy(entry.link)}
              className="font-jost font-light text-[12px] text-vd-text underline-offset-2 hover:underline self-start md:self-auto"
            >
              Copier
            </button>
          </li>
        ))}
      </ul>
      <p className="font-jost font-light text-[12px] text-vd-caption mt-3">
        Ces liens ne sont pas sauvegardés — notez-les avant de quitter cette page.
      </p>
    </div>
  );
}

export function LiensTab() {
  // Terrain state
  const [terrainName, setTerrainName] = useState('');
  const [terrainDestination, setTerrainDestination] = useState('/catalogue');
  const [terrainLink, setTerrainLink] = useState('');
  const [terrainCopied, setTerrainCopied] = useState(false);
  const [terrainHistory, setTerrainHistory] = useState<HistoryEntry[]>([]);

  // Ads state
  const [adCampaign, setAdCampaign] = useState('');
  const [adPlatform, setAdPlatform] = useState('meta');
  const [adDestination, setAdDestination] = useState('/catalogue');
  const [adLink, setAdLink] = useState('');
  const [adCopied, setAdCopied] = useState(false);
  const [adHistory, setAdHistory] = useState<HistoryEntry[]>([]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // silently ignored
    }
  };

  const handleTerrainGenerate = () => {
    const name = slugify(terrainName).replace(/-+$/g, '');
    if (!name) return;
    const link = buildTerrainLink(name, terrainDestination);
    setTerrainLink(link);
    setTerrainHistory(prev => [
      { id: crypto.randomUUID(), name, link },
      ...prev,
    ].slice(0, 10));
  };

  const handleTerrainCopy = () => {
    if (!terrainLink) return;
    copyToClipboard(terrainLink);
    setTerrainCopied(true);
    setTimeout(() => setTerrainCopied(false), 2000);
  };

  const handleAdGenerate = () => {
    const campaign = slugify(adCampaign).replace(/-+$/g, '');
    if (!campaign) return;
    const link = buildAdLink(campaign, adPlatform, adDestination);
    setAdLink(link);
    setAdHistory(prev => [
      { id: crypto.randomUUID(), name: campaign, link },
      ...prev,
    ].slice(0, 10));
  };

  const handleAdCopy = () => {
    if (!adLink) return;
    copyToClipboard(adLink);
    setAdCopied(true);
    setTimeout(() => setAdCopied(false), 2000);
  };

  const handleHistoryCopy = (link: string) => {
    copyToClipboard(link);
  };

  const adHelperNote =
    adPlatform === 'meta' && adLink
      ? "ℹ️ Ce lien contient {{site_source_name}} — Meta le remplacera automatiquement par 'fb', 'ig' ou 'msg' selon la plateforme sur laquelle votre publicité a été cliquée. Ne modifiez pas cette variable."
      : undefined;

  return (
    <div className="flex flex-col">
      {/* SECTION 1 — LIENS TERRAIN */}
      <section>
        <SectionLabel>LIENS TERRAIN</SectionLabel>
        <h2 className="font-jost uppercase font-normal text-[13px] tracking-[0.2em] text-vd-text mt-2">
          GÉNÉRER UN LIEN POUR UN COMMERCIAL
        </h2>
        <p className="font-jost font-light text-[13px] text-[#6B6B6B] mt-2 mb-6">
          Chaque commercial reçoit un lien unique. Quand un prospect clique dessus, toutes ses
          actions sur le site sont attribuées à ce commercial.
        </p>

        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <FieldLabel>NOM DU COMMERCIAL</FieldLabel>
            <input
              type="text"
              value={terrainName}
              onChange={e => setTerrainName(slugify(e.target.value))}
              placeholder="Ex : John, Marie, Thomas..."
              className="w-full font-jost font-light text-[13px] text-vd-text border border-[#E0E0E0] rounded-[2px] px-3 py-2.5 focus:outline-none focus:border-vd-text"
            />
          </div>
          <div className="flex-1">
            <FieldLabel>PAGE DE DESTINATION</FieldLabel>
            <select
              value={terrainDestination}
              onChange={e => setTerrainDestination(e.target.value)}
              className="w-full font-jost font-light text-[13px] text-vd-text border border-[#E0E0E0] rounded-[2px] px-3 py-2.5 bg-white focus:outline-none focus:border-vd-text"
            >
              {DESTINATIONS.map(d => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <BlackButton onClick={handleTerrainGenerate} disabled={!terrainName.trim()}>
            GÉNÉRER →
          </BlackButton>
        </div>

        {terrainLink && (
          <ResultBlock link={terrainLink} onCopy={handleTerrainCopy} copied={terrainCopied} />
        )}

        <HistoryList
          label="LIENS GÉNÉRÉS CETTE SESSION"
          entries={terrainHistory}
          onCopy={handleHistoryCopy}
        />
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-[#E0E0E0] my-10" />

      {/* SECTION 2 — LIENS PUBLICITAIRES */}
      <section>
        <SectionLabel>LIENS PUBLICITAIRES</SectionLabel>
        <h2 className="font-jost uppercase font-normal text-[13px] tracking-[0.2em] text-vd-text mt-2">
          GÉNÉRER UN LIEN POUR UNE PUBLICITÉ
        </h2>
        <p className="font-jost font-light text-[13px] text-[#6B6B6B] mt-2 mb-6">
          Collez ce lien dans Meta Ads Manager comme URL de destination. Les paramètres UTM
          permettent de tracer d'où viennent vos visiteurs avec précision.
        </p>

        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <FieldLabel>NOM DE LA CAMPAGNE</FieldLabel>
            <input
              type="text"
              value={adCampaign}
              onChange={e => setAdCampaign(slugify(e.target.value))}
              placeholder="Ex : camry-juillet, test-video-1"
              className="w-full font-jost font-light text-[13px] text-vd-text border border-[#E0E0E0] rounded-[2px] px-3 py-2.5 focus:outline-none focus:border-vd-text"
            />
          </div>
          <div className="flex-1">
            <FieldLabel>PLATEFORME</FieldLabel>
            <select
              value={adPlatform}
              onChange={e => setAdPlatform(e.target.value)}
              className="w-full font-jost font-light text-[13px] text-vd-text border border-[#E0E0E0] rounded-[2px] px-3 py-2.5 bg-white focus:outline-none focus:border-vd-text"
            >
              {PLATFORMS.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <FieldLabel>PAGE DE DESTINATION</FieldLabel>
            <select
              value={adDestination}
              onChange={e => setAdDestination(e.target.value)}
              className="w-full font-jost font-light text-[13px] text-vd-text border border-[#E0E0E0] rounded-[2px] px-3 py-2.5 bg-white focus:outline-none focus:border-vd-text"
            >
              {DESTINATIONS.map(d => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <BlackButton onClick={handleAdGenerate} disabled={!adCampaign.trim()}>
            GÉNÉRER →
          </BlackButton>
        </div>

        {adLink && (
          <ResultBlock
            link={adLink}
            helperNote={adHelperNote}
            onCopy={handleAdCopy}
            copied={adCopied}
          />
        )}

        <HistoryList
          label="LIENS GÉNÉRÉS CETTE SESSION"
          entries={adHistory}
          onCopy={handleHistoryCopy}
        />
      </section>
    </div>
  );
}
