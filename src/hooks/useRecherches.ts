import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface RechercheDB {
  id: string;
  carName: string;
  budgetNote: string;
  status: string;
  photo: string | null;
  specifics: string | null;
  created_at: string;
}

let listeners: Array<() => void> = [];
let cachedRecherches: RechercheDB[] | null = null;
let isFetching = false;

function mapRow(row: Record<string, unknown>): RechercheDB {
  return {
    id: row.id as string,
    carName: row.car_name as string,
    budgetNote: row.budget_note as string,
    status: row.status as string,
    photo: (row.photo as string | null) ?? null,
    specifics: (row.specifics as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

async function fetchAll() {
  if (isFetching) return;
  isFetching = true;
  const { data, error } = await supabase
    .from('recherches')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  isFetching = false;
  if (!error && data) {
    cachedRecherches = data.map(row => mapRow(row as unknown as Record<string, unknown>));
    listeners.forEach(fn => fn());
  }
}

export function notifyRecherchesChanged() {
  cachedRecherches = null;
  isFetching = false;
  fetchAll();
}

export function useRecherches() {
  const [recherches, setRecherches] = useState<RechercheDB[]>(cachedRecherches ?? []);
  const [loading, setLoading] = useState(cachedRecherches === null);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(() => {
    if (cachedRecherches !== null) {
      setRecherches(cachedRecherches);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listeners.push(sync);
    if (cachedRecherches === null) {
      setLoading(true);
      supabase
        .from('recherches')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .then(({ data, error: err }) => {
          if (err) {
            setError(err.message);
          } else if (data) {
            cachedRecherches = data.map(row => mapRow(row as unknown as Record<string, unknown>));
            setRecherches(cachedRecherches);
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
