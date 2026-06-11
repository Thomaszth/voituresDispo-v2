import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PalmaresDB } from '../types/palmares';

let listeners: Array<() => void> = [];
let cachedPalmares: PalmaresDB[] | null = null;
let isFetching = false;

async function fetchAll() {
  if (isFetching) return;
  isFetching = true;
  const { data, error } = await supabase
    .from('palmares')
    .select('*')
    .order('created_at', { ascending: false });
  isFetching = false;
  if (!error && data) {
    cachedPalmares = data as PalmaresDB[];
    listeners.forEach(fn => fn());
  }
}

export function notifyPalmaresChanged() {
  cachedPalmares = null;
  isFetching = false;
  fetchAll();
}

export function usePalmares() {
  const [palmares, setPalmares] = useState<PalmaresDB[]>(cachedPalmares ?? []);
  const [loading, setLoading] = useState(cachedPalmares === null);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(() => {
    if (cachedPalmares !== null) {
      setPalmares(cachedPalmares);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listeners.push(sync);
    if (cachedPalmares === null) {
      setLoading(true);
      supabase
        .from('palmares')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error: err }) => {
          if (err) {
            setError(err.message);
          } else if (data) {
            cachedPalmares = data as PalmaresDB[];
            setPalmares(cachedPalmares);
          }
          setLoading(false);
        });
    }
    return () => {
      listeners = listeners.filter(fn => fn !== sync);
    };
  }, [sync]);

  return { palmares, loading, error };
}
