import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-vd-border transition-opacity duration-200 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="px-5 md:px-8 lg:px-12 py-4">
        <p className="font-jost font-light text-vd-meta text-center text-xs">
          {message}
        </p>
      </div>
    </div>
  );
}
