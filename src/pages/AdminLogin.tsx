import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ADMIN_LOGIN_LABELS } from '../constants/adminLabels';
import { FieldError } from '../components/admin/FieldError';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setEmailError(!email.trim());
    setPasswordError(!password.trim());

    if (!email.trim() || !password.trim()) {
      return;
    }

    setLoading(true);
    setAuthError(false);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setAuthError(true);
      setLoading(false);
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
          {ADMIN_LOGIN_LABELS.restrictedAccess}
        </p>
        <h1 className="font-cormorant font-light mt-4 text-[36px] text-vd-text">
          {ADMIN_LOGIN_LABELS.title}
        </h1>
        <div className="w-[60px] h-px mx-auto mt-6 mb-6 bg-vd-border" />
        <div className="w-full space-y-4">
          <div className="w-full flex flex-col items-center">
            <input
              type="email"
              placeholder={ADMIN_LOGIN_LABELS.emailPlaceholder}
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setEmailError(false);
                setAuthError(false);
              }}
              onKeyDown={handleKeyDown}
              className="w-full font-jost font-light text-sm text-vd-text placeholder:text-vd-caption focus:outline-none focus:border-vd-text text-[14px] border border-vd-border px-4 py-3.5 rounded-sm"
            />
            <FieldError show={emailError} />
          </div>
          <div className="w-full flex flex-col items-center">
            <input
              type="password"
              placeholder={ADMIN_LOGIN_LABELS.passwordPlaceholder}
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setPasswordError(false);
                setAuthError(false);
              }}
              onKeyDown={handleKeyDown}
              className="w-full font-jost font-light text-sm text-vd-text placeholder:text-vd-caption focus:outline-none focus:border-vd-text text-[14px] border border-vd-border px-4 py-3.5 rounded-sm"
            />
            <FieldError show={passwordError} />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-vd-black text-white font-jost uppercase font-light text-xs tracking-[0.15em] transition-colors duration-200 hover:bg-gray-800 mt-4 px-4 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? ADMIN_LOGIN_LABELS.loadingButton : ADMIN_LOGIN_LABELS.submitButton}
        </button>
        {authError && (
          <p className="font-jost font-light mt-3 text-[11px] text-vd-caption">
            {ADMIN_LOGIN_LABELS.authError}
          </p>
        )}
      </div>
    </div>
  );
}
