import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StockTab } from '../components/admin/StockTab';
import { PalmaresTab } from '../components/admin/PalmaresTab';
import { RecherchesTab } from '../components/admin/RecherchesTab';
import { LiensTab } from '../components/admin/LiensTab';
import AdminLogin from './AdminLogin';
import { AdminTabs } from '../components/admin/AdminTabs';
import { ADMIN_LOGOUT_TEXT } from '../constants/adminLabels';
import type { AdminTab } from '../types/adminTab';
import type { Session } from '@supabase/supabase-js';

export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<AdminTab>('stock');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return null;
  }

  if (!session) {
    return <AdminLogin />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="px-5 md:px-8 lg:px-12 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <button
            onClick={handleLogout}
            className="font-jost font-light text-[11px] uppercase tracking-[0.15em] text-vd-caption bg-transparent border-none p-0 hover:text-vd-text transition-colors duration-150"
          >
            {ADMIN_LOGOUT_TEXT}
          </button>
        </div>

        {activeTab === 'stock' && <StockTab />}
        {activeTab === 'palmares' && <PalmaresTab />}
        {activeTab === 'recherches' && <RecherchesTab />}
        {activeTab === 'liens' && <LiensTab />}
      </div>
    </main>
  );
}
