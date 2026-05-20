import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox, MapPin, Calendar, CheckCircle, XCircle, Clock,
  AlertCircle, Search, Info, Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

/* ── Modèle local ───────────────────────────────────────────── */
interface Booking {
  id:             string;
  name:           string;
  email:          string;
  date:           string;
  type:           string;
  region:         string;
  message:        string;
  status:         'en_attente' | 'confirme' | 'annule';
  refusalReason?: string;
  createdAt:      string;
}

/* ── Statut helpers ─────────────────────────────────────────── */
function getStatusStyle(s: string) {
  if (s === 'confirme')   return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Confirmée' };
  if (s === 'annule')     return { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-100',    label: 'Annulée'   };
  return                         { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100',   label: 'En examen' };
}

function getStatusIcon(s: string) {
  if (s === 'confirme') return <CheckCircle size={14} />;
  if (s === 'annule')   return <XCircle     size={14} />;
  return                       <Clock       size={14} />;
}

/* ── Extraction titre depuis le message ─────────────────────── */
function extractTitle(b: Booking): string {
  return b.message?.split(':')[1]?.split('.')[0] || b.type;
}

type FilterType = 'all' | 'en_attente' | 'confirme' | 'annule';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',        label: 'Toutes'     },
  { key: 'en_attente', label: 'En attente' },
  { key: 'confirme',   label: 'Confirmées' },
  { key: 'annule',     label: 'Annulées'   },
];

/* ── Page ───────────────────────────────────────────────────── */
export default function MyBookingsPage() {
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter,    setFilter]    = useState<FilterType>('all');

  useEffect(() => { fetchMyBookings(); }, []);

  const fetchMyBookings = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setBookings(
      (data || []).map((b: any) => ({
        id:            b.id,
        name:          b.name,
        email:         b.email,
        date:          b.booking_date,
        type:          b.type,
        region:        b.region,
        message:       b.message || '',
        status:        b.status || 'en_attente',
        refusalReason: b.refusal_reason,
        createdAt:     b.created_at,
      }))
    );
    setIsLoading(false);
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  /* ── Loading ────────────────────────────────────────────── */
  if (isLoading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 animate-fade-in">
      <Loader2 size={48} className="text-emerald-600 animate-spin" />
      <p className="text-slate-500 font-bold text-lg">Chargement de votre carnet de voyage...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">

        {/* ── Section 1 : En-tête + Filtres ────────────────── */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">

          {/* Titre */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center flex-shrink-0">
              <Inbox size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Mes Réservations</h1>
              <p className="text-slate-500 font-medium mt-1">
                Suivez l'état de vos demandes en temps réel.
              </p>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 flex-wrap justify-center">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                  filter === key
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
                {key !== 'all' && (
                  <span className="ml-1.5 opacity-60">
                    ({bookings.filter(b => b.status === key).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── État vide ────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Search size={48} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-black italic text-slate-700 mb-3">
              Aucune réservation trouvée
            </h2>
            <p className="text-slate-500 max-w-md mb-8">
              Vous n'avez pas encore planifié d'activités ou d'hébergements pour votre séjour.
            </p>
            <Link
              to="/discovery"
              className="bg-emerald-600 text-white rounded-full px-8 py-4 font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              Commencer l'exploration →
            </Link>
          </div>
        ) : (

          /* ── Section 2 : Grille des réservations ─────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(b => {
              const st = getStatusStyle(b.status);
              const title = extractTitle(b);
              return (
                <div
                  key={b.id}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                >
                  {/* Corps de la carte */}
                  <div className="p-7 space-y-5">

                    {/* Ligne 1 : Badge statut + Référence */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${st.bg} ${st.text} ${st.border}`}>
                        {getStatusIcon(b.status)} {st.label}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-lg">
                        #{b.id.slice(0, 5)}
                      </span>
                    </div>

                    {/* Ligne 2 : Type + Titre */}
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{b.type}</p>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight truncate">
                        {title}
                      </h3>
                    </div>

                    {/* Ligne 3 : Région + Date */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Région</p>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-emerald-500 flex-shrink-0" />
                          <span className="text-sm font-black text-slate-700 truncate">{b.region}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</p>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-emerald-500 flex-shrink-0" />
                          <span className="text-sm font-black text-slate-700">
                            {new Date(b.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bande de statut en bas */}
                  {b.status === 'confirme' && (
                    <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <Info size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Dossier Validé</span>
                      </div>
                      <button className="text-[10px] font-black uppercase underline text-white opacity-80 hover:opacity-100">
                        Voir Bon de séjour
                      </button>
                    </div>
                  )}

                  {b.status === 'annule' && (
                    <div className="bg-rose-50 border-t border-rose-100 px-6 py-4 space-y-2">
                      <div className="flex items-center gap-2 text-rose-600">
                        <AlertCircle size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Motif du refus</span>
                      </div>
                      <p className="text-xs font-medium text-rose-800 leading-relaxed italic">
                        "{b.refusalReason || 'Aucun motif spécifié par l\'administrateur.'}"
                      </p>
                    </div>
                  )}

                  {b.status === 'en_attente' && (
                    <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                      <Clock size={16} className="text-amber-400 animate-pulse flex-shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">
                        Un agent traite votre demande
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Section 3 : Bannière info ─────────────────────── */}
        <div className="bg-indigo-50 border-2 border-indigo-100 rounded-[3rem] p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center flex-shrink-0">
            <Info size={32} className="text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-indigo-900 mb-1">
              Besoin de modifier une réservation ?
            </h3>
            <p className="text-indigo-700 text-sm leading-relaxed">
              Pour toute modification ou annulation, veuillez contacter notre support direct via
              le bouton de chat en bas à droite de votre écran.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
