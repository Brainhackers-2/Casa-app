import { useState } from 'react';
import { CalendarDays, Clock, MapPin, Banknote, Filter } from 'lucide-react';
import { AGENDA_EVENTS } from '../data';
import type { AgendaEvent } from '../types';

/* ─── Google Maps embed URL ──────────────────────────────────── */
function mapsEmbedUrl(location: string, region: string) {
  const q = encodeURIComponent(`${location} ${region} Casamance Senegal`);
  return `https://maps.google.com/maps?q=${q}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
}

/* ─── EventCard (independent isExpanded state) ───────────────── */
function EventCard({ event }: { event: AgendaEvent }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">

      {/* Image */}
      <div className="h-48 overflow-hidden relative flex-shrink-0">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category badge — top-left */}
        <div className="absolute top-3 left-3">
          <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
            {event.category}
          </span>
        </div>
        {/* Incontournable badge — top-right */}
        {event.isMajorEvent && (
          <div className="absolute top-3 right-3">
            <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow-lg">
              Incontournable
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-lg font-black text-slate-900 leading-snug mb-3">{event.title}</h3>

        {/* Date */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock size={12} className="text-emerald-600" />
          </span>
          <span className="text-xs font-medium text-slate-600">{event.date}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4 flex-1">{event.description}</p>

        {/* Expand panel */}
        {isExpanded && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-2 mb-4 space-y-3"
            style={{ animation: 'fadeSlide 0.3s ease-out' }}>

            {/* Location */}
            <div className="flex items-start gap-2">
              <span className="w-7 h-7 bg-white shadow-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={13} className="text-emerald-600" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-900">{event.location}</p>
                <p className="text-[10px] text-slate-500">{event.region}</p>
              </div>
            </div>

            {/* Price */}
            {event.price && (
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-white shadow-sm rounded-full flex items-center justify-center flex-shrink-0">
                  <Banknote size={13} className="text-emerald-600" />
                </span>
                <p className="text-xs font-medium text-slate-700">{event.price}</p>
              </div>
            )}

            {/* Google Maps embed */}
            <div className="h-32 rounded-lg overflow-hidden border border-slate-200">
              <iframe
                src={mapsEmbedUrl(event.location, event.region)}
                title={`Carte ${event.title}`}
                width="100%"
                height="100%"
                loading="lazy"
                className="border-0"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        )}

        {/* Toggle button */}
        <div className="border-t border-slate-100 pt-3 mt-auto">
          <button
            onClick={() => setIsExpanded(e => !e)}
            className="w-full py-2.5 bg-slate-50 hover:bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg transition-colors"
          >
            {isExpanded ? 'Moins de détails' : 'Plus de détails'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function AgendaPage() {
  const [filter, setFilter] = useState('Tous');

  /* Dynamic categories from data */
  const categories = ['Tous', ...Array.from(new Set(AGENDA_EVENTS.map(e => e.category)))];

  const displayed = filter === 'Tous'
    ? AGENDA_EVENTS
    : AGENDA_EVENTS.filter(e => e.category === filter);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* ── Section 1 — Hero ──────────────────────────────────────── */}
      <div className="bg-emerald-900 py-20 relative overflow-hidden">
        {/* Background image — opacity 20% */}
        <img
          src="https://kumakonda.es/wp-content/uploads/2024/05/Casamance-7.jpg.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />

        <div className="relative z-10 text-center px-4">
          <CalendarDays size={48} className="text-emerald-400 mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
            Agenda Culturel
          </h1>
          <p className="text-xl text-emerald-100 font-medium max-w-3xl mx-auto leading-relaxed">
            Découvrez les événements, festivals et rituels qui rythment la vie en Casamance
            tout au long de l'année.
          </p>
        </div>
      </div>

      {/* ── Section 2 — Filter bar (glass, floating) ─────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-emerald-100 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Label */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter size={20} className="text-slate-400" />
              <span className="font-bold text-slate-500 text-sm">Filtres :</span>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    filter === cat
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3 — Grid ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {displayed.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24">
            <CalendarDays size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">Aucun événement trouvé</h3>
            <p className="text-slate-500">Essayez de modifier vos filtres de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayed.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Animation keyframe */}
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
