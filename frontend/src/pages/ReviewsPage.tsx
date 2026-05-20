import { useState, useEffect } from 'react';
import { Star, Quote, MessageCircle, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Review } from '../types';

/* ─── Local review shape (mapped from API) ───────────────────── */
interface DisplayReview {
  id: number;
  author: string;
  content: string;
  rating: number;
  date: string;
  avatar: string;
}

function mapReview(r: Review & { author?: string; avatar_url?: string }): DisplayReview {
  const name = r.author || r.author_name || 'Anonyme';
  return {
    id: r.id,
    author: name,
    content: r.content,
    rating: r.rating,
    date: new Date(r.created_at).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    }),
    avatar: r.avatar_url || r.author_avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`,
  };
}

/* ─── Star selector ──────────────────────────────────────────── */
function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="focus:outline-none"
        >
          <Star
            size={24}
            className={value >= s ? 'text-amber-500 fill-amber-500' : 'text-slate-300 fill-slate-300'}
          />
        </button>
      ))}
    </div>
  );
}

/* ─── Top-3 card (dark green) ────────────────────────────────── */
function TopCard({ r }: { r: DisplayReview }) {
  return (
    <div className="group relative bg-emerald-900 text-white rounded-3xl p-6 shadow-xl hover:-translate-y-1 transition-transform duration-300 overflow-hidden">
      <Quote size={80} className="absolute top-4 right-4 text-emerald-800/50 fill-current pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className={i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-emerald-700 fill-emerald-700'} />
          ))}
        </div>
        <p className="text-emerald-50 text-sm leading-relaxed italic line-clamp-4 mb-5">
          "{r.content}"
        </p>
        <div className="border-t border-emerald-800/50 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={r.avatar} alt={r.author} className="w-8 h-8 rounded-full border-2 border-emerald-700 object-cover" />
            <span className="font-bold text-white text-sm">{r.author}</span>
          </div>
          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">{r.date}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Regular review card (white) ───────────────────────────── */
function ReviewCard({ r }: { r: DisplayReview }) {
  return (
    <div className="relative bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow overflow-hidden">
      <Quote size={40} className="absolute top-4 right-4 text-slate-100 fill-current pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className={i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'} />
          ))}
        </div>
        <p className="text-slate-600 text-sm leading-relaxed italic mb-5">
          "{r.content}"
        </p>
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={r.avatar} alt={r.author} className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" />
            <span className="font-bold text-slate-900 text-sm">{r.author}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{r.date}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function ReviewsPage() {
  const [reviews, setReviews] = useState<DisplayReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ author: '', content: '', rating: 5 });

  const fetchReviews = async () => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      setReviews((data || []).map(mapReview));
    } catch {
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        author: newReview.author,
        content: newReview.content,
        rating: newReview.rating,
        avatar_url: `https://i.pravatar.cc/150?u=${encodeURIComponent(newReview.author)}`,
      });
      if (error) throw error;
      setNewReview({ author: '', content: '', rating: 5 });
      setIsLoading(true);
      await fetchReviews();
    } catch {
      alert('Erreur lors de la publication. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900 text-sm';
  const labelCls = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* ── En-tête ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 py-14 px-4 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Avis des Voyageurs</h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          Partagez votre expérience et inspirez les futurs visiteurs de la Casamance.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ── Colonne gauche — Formulaire ──────────────────────── */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Votre Avis Compte</h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              Partagez vos souvenirs de voyage avec la communauté.
            </p>

            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 space-y-5"
            >
              {/* Name */}
              <div>
                <label className={labelCls}>Votre Nom</label>
                <input
                  type="text"
                  required
                  value={newReview.author}
                  onChange={e => setNewReview(n => ({ ...n, author: e.target.value }))}
                  placeholder="Mamadou Diallo"
                  className={inputCls}
                />
              </div>

              {/* Stars */}
              <div>
                <label className={labelCls}>Note (1–5)</label>
                <StarSelector
                  value={newReview.rating}
                  onChange={v => setNewReview(n => ({ ...n, rating: v }))}
                />
              </div>

              {/* Comment */}
              <div>
                <label className={labelCls}>Commentaire</label>
                <textarea
                  required
                  rows={4}
                  value={newReview.content}
                  onChange={e => setNewReview(n => ({ ...n, content: e.target.value }))}
                  placeholder="Partagez votre expérience..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting
                  ? <><Loader2 size={18} className="animate-spin" /> Publication...</>
                  : <><Send size={16} /> Publier mon avis</>}
              </button>
            </form>
          </div>

          {/* ── Colonne droite — Avis ────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Top 3 — vert foncé */}
            {!isLoading && reviews.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-5">
                  <Star size={20} className="text-emerald-600 fill-emerald-600" />
                  Nos derniers avis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {reviews.slice(0, 3).map(r => <TopCard key={r.id} r={r} />)}
                </div>
              </div>
            )}

            {/* All reviews */}
            <div>
              <h3 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-5">
                <MessageCircle size={20} className="text-emerald-600" />
                Tous les témoignages
              </h3>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 size={40} className="animate-spin text-emerald-600" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="col-span-full py-20 text-center text-slate-400 italic">
                  Aucun avis pour le moment. Soyez le premier à partager votre expérience !
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map(r => <ReviewCard key={r.id} r={r} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
