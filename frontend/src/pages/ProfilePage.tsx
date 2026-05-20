import { useState } from 'react';
import { User, Mail, Lock, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';


interface SectionState {
  loading: boolean;
  success: string;
  error: string;
}

const INIT: SectionState = { loading: false, success: '', error: '' };

export default function ProfilePage() {
  const { user } = useAuth();

  /* ── Nom ────────────────────────────────────────────────── */
  const [name,    setName]    = useState(user?.name || '');
  const [nameS,   setNameS]   = useState<SectionState>(INIT);

  /* ── Email ──────────────────────────────────────────────── */
  const [email,   setEmail]   = useState(user?.email || '');
  const [emailS,  setEmailS]  = useState<SectionState>(INIT);

  /* ── Mot de passe ───────────────────────────────────────── */
  const [curPwd,  setCurPwd]  = useState('');
  const [newPwd,  setNewPwd]  = useState('');
  const [cfmPwd,  setCfmPwd]  = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdS,    setPwdS]    = useState<SectionState>(INIT);

  /* ── Helpers ────────────────────────────────────────────── */
  const busy = (s: SectionState) => s.loading;

  const run = async (
    setState: (s: SectionState) => void,
    fn: () => Promise<void>
  ) => {
    setState({ loading: true, success: '', error: '' });
    try {
      await fn();
      setState({ loading: false, success: 'Modification enregistrée.', error: '' });
    } catch (err: any) {
      setState({ loading: false, success: '', error: err.message || 'Une erreur est survenue.' });
    }
  };

  /* ── Actions ────────────────────────────────────────────── */
  const saveName = () => run(setNameS, async () => {
    if (!name.trim()) throw new Error('Le nom ne peut pas être vide.');
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    if (error) throw error;
    await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', user!.id);
  });

  const saveEmail = () => run(setEmailS, async () => {
    if (!email.trim() || !email.includes('@')) throw new Error('Adresse email invalide.');
    if (email.trim() === user?.email) throw new Error('C\'est déjà votre email actuel.');
    const { error } = await supabase.auth.updateUser({ email: email.trim() });
    if (error) throw error;
    setEmailS({ loading: false, success: 'Un email de confirmation a été envoyé à la nouvelle adresse.', error: '' });
  });

  const savePassword = () => run(setPwdS, async () => {
    if (!curPwd) throw new Error('Saisissez votre mot de passe actuel.');
    if (newPwd.length < 6) throw new Error('Le nouveau mot de passe doit contenir au moins 6 caractères.');
    if (newPwd !== cfmPwd) throw new Error('Les mots de passe ne correspondent pas.');
    // Re-authentification avec le mot de passe actuel
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user!.email,
      password: curPwd,
    });
    if (signInErr) throw new Error('Mot de passe actuel incorrect.');
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) throw error;
    setCurPwd(''); setNewPwd(''); setCfmPwd('');
  });

  /* ── UI helpers ─────────────────────────────────────────── */
  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition';
  const btnCls   = 'flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

  const Feedback = ({ s }: { s: SectionState }) => (
    <>
      {s.success && (
        <p className="flex items-center gap-1.5 text-emerald-700 text-sm mt-2">
          <Check size={15} /> {s.success}
        </p>
      )}
      {s.error && (
        <p className="flex items-center gap-1.5 text-rose-600 text-sm mt-2">
          <AlertCircle size={15} /> {s.error}
        </p>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-emerald-900 py-14 px-4 text-center">
        <div className="w-20 h-20 bg-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-black text-white">
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <h1 className="text-3xl font-black text-white mb-1">{user?.name}</h1>
        <p className="text-emerald-300 text-sm">{user?.email}</p>
        {user?.role === 'admin' && (
          <span className="inline-block mt-3 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            Administrateur
          </span>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">

        {/* ── Changer le nom ──────────────────────────────── */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <User size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Nom affiché</h2>
              <p className="text-xs text-slate-400">Visible sur votre profil et vos réservations</p>
            </div>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Votre nom complet"
              className={inputCls}
            />
            <div className="flex items-center justify-between">
              <Feedback s={nameS} />
              <button onClick={saveName} disabled={busy(nameS) || name.trim() === user?.name} className={btnCls}>
                {nameS.loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sauvegarde...</> : <><Check size={15} /> Sauvegarder</>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Changer l'email ──────────────────────────────── */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Mail size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Adresse email</h2>
              <p className="text-xs text-slate-400">Un email de confirmation sera envoyé à la nouvelle adresse</p>
            </div>
          </div>
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nouvelle@email.com"
              className={inputCls}
            />
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Feedback s={emailS} />
              <button onClick={saveEmail} disabled={busy(emailS)} className={`${btnCls} bg-blue-600 hover:bg-blue-700`}>
                {emailS.loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi...</> : <><Mail size={15} /> Changer l'email</>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Changer le mot de passe ──────────────────────── */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Lock size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Mot de passe</h2>
              <p className="text-xs text-slate-400">Minimum 6 caractères</p>
            </div>
          </div>
          <div className="space-y-4">
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mot de passe actuel</label>
              <div className="relative">
                <input
                  type={showCur ? 'text' : 'password'}
                  value={curPwd}
                  onChange={e => setCurPwd(e.target.value)}
                  placeholder="••••••"
                  className={`${inputCls} pr-10`}
                />
                <button type="button" onClick={() => setShowCur(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showCur ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="••••••"
                  className={`${inputCls} pr-10`}
                />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {/* Confirmation */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={cfmPwd}
                onChange={e => setCfmPwd(e.target.value)}
                placeholder="••••••"
                className={inputCls}
              />
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Feedback s={pwdS} />
              <button onClick={savePassword} disabled={busy(pwdS)} className={`${btnCls} bg-amber-600 hover:bg-amber-700`}>
                {pwdS.loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mise à jour...</> : <><Lock size={15} /> Changer le mot de passe</>}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
