import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { VoitureDB } from '../types/voitureDB';

let listeners: Array<() => void> = [];
let cachedVoitures: VoitureDB[] | null = null;
let isFetching = false;

async function fetchAll() {
  if (isFetching) return;
  isFetching = true;
  const { data, error } = await supabase
    .from('voitures')
    .select('*')
    .order('sort_order', { ascending: true });
  isFetching = false;
  if (!error && data) {
    cachedVoitures = data as VoitureDB[];
    listeners.forEach(fn => fn());
  }
}

export function notifyVoituresChanged() {
  cachedVoitures = null;
  isFetching = false;
  fetchAll();
}

export function useVoitures() {
  const [voitures, setVoitures] = useState<VoitureDB[]>(cachedVoitures ?? []);
  const [loading, setLoading] = useState(cachedVoitures === null);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(() => {
    if (cachedVoitures !== null) {
      setVoitures(cachedVoitures);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listeners.push(sync);
    if (cachedVoitures === null) {
      setLoading(true);
      supabase
        .from('voitures')
        .select('*')
        .order('sort_order', { ascending: true })
        .then(({ data, error: err }) => {
          if (err) {
            setError(err.message);
          } else if (data) {
            cachedVoitures = data as VoitureDB[];
            setVoitures(cachedVoitures);
          }
          setLoading(false);
        });
    }
    return () => {
      listeners = listeners.filter(fn => fn !== sync);
    };
  }, [sync]);

  return { voitures, loading, error };
}
