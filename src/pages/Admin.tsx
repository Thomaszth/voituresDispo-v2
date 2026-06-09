import { useState, useEffect } from 'react';
import { useVoitures, notifyVoituresChanged } from '../hooks/useVoitures';
import { VoitureDB } from '../types/voitureDB';
import { formatPrice } from '../utils/formatPrice';
import { supabase } from '../lib/supabase';
import { VehicleDrawer } from '../components/VehicleDrawer';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';

const ACTION_BTN =
  'font-jost font-light text-xs text-vd-meta hover:text-vd-text underline-offset-2 hover:underline transition-colors duration-150 cursor-pointer bg-transparent border-none p-0';

const CORRECT_PASSWORD = import.meta.env.VITE_CORRECT_PASSWORD as string;
const SESSION_KEY = 'vd_admin_auth';

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onSuccess();
    } else {
      setError(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5">
      <div className="w-full max-w-[360px] flex flex-col items-center text-center">
        <p
          className="font-jost font-light uppercase text-[10px] tracking-[0.25em]"
          style={{ color: '#9A9A9A' }}
        >
          ACCÈS RESTREINT
        </p>
        <h1
          className="font-cormorant font-light mt-4"
          style={{ fontSize: '36px', color: '#0A0A0A' }}
        >
          Espace Administration
        </h1>
        <div
          className="w-[60px] h-px mx-auto"
          style={{ backgroundColor: '#E0E0E0', marginTop: '24px', marginBottom: '24px' }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            setError(false);
          }}
          onKeyDown={handleKeyDown}
          className="w-full font-jost font-light text-sm text-vd-text placeholder:text-vd-caption focus:outline-none focus:border-vd-text"
          style={{
            fontSize: '14px',
            border: '1px solid #E0E0E0',
            padding: '14px 16px',
            borderRadius: '2px',
            maxWidth: '360px',
          }}
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-vd-black text-white font-jost uppercase font-light text-xs tracking-[0.15em] transition-colors duration-200 hover:bg-gray-800 mt-4"
          style={{ padding: '14px', maxWidth: '360px' }}
        >
          ACCÉDER
        </button>
        {error && (
          <p
            className="font-jost font-light mt-3"
            style={{ fontSize: '11px', color: '#9A9A9A' }}
          >
            Mot de passe incorrect.
          </p>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const { voitures, loading } = useVoitures();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<VoitureDB | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VoitureDB | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      setAuthenticated(true);
    }
  }, []);

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  const openAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (car: VoitureDB) => {
    setEditing(car);
    setDrawerOpen(true);
  };

  const toggleStatus = async (car: VoitureDB) => {
    const newStatus = car.status === 'available' ? 'sold' : 'available';
    await supabase.from('voitures').update({ status: newStatus }).eq('id', car.id);
    notifyVoituresChanged();
  };

  const copyLink = async (car: VoitureDB) => {
    const url = `${window.location.origin}/voitures/${car.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(car.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback silently
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await supabase.from('voitures').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    notifyVoituresChanged();
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="px-5 md:px-8 lg:px-12 py-8">
        {/* Top bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-vd-border">
          <p className="font-jost font-[400] uppercase text-vd-text text-[13px] tracking-[0.2em]">
            Voitures Dispo — Gestion du Stock
          </p>
          <button
            onClick={openAdd}
            className="w-full md:w-auto bg-vd-black text-white font-jost uppercase font-light text-xs tracking-[0.15em] px-6 py-3 transition-colors duration-200 hover:bg-gray-800"
          >
            AJOUTER UN VÉHICULE +
          </button>
        </div>

        {loading ? (
          <p className="font-jost font-light text-vd-caption text-sm">Chargement...</p>
        ) : voitures.length === 0 ? (
          <p className="font-jost font-light text-vd-caption text-sm">Aucun véhicule.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-vd-border">
                    {['Photo', 'Véhicule', 'Prix total', 'Statut', 'Actions'].map(col => (
                      <th
                        key={col}
                        className="text-left font-jost font-light uppercase text-vd-caption text-[10px] tracking-[0.15em] pb-3 pr-6 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {voitures.map(car => (
                    <tr key={car.id} className="border-b border-vd-border">
                      <td className="py-4 pr-6">
                        <div className="w-14 h-14 rounded-sm overflow-hidden bg-vd-surface flex-shrink-0">
                          {car.images[0] ? (
                            <img
                              src={car.images[0]}
                              alt={`${car.make} ${car.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-vd-surface" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        <p className="font-jost font-[400] text-vd-text text-sm whitespace-nowrap">
                          {car.year} {car.make} {car.model}
                        </p>
                      </td>
                      <td className="py-4 pr-6">
                        <p className="font-jost font-light text-vd-text text-sm whitespace-nowrap">
                          {formatPrice(car.owner_asking_price + car.service_fee)}
                        </p>
                      </td>
                      <td className="py-4 pr-6">
                        <p className="font-jost font-light text-vd-meta text-sm">
                          {car.status === 'available' ? 'Disponible' : 'Vendu'}
                        </p>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          <button className={ACTION_BTN} onClick={() => openEdit(car)}>
                            Modifier
                          </button>
                          <button className={ACTION_BTN} onClick={() => toggleStatus(car)}>
                            Changer le statut
                          </button>
                          <button
                            className={ACTION_BTN}
                            onClick={() => copyLink(car)}
                          >
                            {copiedId === car.id ? (
                              <span className="text-vd-text">Copié !</span>
                            ) : (
                              'Copier le lien'
                            )}
                          </button>
                          <button
                            className={`${ACTION_BTN} hover:!text-vd-text`}
                            onClick={() => setDeleteTarget(car)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-4">
              {voitures.map(car => (
                <div key={car.id} className="border border-vd-border rounded-sm overflow-hidden">
                  <div
                    className="w-full overflow-hidden flex items-center justify-center"
                    style={{ height: '200px', backgroundColor: '#0A0A0A' }}
                  >
                    {car.images[0] ? (
                      <img
                        src={car.images[0]}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: '#0A0A0A' }} />
                    )}
                  </div>

                  <div className="px-4 py-3 border-b border-vd-border">
                    <p className="font-jost font-[400] text-vd-text text-sm">
                      {car.year} {car.make} {car.model}
                    </p>
                    <p className="font-jost font-light text-vd-text text-sm mt-1">
                      {formatPrice(car.owner_asking_price + car.service_fee)}
                    </p>
                    <p className="font-jost font-light text-vd-meta text-xs mt-1">
                      {car.status === 'available' ? 'Disponible' : 'Vendu'}
                    </p>
                  </div>

                  <div className="flex flex-col divide-y divide-vd-border">
                    <button
                      onClick={() => openEdit(car)}
                      className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface transition-colors duration-150"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => toggleStatus(car)}
                      className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface transition-colors duration-150"
                    >
                      Changer le statut
                    </button>
                    <button
                      onClick={() => copyLink(car)}
                      className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface transition-colors duration-150"
                    >
                      {copiedId === car.id ? 'Copié !' : 'Copier le lien'}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(car)}
                      className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface hover:text-vd-text transition-colors duration-150"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <VehicleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editing={editing}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}
