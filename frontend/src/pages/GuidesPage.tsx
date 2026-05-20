import { Link } from 'react-router-dom';
import { Share2, Award, Languages, Star, Calendar } from 'lucide-react';
import { GUIDES } from '../data';
import { useTranslation } from '../context/LanguageContext';
import type { Guide } from '../types';

/* ─── Helpers ────────────────────────────────────────────────── */
function handleShare(guide: Guide) {
  const url = window.location.href;
  const text = `Je te recommande ce guide local expert en Casamance : ${guide.name}. Il parle ${guide.languages.join(', ')}.`;
  if (navigator.share) {
    navigator.share({ title: `Guide Casamance : ${guide.name}`, text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => alert('Lien de la page copié !'));
  }
}

function bookingUrl(guide: Guide) {
  return `/booking?type=Guide&item=${encodeURIComponent(guide.name)}&region=${encodeURIComponent(guide.region)}`;
}

/* ─── Tooltip ────────────────────────────────────────────────── */
function ProfileTooltip({ guide }: { guide: Guide }) {
  return (
    <>
      {/* Desktop: right */}
      <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 pointer-events-none
        opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
        {/* Arrow */}
        <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-900 rotate-45" />
        <div className="bg-slate-900 rounded-2xl p-5 w-64 text-white shadow-2xl">
          <p className="font-bold border-b border-white/20 pb-2 mb-3">Profil complet</p>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold w-24 flex-shrink-0">Expérience :</span>
              <span>{guide.experience}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold w-24 flex-shrink-0">Langues :</span>
              <span>{guide.languages.join(', ')}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold w-24 flex-shrink-0">Spécialité :</span>
              <span>{guide.specialty.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: above */}
      <div className="md:hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none
        opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
        <div className="bg-slate-900 rounded-2xl p-4 w-56 text-white shadow-2xl">
          <p className="font-bold border-b border-white/20 pb-2 mb-2 text-sm">Profil complet</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold w-20 flex-shrink-0">Expérience :</span>
              <span>{guide.experience}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold w-20 flex-shrink-0">Langues :</span>
              <span>{guide.languages.join(', ')}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold w-20 flex-shrink-0">Spécialité :</span>
              <span>{guide.specialty[0]}</span>
            </div>
          </div>
        </div>
        {/* Arrow down */}
        <span className="block w-4 h-4 bg-slate-900 rotate-45 mx-auto -mt-2" />
      </div>
    </>
  );
}

/* ─── Guide Card ─────────────────────────────────────────────── */
function GuideCard({ guide }: { guide: Guide }) {
  const firstName = guide.name.split(' ')[0];
  const expYears = guide.experience.replace(" d'expérience", '').replace(' d\'expérience', '');

  return (
    <div className="group relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">

      {/* Share button — top-right absolute */}
      <button
        onClick={() => handleShare(guide)}
        className="absolute top-5 right-5 w-9 h-9 bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white rounded-full flex items-center justify-center transition-colors z-10"
        title="Partager"
      >
        <Share2 size={15} />
      </button>

      {/* Card body */}
      <div className="flex gap-5 items-start">

        {/* Left — photo */}
        <div className="relative flex-shrink-0 w-28">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
            <img
              src={guide.image}
              alt={guide.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          {/* Award badge */}
          <div className="absolute -bottom-3 -right-3 bg-emerald-600 p-2 rounded-xl shadow-lg">
            <Award size={16} className="text-white" />
          </div>
        </div>

        {/* Right — info */}
        <div className="flex-1 min-w-0 pt-1">
          {/* Name + region */}
          <h3 className="text-2xl font-bold text-slate-900 leading-tight">{guide.name}</h3>
          <p className="text-emerald-600 font-medium text-sm mt-0.5 mb-2">
            📍 Expert {guide.region.split('-')[0]}
          </p>

          {/* Experience badge */}
          <span className="inline-block bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold mb-3">
            {expYears}
          </span>

          {/* Languages */}
          <div className="flex items-start gap-2 mb-3">
            <Languages size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-slate-500 text-xs leading-relaxed">
              <span className="font-semibold text-slate-700">Langues : </span>
              {guide.languages.join(', ')}
            </p>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {guide.specialty.map(s => (
              <span key={s} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                {s}
              </span>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-4">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-bold text-slate-900">{guide.rating}</span>
            <span className="text-xs text-slate-400">({guide.reviewCount} avis)</span>
          </div>

          {/* Booking button */}
          <Link
            to={bookingUrl(guide)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition-colors"
          >
            <Calendar size={15} /> Réserver {firstName}
          </Link>
        </div>
      </div>

      {/* Tooltip */}
      <ProfileTooltip guide={guide} />
    </div>
  );
}

/* ─── Why Guide Section ──────────────────────────────────────── */
const WHY_ITEMS = [
  { Icon: Star, title: 'Sécurité', desc: 'Voyagez sereinement hors des sentiers battus.' },
  { Icon: Languages, title: 'Interprète', desc: 'Facilitez vos échanges avec les populations locales.' },
  { Icon: Calendar, title: 'Logistique', desc: 'Il s\'occupe de tout pour que vous profitiez.' },
];

/* ─── Main Page ──────────────────────────────────────────────── */
export default function GuidesPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Section 1 — En-tête ──────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t('guides.title') || 'Nos Guides Locaux'}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            {t('guides.subtitle') ||
              'Partez à l\'aventure avec des experts passionnés. Nos guides sont certifiés et connaissent la Casamance comme leur poche.'}
          </p>
        </div>
      </div>

      {/* ── Section 2 — Grille 9 guides ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {GUIDES.map(guide => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </div>

      {/* ── Section 3 — Pourquoi un guide ────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-slate-900 rounded-[3rem] p-10 sm:p-12 text-white">
          <h2 className="text-3xl font-bold text-center mb-10">Pourquoi prendre un guide ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {WHY_ITEMS.map(({ Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-emerald-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
