import { useState, useEffect } from 'react';

export function useScrollHint() {
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    const fadeTimeout = setTimeout(() => {
      setHintVisible(true);
    }, 1200);
    return () => clearTimeout(fadeTimeout);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShowScrollHint(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { showScrollHint, hintVisible };
}
