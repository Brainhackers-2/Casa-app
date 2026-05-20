import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User, Mail, Calendar, MapPin, MessageSquare,
  CheckCircle2, X, ArrowRight, Loader2, CreditCard,
  Smartphone, ShieldCheck, Award, Info, ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../context/LanguageContext';

/* ── Types ──────────────────────────────────────────────────── */
type Step = 'form' | 'confirm' | 'payment' | 'processing' | 'success';
type PayMethod = 'wave' | 'orange_money' | 'carte';

const TYPES    = ['Guide', 'Activité', 'Hébergement', 'Gastronomie', 'Découverte'] as const;
const REGIONS  = ['Basse-Casamance', 'Moyenne-Casamance', 'Haute-Casamance'] as const;

function basePrice(type: string) {
  if (type === 'Hébergement') return 35_000;
  if (type === 'Guide')       return 15_000;
  return 20_000;
}

const inputBase = 'w-full bg-white border rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all';
const inputOk   = `${inputBase} border-slate-200 focus:ring-emerald-200 focus:border-emerald-400`;
const inputErr  = `${inputBase} border-rose-300 focus:ring-rose-200 focus:border-rose-400`;

/* ── Page ───────────────────────────────────────────────────── */
export default function BookingPage() {
  const { user }       = useAuth();
  const { t }          = useTranslation();
  const [params]       = useSearchParams();

  /* États */
  const [bookingStep,   setStep]        = useState<Step>('form');
  const [formError,     setFormError]   = useState('');
  const [paymentMethod, setPayMethod]   = useState<PayMethod>('wave');
  const [paymentPhone,  setPayPhone]    = useState('');
  const [paymentCard,   setPayCard]     = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [formData, setFormData] = useState({
    name: user?.name || '', email: user?.email || '',
    date: '', type: 'Activité', region: 'Basse-Casamance', message: '',
  });

  /* Pré-remplissage depuis URL */
  useEffect(() => {
    const typeParam   = params.get('type')      || 'Activité';
    const regionParam = params.get('region')    || 'Basse-Casamance';
    const itemParam   = params.get('item')      || '';
    const guideName   = params.get('guideName') || '';

    let defaultMsg = itemParam  ? `Je souhaite réserver : ${itemParam}. ` : '';
    if (guideName)  defaultMsg += `Accompagnateur souhaité : ${guideName}.`;

    setFormData(f => ({
      ...f,
      type: typeParam,
      region: regionParam,
      message: defaultMsg,
      name: user?.name  || f.name,
      email: user?.email || f.email,
    }));
  }, [params, user]);

  const guideName  = params.get('guideName') || '';
  const guideImage = params.get('guideImage') || '';
  const itemParam  = params.get('item') || '';
  const price      = basePrice(formData.type);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(f => ({ ...f, [k]: e.target.value }));

  /* ── Validation étape 1 ─────────────────────────────────── */
  const validateForm = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.date) {
      setFormError('Veuillez remplir tous les champs obligatoires avant de continuer.');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setFormError('Veuillez saisir une adresse e-mail valide.');
      return false;
    }
    setFormError('');
    return true;
  };

  const goConfirm = () => { if (validateForm()) setStep('confirm'); };

  /* ── Soumission finale ──────────────────────────────────── */
  const handleFinalSubmit = async () => {
    if (paymentMethod === 'carte') {
      if (!paymentCard.number || !paymentCard.expiry || !paymentCard.cvc || !paymentCard.name) {
        setFormError('Veuillez remplir tous les champs de la carte.'); return;
      }
    } else {
      if (paymentPhone.replace(/\D/g, '').length < 9) {
        setFormError('Numéro de téléphone invalide (minimum 9 chiffres).'); return;
      }
    }
    setFormError('');
    setStep('processing');

    await new Promise(r => setTimeout(r, 2500));

    try {
      const sbUser = (await supabase.auth.getUser()).data.user;
      const methodLabel =
        paymentMethod === 'wave'         ? 'WAVE'         :
        paymentMethod === 'orange_money' ? 'ORANGE MONEY' : 'CARTE';

      const { error } = await supabase.from('bookings').insert([{
        name:         formData.name,
        email:        formData.email,
        booking_date: formData.date,
        type:         formData.type,
        region:       formData.region,
        message:      `${formData.message}\n\nMéthode de paiement: ${methodLabel}`,
        user_id:      sbUser?.id || null,
        status:       'en_attente',
      }]);
      if (error) throw error;

      setStep('success');
      setTimeout(() => {
        setFormData({ name: '', email: '', date: '', type: 'Activité', region: 'Basse-Casamance', message: '' });
        setStep('form');
      }, 5000);
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue. Veuillez réessayer.');
      setStep('payment');
    }
  };

  /* ── Formatage carte ────────────────────────────────────── */
  const fmtCardNum = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExpiry  = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d;
  };

  /* ── Erreurs de champ ───────────────────────────────────── */
  const nameErr  = !!formError && !formData.name.trim();
  const emailErr = !!formError && (!/^\S+@\S+\.\S+$/.test(formData.email) || !formData.email.trim());
  const dateErr  = !!formError && !formData.date;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-[#1A3C34] py-12 px-4 text-center">
        <h1 className="text-4xl font-black text-white mb-2">{t('booking.title') || 'Réservez votre expérience'}</h1>
        <p className="text-emerald-200">{t('booking.subtitle') || 'En quelques étapes simples et sécurisées'}</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ═══════════════════════════════════════════════
              COLONNE GAUCHE — Infos fixes
          ═══════════════════════════════════════════════ */}
          <div className="lg:w-1/2 space-y-6">

            {/* Titre */}
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                {t('booking.title') || 'Votre expérience sur mesure'}
              </h2>
              <p className="text-slate-500 leading-relaxed">
                {t('booking.subtitle') || 'Remplissez le formulaire pour débuter votre aventure en Casamance.'}
              </p>
            </div>

            {/* Carte guide (si guideName) */}
            {guideName && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-slide-up">
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    {guideImage ? (
                      <img src={guideImage} alt={guideName} className="w-20 h-20 rounded-3xl object-cover" />
                    ) : (
                      <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center">
                        <User size={32} className="text-emerald-600" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                      <ShieldCheck size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Award size={14} className="text-amber-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Votre accompagnateur</span>
                    </div>
                    <p className="font-black text-slate-900 text-lg truncate">{guideName}</p>
                    <p className="text-xs text-emerald-600 font-semibold">Expert local certifié</p>
                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Statut : <strong className="text-emerald-600">Assigné au dossier</strong></span>
                      <Link to="/guides" className="text-xs font-bold text-[#1A3C34] hover:underline">Détails ›</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Encart option (item sans guide) */}
            {itemParam && !guideName && (
              <div className="bg-[#fdfbf7] border border-slate-200 rounded-3xl p-5 flex items-start gap-3 animate-fade-in">
                <Info size={18} className="text-[#1A3C34] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-0.5">Option sélectionnée</p>
                  <p className="text-sm font-semibold text-slate-800">Vous réservez actuellement : <span className="text-[#1A3C34] font-black">{itemParam}</span></p>
                </div>
              </div>
            )}

            {/* Avantages */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🌿', title: 'Expérience Authentique', desc: 'Immergez-vous dans les traditions et la culture locale de la Casamance.' },
                { icon: '🔒', title: 'Paiement Sécurisé',      desc: 'Wave, Orange Money ou Carte Bancaire. Vos données sont protégées.' },
              ].map(c => (
                <div key={c.title} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <span className="text-2xl">{c.icon}</span>
                  <p className="font-bold text-slate-900 text-sm mt-2 mb-1">{c.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Téléphone urgence */}
            <div className="bg-[#1A3C34] rounded-3xl p-6 text-white">
              <p className="text-sm font-black uppercase tracking-widest text-emerald-300 mb-1">Besoin d'aide ?</p>
              <p className="text-2xl font-black">+221 33 991 XX XX</p>
              <p className="text-emerald-300 text-xs mt-1">Du lundi au samedi, 8h–20h</p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              COLONNE DROITE — Zone étapes
          ═══════════════════════════════════════════════ */}
          <div className="lg:w-1/2">

            {/* ── ÉTAPE 1 : Formulaire ────────────────────── */}
            {bookingStep === 'form' && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                <h3 className="text-xl font-black text-slate-900">Détails de votre demande</h3>

                {formError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-sm">
                    {formError}
                  </div>
                )}

                {/* Nom + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {t('booking.form.name') || 'Nom complet'} *
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={formData.name} onChange={set('name')}
                        placeholder="Jean Dupont"
                        className={`${nameErr ? inputErr : inputOk} pl-9`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {t('booking.form.email') || 'Email'} *
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="email" value={formData.email} onChange={set('email')}
                        placeholder="jean@exemple.com"
                        className={`${emailErr ? inputErr : inputOk} pl-9`} />
                    </div>
                  </div>
                </div>

                {/* Date + Région */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {t('booking.form.date') || 'Date souhaitée'} *
                    </label>
                    <div className="relative">
                      <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="date" value={formData.date} onChange={set('date')}
                        min={new Date().toISOString().split('T')[0]}
                        className={`${dateErr ? inputErr : inputOk} pl-9`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {t('booking.form.region') || 'Région'} *
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select value={formData.region} onChange={set('region')}
                        className={`${inputOk} pl-9 appearance-none`}>
                        {REGIONS.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Type (boutons pill) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Type de réservation
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map(t => (
                      <button key={t} onClick={() => setFormData(f => ({ ...f, type: t }))}
                        className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                          formData.type === t
                            ? 'bg-[#1A3C34] text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Message
                  </label>
                  <div className="relative">
                    <MessageSquare size={15} className="absolute left-3 top-3.5 text-slate-400" />
                    <textarea value={formData.message} onChange={set('message')} rows={4}
                      placeholder="Précisez vos souhaits, préférences ou questions..."
                      className={`${inputOk} pl-9 resize-none`} />
                  </div>
                </div>

                <button onClick={goConfirm}
                  className="w-full bg-[#1A3C34] hover:bg-[#2A4C44] hover:-translate-y-0.5 text-white py-4 rounded-3xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#1A3C34]/20">
                  <CheckCircle2 size={18} /> Continuer vers le paiement
                </button>
              </div>
            )}

            {/* ── ÉTAPE 3 : Paiement ──────────────────────── */}
            {bookingStep === 'payment' && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep('form')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm font-semibold">
                    <ChevronLeft size={16} /> Retour
                  </button>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Montant</p>
                    <p className="text-2xl font-black text-[#1A3C34]">{price.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900">Mode de paiement</h3>

                {formError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-sm">
                    {formError}
                  </div>
                )}

                {/* Sélection méthode */}
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: 'wave',         label: 'Wave',         color: 'border-blue-500 bg-blue-50',      icon: <Smartphone size={24} className="text-blue-600" /> },
                    { id: 'orange_money', label: 'Orange Money', color: 'border-orange-500 bg-orange-50',  icon: <Smartphone size={24} className="text-orange-500" /> },
                    { id: 'carte',        label: 'Carte',        color: 'border-[#1A3C34] bg-emerald-50',  icon: <CreditCard  size={24} className="text-[#1A3C34]" /> },
                  ] as const).map(m => (
                    <button key={m.id} onClick={() => setPayMethod(m.id as PayMethod)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === m.id ? m.color : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}>
                      {m.icon}
                      <span className="text-xs font-black text-slate-700">{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Téléphone (Wave / Orange Money) */}
                {(paymentMethod === 'wave' || paymentMethod === 'orange_money') && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-700 px-4 py-3 rounded-2xl text-sm font-black flex-shrink-0">+221</span>
                      <input type="tel" value={paymentPhone}
                        onChange={e => setPayPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="77 123 45 67"
                        className={`${inputOk} flex-1`} />
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Info size={12} /> Vous recevrez une notification pour valider le paiement de {price.toLocaleString('fr-FR')} FCFA.
                    </p>
                  </div>
                )}

                {/* Carte bancaire */}
                {paymentMethod === 'carte' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nom sur la carte</label>
                      <input type="text" value={paymentCard.name}
                        onChange={e => setPayCard(c => ({ ...c, name: e.target.value.toUpperCase() }))}
                        placeholder="JEAN DUPONT"
                        className={inputOk} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Numéro de la carte</label>
                      <div className="relative">
                        <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={paymentCard.number}
                          onChange={e => setPayCard(c => ({ ...c, number: fmtCardNum(e.target.value) }))}
                          placeholder="0000 0000 0000 0000" maxLength={19}
                          className={`${inputOk} pl-9`} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiration</label>
                        <input type="text" value={paymentCard.expiry}
                          onChange={e => setPayCard(c => ({ ...c, expiry: fmtExpiry(e.target.value) }))}
                          placeholder="MM/AA" maxLength={5}
                          className={inputOk} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CVC</label>
                        <input type="text" value={paymentCard.cvc}
                          onChange={e => setPayCard(c => ({ ...c, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                          placeholder="123" maxLength={3}
                          className={inputOk} />
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={handleFinalSubmit}
                  className="w-full bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 text-white py-4 rounded-3xl font-black flex items-center justify-center gap-2 transition-all">
                  Payer {price.toLocaleString('fr-FR')} FCFA <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* ── ÉTAPE 4 : Traitement ────────────────────── */}
            {bookingStep === 'processing' && (
              <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-6 animate-fade-in">
                <Loader2 size={40} className="text-[#2A4C44] animate-spin" />
                <div>
                  <p className="text-2xl font-bold text-slate-900 mb-1">Traitement de votre paiement...</p>
                  <p className="text-slate-500 text-sm">Veuillez ne pas fermer cette page</p>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 5 : Succès ────────────────────────── */}
            {bookingStep === 'success' && (
              <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-6 animate-fade-in">
                <div className="w-20 h-20 bg-[#1A3C34]/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={48} className="text-[#1A3C34]" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3">Paiement Réussi !</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Votre réservation pour le <strong>{new Date(formData.date).toLocaleDateString('fr-FR')}</strong> a été validée.
                    <br />Un reçu vous a été envoyé à <strong>{formData.email}</strong>.
                  </p>
                </div>
                <button onClick={() => setStep('form')}
                  className="bg-[#1A3C34] text-white px-8 py-4 rounded-full font-black hover:bg-[#2A4C44] transition-colors">
                  Effectuer une autre réservation
                </button>
                <p className="text-xs text-slate-400">Retour automatique dans 5 secondes...</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── MODAL Confirmation (étape 2) ─────────────────────── */}
      {bookingStep === 'confirm' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl animate-slide-up">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={28} className="text-[#1A3C34]" />
                <div>
                  <h3 className="text-xl font-black text-slate-900">Confirmer la demande ?</h3>
                  <p className="text-xs text-slate-500">Vérifiez les informations avant le paiement.</p>
                </div>
              </div>
              <button onClick={() => setStep('form')} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>

            {/* Récap */}
            <div className="bg-slate-50 rounded-2xl p-5 space-y-3 mb-6 text-sm">
              {[
                ['Nom',    formData.name],
                ['Type',   formData.type],
                ['Région', formData.region],
                ['Date',   new Date(formData.date).toLocaleDateString('fr-FR')],
                ...(guideName ? [['Accompagnateur', guideName]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">{k}</span>
                  <span className="font-black text-slate-900">{v}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Montant</span>
                <span className="text-lg font-black text-[#1A3C34]">{price.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('form')}
                className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-2xl font-semibold hover:bg-slate-50 transition-colors">
                Modifier
              </button>
              <button onClick={() => setStep('payment')}
                className="flex-1 bg-[#1A3C34] text-white py-3 rounded-2xl font-black hover:bg-[#2A4C44] transition-colors flex items-center justify-center gap-2">
                Aller au paiement <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
