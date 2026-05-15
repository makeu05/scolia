'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/auth';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-[#1D9E75] rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div>
            <p className="text-[#e2e8f0] font-medium text-base leading-tight">SchoolDash</p>
            <p className="text-[#64748b] text-xs">Portail administrateur</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#1a1d27] border border-[#2e3347] rounded-2xl p-8">

          {sent ? (
            /* ── État : email envoyé ── */
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-[#0F6E56] rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9FE1CB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h1 className="text-[#e2e8f0] text-xl font-medium mb-2">Email envoyé</h1>
              <p className="text-[#64748b] text-sm leading-relaxed mb-6">
                Si l&apos;adresse <span className="text-[#94a3b8]">{email}</span> existe dans notre système, vous recevrez les instructions de réinitialisation sous quelques minutes.
              </p>
              <p className="text-[#64748b] text-xs mb-6">
                Pensez à vérifier vos spams.
              </p>
              <Link
                href="/login"
                className="text-[#1D9E75] hover:text-[#9FE1CB] text-sm transition-colors"
              >
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            /* ── Formulaire ── */
            <>
              <div className="inline-block bg-[#0F6E56] text-[#9FE1CB] text-xs px-3 py-1 rounded-full mb-5">
                Réinitialisation
              </div>
              <h1 className="text-[#e2e8f0] text-xl font-medium mb-1">Mot de passe oublié</h1>
              <p className="text-[#64748b] text-sm mb-6">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>

              {/* Alerte info */}
              <div className="bg-[#0F6E56]/30 border border-[#1D9E75]/40 rounded-lg px-4 py-3 mb-6 flex gap-3">
                <svg width="18" height="18" className="shrink-0 mt-0.5 text-[#1D9E75]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-[#9FE1CB] text-xs leading-relaxed">
                  Un email avec les instructions sera envoyé à votre adresse si elle existe dans notre système.
                </p>
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-lg px-4 py-3 mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[#94a3b8] text-xs font-medium tracking-wide mb-1.5">
                    ADRESSE EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@school.cm"
                    className="w-full bg-[#0f1117] border border-[#2e3347] rounded-lg px-3.5 py-2.5 text-[#e2e8f0] text-sm placeholder-[#3d4560] outline-none focus:border-[#1D9E75] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </form>

              <p className="text-center mt-6">
                <Link href="/login" className="text-[#1D9E75] hover:text-[#9FE1CB] text-sm transition-colors">
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}