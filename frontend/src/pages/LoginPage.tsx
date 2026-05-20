import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', birth_date: '', birth_place: ''
  });

  const { login, register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/discovery';

  const mapSupabaseError = (msg: string): string => {
    if (msg.includes('Email not confirmed'))        return 'Votre e-mail n\'est pas encore confirmé. Vérifiez votre boîte mail.';
    if (msg.includes('Invalid login credentials'))  return 'Email ou mot de passe incorrect.';
    if (msg.includes('User already registered'))    return 'Un compte existe déjà avec cet email.';
    if (msg.includes('Password should be'))         return 'Le mot de passe doit contenir au moins 6 caractères.';
    return msg || 'Une erreur est survenue.';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register({
          name: form.name,
          email: form.email.trim().toLowerCase(),
          password: form.password,
          birth_date: form.birth_date || undefined,
          birth_place: form.birth_place || undefined,
        });
      } else {
        await login(form.email.trim().toLowerCase(), form.password);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(mapSupabaseError(err?.message || err?.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = form.email.trim().toLowerCase();
    if (!email) { setError('Saisissez votre email pour réinitialiser le mot de passe.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    });
    setLoading(false);
    if (err) setError(mapSupabaseError(err.message));
    else setError('');
    alert(err ? mapSupabaseError(err.message) : `Un lien de réinitialisation a été envoyé à ${email}.`);
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="min-h-screen flex">
      {/* Left: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://www.au-senegal.com/IMG/jpg/13-23-2.jpg"
          alt="Casamance"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-emerald-900/60 flex items-center justify-center">
          <div className="text-center text-white px-12">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Leaf size={32} className="text-emerald-300" />
            </div>
            <h2 className="text-4xl font-black mb-4">Casamance Tour</h2>
            <p className="text-emerald-100 text-lg">
              Découvrez la magie de la Casamance — nature, culture et authenticité
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="flex items-center gap-2 justify-center mb-6">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-black">CT</span>
              </div>
              <span className="font-black text-xl text-slate-900">Casamance Tour</span>
            </Link>
            <h1 className="text-3xl font-black text-slate-900">
              {isRegister ? t('auth.register') : t('auth.login')}
            </h1>
            <p className="text-slate-500 mt-2">
              {isRegister ? 'Créez votre compte pour commencer' : 'Connectez-vous à votre compte'}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.name')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  required
                  placeholder="Mamadou Diallo"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                required
                placeholder="votre@email.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.birthDate')}</label>
                  <input
                    type="date"
                    value={form.birth_date}
                    onChange={set('birth_date')}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.birthPlace')}</label>
                  <input
                    type="text"
                    value={form.birth_place}
                    onChange={set('birth_place')}
                    placeholder="Ziguinchor, Sénégal"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition"
                  />
                </div>
              </>
            )}

            {!isRegister && (
              <div className="text-right">
                <button type="button" onClick={handleForgotPassword} className="text-sm text-emerald-600 hover:underline">
                  {t('auth.forgotPassword')}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Chargement...</>
              ) : (
                isRegister ? t('auth.registerSubmit') : t('auth.submit')
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {isRegister ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-emerald-600 font-semibold hover:underline"
            >
              {isRegister ? t('auth.login') : t('auth.register')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
