import { Link } from 'react-router-dom';
import { Quote, Star } from 'lucide-react';
import { TESTIMONIALS } from '../data';
import type { Testimonial } from '../data';

/* ─── Testimonial Card ───────────────────────────────────────── */
function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="group relative bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
      {/* Decorative quote icon */}
      <Quote
        size={64}
        className="absolute top-6 right-8 text-emerald-50 opacity-50 group-hover:opacity-100 group-hover:text-emerald-100 transition-colors fill-current"
      />

      {/* Stars */}
      <div className="relative z-10 flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < t.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'}
          />
        ))}
      </div>

      {/* Content */}
      <p className="relative z-10 text-slate-700 text-lg leading-relaxed italic mb-6">
        "{t.content}"
      </p>

      {/* Author */}
      <div className="relative z-10 border-t border-slate-50 pt-6 flex items-center gap-4">
        <img
          src={t.avatar}
          alt={t.author}
          className="w-14 h-14 rounded-full border-2 border-emerald-50 shadow-sm object-cover"
        />
        <div>
          <p className="font-bold text-slate-900 text-lg">{t.author}</p>
          <p className="text-sm text-emerald-600 font-medium">{t.date}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* ── Section 1 — En-tête ──────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Ils ont adoré la Casamance
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Découvrez les récits de voyage et les expériences vécues par nos visiteurs
            du monde entier.
          </p>
        </div>
      </div>

      {/* ── Section 2 — Grille des témoignages ───────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TESTIMONIALS.map(t => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </div>

      {/* ── Section 3 — CTA ──────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="relative bg-emerald-900 rounded-[3rem] p-12 overflow-hidden text-center">
          {/* Decorative blob */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt pour votre propre aventure ?
            </h2>
            <p className="text-emerald-100/80 mb-8 leading-relaxed">
              Rejoignez les milliers de voyageurs qui ont découvert le sud du Sénégal avec nous.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/booking"
                className="px-8 py-4 bg-white text-emerald-900 rounded-full font-bold hover:bg-emerald-50 transition-colors"
              >
                Réserver maintenant
              </Link>
              <Link
                to="/reviews"
                className="px-8 py-4 bg-emerald-800 text-white rounded-full border border-emerald-700 font-bold hover:bg-emerald-700 transition-colors"
              >
                Laisser un avis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
