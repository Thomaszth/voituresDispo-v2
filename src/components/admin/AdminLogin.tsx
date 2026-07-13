import { useState } from 'react';

const CORRECT_PASSWORD = import.meta.env.VITE_CORRECT_PASSWORD as string;
const SESSION_KEY = 'vd_admin_auth';

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
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
        <p className="font-jost font-light uppercase text-[10px] tracking-[0.25em] text-vd-caption">
          ACCÈS RESTREINT
        </p>
        <h1 className="font-cormorant font-light mt-4 text-[36px] text-vd-text">
          Espace Administration
        </h1>
        <div className="w-[60px] h-px mx-auto mt-6 mb-6 bg-vd-border" />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            setError(false);
          }}
          onKeyDown={handleKeyDown}
          className="w-full font-jost font-light text-sm text-vd-text placeholder:text-vd-caption focus:outline-none focus:border-vd-text text-[14px] border border-vd-border px-4 py-3.5 rounded-sm"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-vd-black text-white font-jost uppercase font-light text-xs tracking-[0.15em] transition-colors duration-200 hover:bg-gray-800 mt-4 px-4 py-3.5"
        >
          ACCÉDER
        </button>
        {error && (
          <p className="font-jost font-light mt-3 text-[11px] text-vd-caption">
            Mot de passe incorrect.
          </p>
        )}
      </div>
    </div>
  );
}

export const ADMIN_SESSION_KEY = SESSION_KEY;
