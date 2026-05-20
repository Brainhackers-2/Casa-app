import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Waves, MapPin, TreePine,
  UserCheck, X, Star, Clock, Globe, Phone,
  CheckCircle, XCircle, ChevronUp,
} from 'lucide-react';
import { ACTIVITIES, GUIDES } from '../data';
import { useTranslation } from '../context/LanguageContext';
import type { Activity, Guide } from '../types';

/* ─── Teal brand color ──────────────────────────────────────── */
const TEAL = '#006A6A';

/* ─── Guide filter helpers ───────────────────────────────────── */
const GUIDE_KEYWORDS: Record<string, string[]> = {
  Sport:   ['Pêche', 'Navigation', 'Randonnée', 'Safari', 'Écotourisme'],
  Culture: ['Culture', 'Histoire', 'Art', 'Artisanat', 'Tradition'],
  Nature:  ['Ornithologie', 'Faune', 'Forêt', 'Conservation', 'Écotourisme'],
};

function guidesFor(activity: Activity): Guide[] {
  const kw = GUIDE_KEYWORDS[activity.type] ?? [];
  const matched = GUIDES.filter(g =>
    g.specialty.some(s => kw.some(k => s.toLowerCase().includes(k.toLowerCase())))
  );
  return matched.length ? matched : GUIDES.slice(0, 4);
}

/* ─── Filter config ──────────────────────────────────────────── */
type FilterType = 'All' | 'Sport' | 'Culture' | 'Nature';
const FILTERS: { id: FilterType; label: string; Icon: React.ElementType }[] = [
  { id: 'All',     label: 'Explorer (Tous)', Icon: Sparkles },
  { id: 'Sport',   label: 'Sports',          Icon: Waves    },
  { id: 'Culture', label: 'Culture',         Icon: MapPin   },
  { id: 'Nature',  label: 'Nature',          Icon: TreePine },
];

/* ─── Overlay 1 — Guide Selection ───────────────────────────── */
function GuideOverlay({
  activity,
  onClose,
  onSelect,
}: {
  activity: Activity;
  onClose: () => void;
  onSelect: (g: Guide) => void;
}) {
  const guides = guidesFor(activity);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col md:flex-row animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Left — emerald-900 */}
        <div className="bg-emerald-900 text-white p-8 md:w-72 flex-shrink-0 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-5">
              <UserCheck size={24} />
            </div>
            <h2 className="text-2xl font-black mb-3">Choisissez votre expert</h2>
            <p className="text-emerald-200 text-sm leading-relaxed mb-6">
              Pour vivre pleinement cette expérience de{' '}
              <span className="font-bold text-white">«&nbsp;{activity.name}&nbsp;»</span>,
              sélectionnez l'un de nos guides spécialisés en{' '}
              <span className="text-emerald-300">{activity.type}</span>.
            </p>
            <div className="border-t border-emerald-700 pt-5">
              <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-1">Région</p>
              <p className="text-white font-semibold">{activity.region}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-6 flex items-center justify-center gap-2 py-2.5 border border-white/30 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            <X size={14} /> Annuler
          </button>
        </div>

        {/* Right — white */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Guides Recommandés</h3>
            <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200">
              <X size={16} />
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {guides.length === 0 ? (
              <p className="col-span-2 text-center text-slate-400 py-8">
                Aucun guide spécifique trouvé pour ce type d'activité.
              </p>
            ) : guides.map(guide => (
              <button
                key={guide.id}
                onClick={() => onSelect(guide)}
                className="text-left group border border-slate-100 hover:border-emerald-500 rounded-2xl p-4 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={guide.image}
                    alt={guide.name}
                    loading="lazy"
                    decoding="async"
                    className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 text-sm leading-snug">{guide.name}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: TEAL }}>{guide.experience}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {guide.languages.slice(0, 3).map(l => (
                    <span key={l} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{l}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-white rounded-xl py-2 px-3" style={{ background: TEAL }}>
                  Sélectionner <span>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Overlay 2 — Activity Detail ───────────────────────────── */
function ActivityDetail({
  activity,
  onClose,
  onBook,
}: {
  activity: Activity;
  onClose: () => void;
  onBook: (a: Activity) => void;
}) {
  const mapsUrl = `https://maps.google.com/search?query=${encodeURIComponent(activity.name + ' ' + activity.region + ' Casamance Senegal')}`;

  const PROS = [
    { ok: true,  label: 'Expertise locale',   desc: 'Une connaissance approfondie du contexte historique et culturel enrichit chaque excursion.' },
    { ok: true,  label: 'Logistique fiable',  desc: 'Planification complète et coordination des guides, des transports et des activités.' },
    { ok: true,  label: 'Sécurité et confiance', desc: 'Sentiment de sécurité permanent et communication très réactive avec le guide.' },
    { ok: false, label: 'Tarifs perçus',      desc: 'Les tarifs reflètent un service haut de gamme sur-mesure dans la région.' },
  ];

  return (
    <div
      className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ animation: 'slideUp 0.3s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close btn */}
        <div className="flex justify-end p-4 pb-0">
          <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 pt-2 grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left (3/5) */}
          <div className="lg:col-span-3">
            <h2 className="text-4xl font-bold text-slate-900 mb-3 leading-tight">{activity.name}</h2>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-5 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Star size={14} style={{ color: TEAL }} className="fill-current" /> 4,6 <span className="text-slate-300">(136)</span>
              </span>
              <span className="text-slate-300">·</span>
              <span style={{ color: TEAL }} className="font-semibold">Ouverture</span>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
              <MapPin size={15} style={{ color: TEAL }} /> {activity.region}
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
              <Clock size={15} style={{ color: TEAL }} />
              Aujourd'hui — Ouvert 24h/24
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <a href={mapsUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                <MapPin size={15} /> Itinéraire
              </a>
              <a href="https://casamance-tour.com" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                <Globe size={15} /> Site web
              </a>
              <a href="tel:+22100000000"
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                <Phone size={15} /> Appeler
              </a>
            </div>

            {/* Choose this if... */}
            <div className="border border-slate-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-3">
                <ChevronUp size={16} /> Choisissez ceci si...
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                Vous souhaitez une expérience sénégalaise profondément personnalisée, guidée par un
                expert local qui organise toute la logistique pour vous emmener dans des lieux authentiques.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PROS.map(p => (
                  <div key={p.label} className="p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2 mb-1">
                      {p.ok
                        ? <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                        : <XCircle size={14} className="text-slate-400 flex-shrink-0" />}
                      <span className="text-xs font-bold text-slate-900">{p.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right (2/5) */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="aspect-square rounded-2xl overflow-hidden h-80">
              <img src={activity.image} alt={activity.name} className="w-full h-full object-cover" />
            </div>

            {/* Price + book */}
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900 mb-1">
                {activity.price.toLocaleString()} <span className="text-base font-semibold text-slate-500">FCFA</span>
              </p>
              <p className="text-slate-400 text-xs mb-4 flex items-center justify-center gap-1">
                <Clock size={12} /> Durée : {activity.duration}
              </p>
              <button
                onClick={() => {
                  onClose();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  onBook(activity);
                }}
                className="w-full py-3.5 rounded-full font-bold text-white text-sm transition-opacity hover:opacity-90"
                style={{ background: TEAL }}
              >
                Réserver un guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Activity Card ──────────────────────────────────────────── */
function ActivityCard({
  activity,
  onInfo,
}: {
  activity: Activity;
  onInfo: (a: Activity) => void;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <div className="h-48 overflow-hidden relative">
        <img
          src={activity.image}
          alt={activity.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-[1.1rem] font-bold text-slate-900 line-clamp-1 mb-2">{activity.name}</h3>

        {/* Rating + status */}
        <div className="flex items-center gap-1.5 text-sm mb-2">
          <Star size={14} style={{ color: TEAL }} className="fill-current flex-shrink-0" />
          <span className="font-semibold" style={{ color: TEAL }}>4,6</span>
          <span className="text-slate-300">·</span>
          <span className="text-sm font-medium" style={{ color: TEAL }}>Ouverture</span>
        </div>

        {/* Check/Cross */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2 text-xs" style={{ color: TEAL }}>
            <CheckCircle size={13} className="flex-shrink-0" /> Expertise guidée
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <XCircle size={13} className="flex-shrink-0" /> Disponibilité variable
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onInfo(activity)}
          className="w-full py-2.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ background: TEAL }}
        >
          Plus d'infos
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function ActivitiesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('All');
  const [selectedActivityForGuide, setSelectedActivityForGuide] = useState<Activity | null>(null);
  const [selectedActivityInfo, setSelectedActivityInfo] = useState<Activity | null>(null);

  const source = ACTIVITIES.filter(a => a.type !== 'Gastronomie');
  const displayed = filter === 'All' ? source : source.filter(a => a.type === filter);

  const handleBookingStart = (activity: Activity) => {
    setSelectedActivityForGuide(activity);
  };

  const handleSelectGuide = (guide: Guide) => {
    if (!selectedActivityForGuide) return;
    const params = new URLSearchParams({
      type: selectedActivityForGuide.type,
      item: selectedActivityForGuide.name,
      region: selectedActivityForGuide.region,
      guideName: guide.name,
      guideImage: guide.image,
    });
    navigate(`/booking?${params}`);
    setSelectedActivityForGuide(null);
  };


  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Section 1 — En-tête ──────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-slate-900 mb-3">{t('nav.activities')}</h1>
          <p className="text-slate-500 max-w-2xl mb-8 leading-relaxed">
            La Casamance offre un mélange unique d'activités sportives, culturelles et naturelles
            pour tous les goûts. Découvrez notre sélection des meilleures expériences.
          </p>

          {/* Conseil expert */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex gap-4 items-start">
            <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCheck size={20} className="text-emerald-700" />
            </div>
            <div>
              <p className="font-bold text-emerald-900 mb-1">Conseil d'expert</p>
              <p className="text-emerald-700 text-sm leading-relaxed">
                Réservez via l'Office de Tourisme de Casamance à Ziguinchor pour être accompagné
                par des guides locaux certifiés. La saison sèche (novembre à mai) est la période idéale !
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2 — Filtres ──────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-2 justify-center">
          {FILTERS.map(({ id, label, Icon }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95 hover:scale-105 ${
                  active
                    ? 'text-white shadow-xl ring-2 ring-offset-2'
                    : 'bg-white text-slate-500 border border-slate-200 shadow-sm'
                }`}
                style={active ? { background: TEAL } : {}}
              >
                <Icon size={16} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 3 — Grille ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-6">
          {displayed.length} activité{displayed.length > 1 ? 's' : ''} trouvée{displayed.length > 1 ? 's' : ''}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayed.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onInfo={act => setSelectedActivityInfo(act)}
            />
          ))}
        </div>
      </div>

      {/* ── Overlay 1 — Guide ────────────────────────────────────── */}
      {selectedActivityForGuide && (
        <GuideOverlay
          activity={selectedActivityForGuide}
          onClose={() => setSelectedActivityForGuide(null)}
          onSelect={handleSelectGuide}
        />
      )}

      {/* ── Overlay 2 — Fiche détaillée ──────────────────────────── */}
      {selectedActivityInfo && (
        <ActivityDetail
          activity={selectedActivityInfo}
          onClose={() => setSelectedActivityInfo(null)}
          onBook={act => {
            setSelectedActivityInfo(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            handleBookingStart(act);
          }}
        />
      )}
    </div>
  );
}
