import { useState } from 'react';
import {
  Phone, Mail, Building2, MessageCircle, AlertTriangle,
  Globe, Target, HelpCircle, ChevronDown, MapPin, Send,
  CheckCircle,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

/* ─── Brand color ────────────────────────────────────────────── */
const DARK = '#1A3C34';
const BG_INPUT = '#fdfbf7';

/* ─── Map views ──────────────────────────────────────────────── */
type MapView = 'global' | 'ziguinchor' | 'sedhiou' | 'kolda';
const MAP_URLS: Record<MapView, string> = {
  global:
    'https://maps.google.com/maps?q=Casamance+Senegal&t=&z=9&ie=UTF8&iwloc=&output=embed',
  ziguinchor:
    'https://maps.google.com/maps?q=Ziguinchor+Senegal&t=&z=13&ie=UTF8&iwloc=&output=embed',
  sedhiou:
    'https://maps.google.com/maps?q=Sedhiou+Senegal&t=&z=13&ie=UTF8&iwloc=&output=embed',
  kolda:
    'https://maps.google.com/maps?q=Kolda+Senegal&t=&z=13&ie=UTF8&iwloc=&output=embed',
};
const MAP_BUTTONS: { id: MapView; label: string; Icon: React.ElementType; activeStyle: string }[] = [
  { id: 'global',     label: 'Vue Globale',         Icon: Globe,  activeStyle: 'bg-slate-900 text-white' },
  { id: 'ziguinchor', label: 'Ziguinchor (Basse)',   Icon: Target, activeStyle: `text-white` },
  { id: 'sedhiou',    label: 'Sédhiou (Moyenne)',    Icon: Target, activeStyle: `text-white` },
  { id: 'kolda',      label: 'Kolda (Haute)',        Icon: Target, activeStyle: `text-white` },
];

/* ─── FAQs ───────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'Comment se passe la réservation ?',
    a: "Une fois votre formulaire envoyé, un conseiller local Casamance Tour examine votre demande. Nous vous envoyons une confirmation de disponibilité et les détails de paiement (virement, Wave ou espèces sur place) sous 24 à 48h.",
  },
  {
    q: "Quelle est la meilleure période pour visiter la Casamance ?",
    a: "La saison sèche (novembre à mai) est idéale : le ciel est bleu et les températures sont agréables. La saison des pluies (juillet à septembre) offre des paysages incroyablement verts, mais certaines pistes peuvent être difficiles d'accès.",
  },
  {
    q: "La région est-elle sûre pour les voyageurs ?",
    a: "Absolument. La Casamance est une région paisible et accueillante. Nous recommandons simplement d'utiliser des guides locaux pour les zones plus reculées afin de respecter les coutumes locales et d'emprunter les meilleurs itinéraires.",
  },
];

/* ─── Offices ────────────────────────────────────────────────── */
const OFFICES = [
  { city: 'Ziguinchor (Siège)', address: 'Avenue Jule Ferry, face au port',      region: 'Basse-Casamance',    phone: '+221 33 991 12 34' },
  { city: 'Sédhiou',            address: 'Quartier Doumassou, près du fleuve',   region: 'Moyenne-Casamance',  phone: '+221 33 995 00 11' },
  { city: 'Kolda',              address: 'Route de Vélingara, centre-ville',      region: 'Haute-Casamance',    phone: '+221 33 996 22 88' },
];

/* ─── Email regex ────────────────────────────────────────────── */
const emailRe = /^\S+@\S+\.\S+$/;

/* ─── Page ───────────────────────────────────────────────────── */
export default function ContactPage() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    subject: 'Informations générales',
    name: '',
    email: '',
    message: '',
  });
  const [formError, setFormError] = useState('');
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currentMapView, setCurrentMapView] = useState<MapView>('global');

  const set = (key: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormError('');
    setFormData(f => ({ ...f, [key]: e.target.value }));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    const { name, email, message } = formData;
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!emailRe.test(email)) {
      setFormError('Veuillez saisir une adresse e-mail valide.');
      return;
    }

    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const inputCls = `w-full px-4 py-4 border border-slate-200 rounded-3xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[${DARK}]/30 transition`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* ── En-tête ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-black text-slate-900 mb-4">
            {t('contact.title') || 'Restons en Contact'}
          </h1>
          <p className="text-slate-600 leading-relaxed">
            {t('contact.subtitle') ||
              'Une question ? Un projet de voyage ? Nos équipes de Ziguinchor, Sédhiou et Kolda sont à votre écoute.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-20">

        {/* ── SECTION 1 — Infos + Formulaire ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Colonne gauche — Infos */}
          <div className="space-y-6">

            {/* Coordonnées directes */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { Icon: Phone, label: 'Standard Unique', value: '+221 33 991 12 34' },
                { Icon: Mail, label: 'Email', value: 'contact@casamancetour.sn' },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                    style={{ background: `${DARK}1A` }}>
                    <Icon size={18} style={{ color: DARK }} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Antennes régionales */}
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-4">
                <Building2 size={18} style={{ color: DARK }} />
                Nos Antennes Régionales
              </h3>
              <div className="space-y-3">
                {OFFICES.map(o => (
                  <div key={o.city}
                    className="rounded-3xl p-5 border border-slate-100 hover:border-emerald-200 transition-colors"
                    style={{ background: BG_INPUT }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-slate-900">{o.city}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{o.address}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: DARK }}>
                          {o.region}
                        </p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">{o.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="rounded-3xl p-8 text-white shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
              style={{ background: DARK }}>
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle size={24} />
                <p className="font-bold text-lg">Support WhatsApp Direct</p>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Réponse rapide de nos guides locaux via notre ligne WhatsApp officielle.
              </p>
              <a
                href="https://wa.me/221339911234"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white font-black px-8 py-4 rounded-3xl hover:bg-slate-100 transition-colors text-sm"
                style={{ color: DARK }}
              >
                Ouvrir WhatsApp
              </a>
            </div>
          </div>

          {/* Colonne droite — Formulaire */}
          <div
            className="bg-white p-10 rounded-[2.5rem] border border-slate-100"
            style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
          >
            {/* Error banner */}
            {formError && (
              <div className="flex items-center gap-3 bg-rose-50 text-rose-600 rounded-3xl p-4 text-sm font-bold mb-6 animate-fade-in">
                <AlertTriangle size={18} className="flex-shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {t('contact.form.subject') || 'Sujet de votre demande'} *
                </label>
                <select
                  value={formData.subject}
                  onChange={set('subject')}
                  className="w-full px-4 py-4 border border-slate-200 rounded-3xl text-slate-900 text-sm focus:outline-none focus:ring-2 transition"
                  style={{ background: BG_INPUT }}
                >
                  <option>Informations générales</option>
                  <option>Réservation de guide</option>
                  <option>Hébergement &amp; Logistique</option>
                  <option>Partenariats</option>
                </select>
              </div>

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={set('name')}
                    placeholder="Mamadou Diallo"
                    className={`${inputCls} ${formError && !formData.name.trim() ? 'border-rose-300 focus:ring-rose-500' : ''}`}
                    style={{ background: BG_INPUT }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={set('email')}
                    placeholder="vous@exemple.com"
                    className={`${inputCls} ${formError && (!formData.email.trim() || !emailRe.test(formData.email)) ? 'border-rose-300 focus:ring-rose-500' : ''}`}
                    style={{ background: BG_INPUT }}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {t('contact.form.message') || 'Votre message'} *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={set('message')}
                  placeholder="Décrivez votre projet..."
                  className={`${inputCls} resize-none ${formError && !formData.message.trim() ? 'border-rose-300 focus:ring-rose-500' : ''}`}
                  style={{ background: BG_INPUT }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={sent}
                className="w-full py-5 rounded-3xl font-black text-white flex items-center justify-center gap-3 transition-all duration-300 disabled:cursor-not-allowed"
                style={sent ? { background: `${DARK}1A`, color: DARK } : {
                  background: DARK,
                  boxShadow: '0 8px 30px rgba(26,60,52,0.15)',
                }}
                onMouseEnter={e => { if (!sent) (e.currentTarget as HTMLButtonElement).style.background = '#2A4C44'; }}
                onMouseLeave={e => { if (!sent) (e.currentTarget as HTMLButtonElement).style.background = DARK; }}
              >
                {sent ? (
                  <><CheckCircle size={18} /> {t('contact.form.sent') || "C'est envoyé !"}</>
                ) : (
                  <><Send size={18} /> {t('contact.form.submit') || 'Envoyer le message'}</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── SECTION 2 — Carte Interactive ────────────────────────── */}
        <div>
          <div className="text-center mb-10">
            <span
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4"
              style={{ background: BG_INPUT, color: DARK }}
            >
              <MapPin size={13} /> Géographie du Voyage
            </span>
            <h2 className="text-4xl font-black text-slate-900">Les 3 Régions sur la Carte</h2>
          </div>

          {/* View buttons */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {MAP_BUTTONS.map(({ id, label, Icon, activeStyle }) => {
              const isActive = currentMapView === id;
              return (
                <button
                  key={id}
                  onClick={() => setCurrentMapView(id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-3xl text-xs font-black transition-all ${
                    isActive
                      ? `${activeStyle} shadow-lg`
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-[#fdfbf7]'
                  }`}
                  style={isActive && id !== 'global' ? { background: DARK } : {}}
                >
                  <Icon size={14} /> {label}
                </button>
              );
            })}
          </div>

          {/* Map iframe */}
          <div
            className="w-full overflow-hidden"
            style={{
              height: '650px',
              borderRadius: '3.5rem',
              border: '8px solid white',
              boxShadow: '0 40px 80px rgba(0,0,0,0.12)',
            }}
          >
            <iframe
              key={currentMapView}
              src={MAP_URLS[currentMapView]}
              title="Carte Casamance"
              width="100%"
              height="100%"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="border-0"
            />
          </div>
        </div>

        {/* ── SECTION 3 — FAQ ───────────────────────────────────────── */}
        <div>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 text-emerald-400 rounded-3xl rotate-3 mb-5">
              <HelpCircle size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900">
              {t('contact.faq.title') || 'Questions Fréquentes'}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-7 py-6 text-left"
                  >
                    <span className="font-black text-slate-900 text-sm sm:text-base pr-4">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`flex-shrink-0 transition-transform duration-500 ${
                        isOpen ? 'rotate-180' : 'text-slate-400'
                      }`}
                      style={isOpen ? { color: DARK } : {}}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      isOpen ? 'max-h-64 opacity-100 pb-8' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="px-7 text-slate-600 leading-relaxed font-medium text-sm">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
