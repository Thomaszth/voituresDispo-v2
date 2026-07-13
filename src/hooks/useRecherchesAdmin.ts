import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface RechercheAdminDB {
  id: string;
  car_name: string;
  specifics: string;
  photo: string | null;
  budget_note: string | null;
  status: string;
  created_at: string;
}

let listeners: Array<() => void> = [];
let cachedRecherchesAdmin: RechercheAdminDB[] | null = null;
let isFetching = false;

async function fetchAll() {
  if (isFetching) return;
  isFetching = true;
  const { data, error } = await supabase
    .from('recherches')
    .select('*')
    .order('created_at', { ascending: false });
  isFetching = false;
  if (!error && data) {
    cachedRecherchesAdmin = data as RechercheAdminDB[];
    listeners.forEach(fn => fn());
  }
}

export function notifyRecherchesAdminChanged() {
  cachedRecherchesAdmin = null;
  isFetching = false;
  fetchAll();
}

export function useRecherchesAdmin() {
  const [recherches, setRecherches] = useState<RechercheAdminDB[]>(cachedRecherchesAdmin ?? []);
  const [loading, setLoading] = useState(cachedRecherchesAdmin === null);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(() => {
    if (cachedRecherchesAdmin !== null) {
      setRecherches(cachedRecherchesAdmin);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listeners.push(sync);
    if (cachedRecherchesAdmin === null) {
      setLoading(true);
      supabase
        .from('recherches')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error: err }) => {
          if (err) {
            setError(err.message);
          } else if (data) {
            cachedRecherchesAdmin = data as RechercheAdminDB[];
            setRecherches(cachedRecherchesAdmin);
          }
          setLoading(false);
        });
    }
    return () => {
      listeners = listeners.filter(fn => fn !== sync);
    };
  }, [sync]);

  return { recherches, loading, error };
}
