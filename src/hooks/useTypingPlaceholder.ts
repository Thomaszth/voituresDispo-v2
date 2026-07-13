import { useEffect, useRef, useState, useCallback } from 'react';

const TYPE_SPEED = 55;
const HOLD_DELAY = 1800;
const DELETE_SPEED = 35;
const BETWEEN_DELAY = 400;
const RESTART_DELAY = 600;

interface UseTypingPlaceholderOptions {
  phrases: string[];
  active: boolean;
}

export function useTypingPlaceholder({ phrases, active }: UseTypingPlaceholderOptions) {
  const [placeholder, setPlaceholder] = useState('');
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stoppedRef = useRef(false);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
  }, []);

  const runCycle = useCallback(
    (phraseIndex: number, charIndex: number, mode: 'type' | 'hold' | 'delete' | 'wait') => {
      if (stoppedRef.current) return;

      const phrase = phrases[phraseIndex % phrases.length];

      if (mode === 'type') {
        if (charIndex <= phrase.length) {
          setPlaceholder(phrase.slice(0, charIndex));
          schedule(() => runCycle(phraseIndex, charIndex + 1, 'type'), TYPE_SPEED);
        } else {
          schedule(() => runCycle(phraseIndex, charIndex, 'hold'), HOLD_DELAY);
        }
      } else if (mode === 'hold') {
        runCycle(phraseIndex, phrase.length, 'delete');
      } else if (mode === 'delete') {
        if (charIndex > 0) {
          setPlaceholder(phrase.slice(0, charIndex - 1));
          schedule(() => runCycle(phraseIndex, charIndex - 1, 'delete'), DELETE_SPEED);
        } else {
          setPlaceholder('');
          schedule(() => runCycle(phraseIndex + 1, 0, 'wait'), BETWEEN_DELAY);
        }
      } else if (mode === 'wait') {
        runCycle(phraseIndex, 0, 'type');
      }
    },
    [phrases, schedule]
  );

  const start = useCallback(() => {
    clearAllTimeouts();
    stoppedRef.current = false;
    setPlaceholder('');
    runCycle(0, 0, 'type');
  }, [clearAllTimeouts, runCycle]);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    clearAllTimeouts();
    setPlaceholder('');
  }, [clearAllTimeouts]);

  const restart = useCallback(() => {
    clearAllTimeouts();
    stoppedRef.current = false;
    setPlaceholder('');
    schedule(() => {
      if (!stoppedRef.current) {
        runCycle(0, 0, 'type');
      }
    }, RESTART_DELAY);
  }, [clearAllTimeouts, runCycle, schedule]);

  useEffect(() => {
    if (active) {
      start();
    } else {
      stop();
    }
    return () => {
      clearAllTimeouts();
    };
  }, [active, start, stop, clearAllTimeouts]);

  return { placeholder, start, stop, restart };
}
