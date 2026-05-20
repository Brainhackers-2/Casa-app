import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, Check, Maximize2, X, ChevronLeft, ChevronRight,
  Share2, Info,
} from 'lucide-react';
import { ACCOMMODATIONS } from '../data';
import { useTranslation } from '../context/LanguageContext';
import type { Accommodation } from '../types';

/* ─── Types ──────────────────────────────────────────────────── */
type FilterType = 'All' | 'Hôtel' | 'Campement' | 'Éco-Lodge';
interface GalleryState { acc: Accommodation; index: number }

/* ─── Gallery helper ────────────────────────────────────────── */
function getGallery(acc: Accommodation): string[] {
  return [
    acc.images[0],
    `https://picsum.photos/seed/${acc.id}-1/800/600`,
    `https://picsum.photos/seed/${acc.id}-2/800/600`,
    `https://picsum.photos/seed/${acc.id}-3/800/600`,
  ];
}

/* ─── Booking URL ────────────────────────────────────────────── */
function bookingUrl(acc: Accommodation) {
  return `/booking?type=H%C3%A9bergement&item=${encodeURIComponent(acc.name)}&region=${encodeURIComponent(acc.region)}`;
}

/* ─── Share handler ──────────────────────────────────────────── */
function handleShare(acc: Accommodation, e: React.MouseEvent) {
  e.stopPropagation();
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: acc.name,
      text: `${acc.name} — ${acc.type} en ${acc.region}`,
      url,
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => alert('Lien de la page copié !'));
  }
}

/* ─── Star rating renderer ───────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  );
}

/* ─── Lightbox ───────────────────────────────────────────────── */
function Lightbox({
  state,
  onClose,
  onChange,
}: {
  state: GalleryState;
  onClose: () => void;
  onChange: (s: GalleryState) => void;
}) {
  const { acc, index } = state;
  const images = getGallery(acc);
  const total = images.length;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ acc, index: (index - 1 + total) % total });
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ acc, index: (index + 1) % total });
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white text-3xl font-light transition-colors z-10"
      >
        <X size={28} />
      </button>

      {/* Main image + nav */}
      <div className="relative flex items-center justify-center w-full max-w-5xl px-20" onClick={e => e.stopPropagation()}>
        {/* Prev */}
        <button
          onClick={prev}
          className="absolute left-4 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Image */}
        <img
          key={index}
          src={images[index]}
          alt={`${acc.name} ${index + 1}`}
          className="w-full aspect-video object-contain rounded-2xl animate-fade-in"
        />

        {/* Next */}
        <button
          onClick={next}
          className="absolute right-4 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Info + thumbnails */}
      <div className="mt-6 text-center" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-white mb-1">{acc.name}</h3>
        <p className="text-white/60 text-sm uppercase tracking-widest mb-5">
          Image {index + 1} / {total}
        </p>
        {/* Thumbnails */}
        <div className="flex items-center gap-3 justify-center">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onChange({ acc, index: i })}
              className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === index ? 'border-emerald-500 scale-110' : 'border-transparent opacity-40 hover:opacity-70'
              }`}
            >
              <img src={img} alt={`thumb ${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Accommodation Card ─────────────────────────────────────── */
function AccCard({
  acc,
  onGallery,
}: {
  acc: Accommodation;
  onGallery: (s: GalleryState) => void;
}) {
  const price = acc.priceRange.replace('A partir de ', '').replace('À partir de ', '');

  return (
    <div className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">

      {/* Image zone */}
      <div
        className="h-72 overflow-hidden relative cursor-pointer"
        onClick={() => onGallery({ acc, index: 0 })}
      >
        <img
          src={acc.images[0]}
          alt={acc.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
            <Maximize2 size={22} className="text-white" />
          </div>
        </div>

        {/* Badge type — top-left */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md text-emerald-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
            {acc.type}
          </span>
        </div>

        {/* Share — top-right */}
        <button
          onClick={(e) => handleShare(acc, e)}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-md hover:bg-emerald-600 hover:text-white text-slate-700 p-3 rounded-full transition-colors"
          title="Partager"
        >
          <Share2 size={15} />
        </button>

        {/* Click hint — bottom-right */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-3 py-1.5 rounded-full">
            Cliquer pour voir les photos
          </span>
        </div>
      </div>

      {/* Info zone */}
      <div className="p-8">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-2xl font-bold text-slate-900 leading-tight">{acc.name}</h3>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-400">À partir de</p>
            <p className="text-xl font-extrabold text-emerald-600 leading-tight">{price}</p>
          </div>
        </div>

        {/* Stars */}
        <Stars rating={acc.rating} />

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 mt-5 mb-5">
          {acc.features.map(feat => (
            <div key={feat} className="flex items-center gap-2">
              <span className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={11} className="text-emerald-600" />
              </span>
              <span className="text-sm text-slate-600 font-medium">{feat}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="border-t border-slate-100 pt-5 flex gap-3">
          <Link
            to={bookingUrl(acc)}
            className="flex-1 text-center py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-colors"
          >
            Réserver
          </Link>
          <button
            onClick={() => onGallery({ acc, index: 0 })}
            className="p-4 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors"
            title="Voir les photos"
          >
            <Info size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'All',       label: 'Tous'       },
  { id: 'Hôtel',     label: 'Hôtel'      },
  { id: 'Campement', label: 'Campement'  },
  { id: 'Éco-Lodge', label: 'Éco-Lodge'  },
];

export default function AccommodationsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterType>('All');
  const [selectedGallery, setSelectedGallery] = useState<GalleryState | null>(null);

  const displayed = filter === 'All'
    ? ACCOMMODATIONS
    : ACCOMMODATIONS.filter(a => a.type === filter);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Section 1 — En-tête ──────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t('accommodations.title') || 'Où dormir ?'}
          </h1>
          <p className="text-slate-600 leading-relaxed">
            {t('accommodations.subtitle') ||
              "Du campement villageois authentique à l'éco-lodge de luxe, trouvez le nid parfait pour votre séjour en Casamance."}
          </p>
        </div>
      </div>

      {/* ── Section 2 — Filtres ──────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-2 justify-center">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                filter === id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 3 — Grille ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-8">
          {displayed.length} hébergement{displayed.length > 1 ? 's' : ''} disponible{displayed.length > 1 ? 's' : ''}
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {displayed.map(acc => (
            <AccCard key={acc.id} acc={acc} onGallery={setSelectedGallery} />
          ))}
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {selectedGallery && (
        <Lightbox
          state={selectedGallery}
          onClose={() => setSelectedGallery(null)}
          onChange={setSelectedGallery}
        />
      )}
    </div>
  );
}
