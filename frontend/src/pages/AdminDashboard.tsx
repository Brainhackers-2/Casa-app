import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LayoutDashboard, RefreshCw, PieChart, Calendar, Image as ImgIcon,
  Users, Settings, BarChart3, CheckCircle, Clock, Layers,
  Check, XCircle, Trash2, AlertCircle, MessageSquare, Loader2,
  Copy, Video, Globe, MapPin, Upload, UserIcon, Database, Eye, Mail,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  ACTIVITIES, DISHES, DRINKS, GUIDES, ACCOMMODATIONS,
  GALLERY_IMAGES, LOCATIONS,
} from '../data';
import type { Booking, User } from '../types';

/* ─── Types ──────────────────────────────────────────────────── */
type TabId = 'overview' | 'bookings' | 'media' | 'users' | 'config';

interface SiteConfigs {
  hero_video?: string;
  video_basse?: string;
  video_moyenne?: string;
  video_haute?: string;
  [key: string]: string | undefined;
}

interface MediaItem { url: string; category: string }

/* ─── Video slots (4 managed by Laravel API) ─────────────────── */
const VIDEO_SLOTS = [
  { key: 'hero_video',   label: 'Vidéo Accueil (Hero)',       Icon: Globe,  color: 'text-indigo-600'  },
  { key: 'video_basse',  label: 'Vidéo Basse-Casamance',      Icon: MapPin, color: 'text-emerald-600' },
  { key: 'video_moyenne',label: 'Vidéo Moyenne-Casamance',    Icon: MapPin, color: 'text-amber-600'   },
  { key: 'video_haute',  label: 'Vidéo Haute-Casamance',      Icon: MapPin, color: 'text-rose-500'    },
] as const;

/* ─── Media library builder ──────────────────────────────────── */
const HERO_IMGS = [
  'https://5afe5a211849786b420d348fdaea7d74.cdn.bubble.io/f1722522911734x967238509210139600/Photo%20Excursion%20-%202024-08-01T162327.398-min.png',
  'https://i.pinimg.com/1200x/06/55/0c/06550cedb991bc5c286c389f9433a7f1.jpg',
  'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcRz1EKDLk65cJ5w6LoeRS7hghqpP8Aq7Yb-dc-Djycj-YiWOkLRcrk9zE1USo6Ih5EmGaVKJEXJwa0hm9zfnXX12C0&s=19',
  'https://reseau-iles-casamance.org/wp-content/uploads/2023/12/Pelicans-scaled.jpg',
];

function buildMediaLibrary(): MediaItem[] {
  const all: MediaItem[] = [
    ...HERO_IMGS.map(url => ({ url, category: 'Accueil' })),
    ...LOCATIONS.map(l => ({ url: l.image, category: 'Destinations' })),
    ...ACTIVITIES.map(a => ({ url: a.image, category: 'Activités' })),
    ...DISHES.map(d => ({ url: d.image, category: 'Gastronomie' })),
    ...DRINKS.map(d => ({ url: d.image, category: 'Boissons' })),
    ...ACCOMMODATIONS.map(a => ({ url: a.images[0], category: 'Hébergements' })),
    ...GUIDES.map(g => ({ url: g.image, category: 'Guides' })),
    ...GALLERY_IMAGES.map(url => ({ url, category: 'Galerie' })),
  ];
  return all.filter((item, i, self) => i === self.findIndex(t => t.url === item.url));
}

const mediaLibrary = buildMediaLibrary();

/* ─── Status badge ───────────────────────────────────────────── */
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  en_attente: { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100',   label: 'en attente' },
  confirme:   { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'confirme'   },
  annule:     { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-100',    label: 'annulé'     },
};

/* ─── StatCard ───────────────────────────────────────────────── */
function StatCard({ Icon, iconColor, label, value }: { Icon: React.ElementType; iconColor: string; label: string; value: string | number }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
      <Icon size={22} className={`${iconColor} mb-4`} />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black text-slate-900">{value}</p>
    </div>
  );
}

/* ─── Refusal Modal ──────────────────────────────────────────── */
function RefusalModal({
  onConfirm, onCancel, reason, setReason, isUpdating,
}: {
  onConfirm: () => void; onCancel: () => void;
  reason: string; setReason: (v: string) => void; isUpdating: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl border border-slate-100 animate-slide-up">
        <button onClick={onCancel} className="float-right text-slate-400 hover:text-slate-600">
          <XCircle size={20} />
        </button>
        <AlertCircle size={32} className="text-rose-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-3">Motif du refus</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          Veuillez expliquer au client pourquoi sa réservation ne peut être confirmée.
          Ce message sera visible sur son tableau de bord.
        </p>
        <div className="flex items-start gap-2 mb-4">
          <MessageSquare size={16} className="text-slate-400 mt-2.5 flex-shrink-0" />
          <textarea
            rows={4}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Ex: Le guide sélectionné est déjà réservé pour cette période..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason.trim() || isUpdating}
            className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black disabled:opacity-50 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
          >
            {isUpdating ? <><Loader2 size={16} className="animate-spin" /> Refus...</> : 'Refuser le dossier'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────── */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [refusalReason, setRefusalReason] = useState('');
  const [confirmNote, setConfirmNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [siteConfigs, setSiteConfigs] = useState<SiteConfigs>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [configInputs, setConfigInputs] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  /* ── Fetch data ─────────────────────────────────────────────── */
  const fetchData = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    try {
      const [{ data: bData, error: bErr }, { data: uData, error: uErr }] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('updated_at', { ascending: false }),
      ]);
      if (bErr || uErr) throw bErr || uErr;
      setBookings((bData as Booking[]) || []);
      setProfiles(
        (uData || []).map((p: any) => ({
          id:     p.id,
          name:   p.full_name || p.name || 'Utilisateur',
          email:  p.email || '',
          role:   p.role || 'user',
          avatar: p.avatar_url,
        })) as User[]
      );
      setDbError(null);
    } catch {
      setDbError('Impossible de contacter Supabase. Vérifiez la connexion et les politiques RLS.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchConfigs = useCallback(async () => {
    try {
      const { data } = await supabase.from('site_configs').select('key, value');
      if (data) {
        const obj: SiteConfigs = {};
        data.forEach((row: { key: string; value: string }) => { obj[row.key] = row.value; });
        setSiteConfigs(obj);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
    fetchConfigs();
  }, [fetchData, fetchConfigs]);

  /* ── Copy URL ───────────────────────────────────────────────── */
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(text);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  /* ── Booking actions ────────────────────────────────────────── */
  const updateStatus = async (id: string, status: string, reason = '') => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status, refusal_reason: status === 'annule' ? reason : null })
        .eq('id', id);
      if (error) throw error;
      setBookings(prev => prev.map(b =>
        b.id === id ? { ...b, status: status as Booking['status'], refusal_reason: reason || undefined } : b
      ));
      setShowRefusalModal(false);
      setRefusalReason('');
      setSelectedBookingId(null);
    } catch {
      alert('Erreur lors de la mise à jour du statut.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm('Supprimer définitivement cette réservation ?')) return;
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  /* ── Save site config (YouTube ID) ─────────────────────────── */
  const handleSaveConfig = async (key: string, value: string) => {
    setUploadingField(key);
    try {
      const { error } = await supabase
        .from('site_configs')
        .upsert({ key, value }, { onConflict: 'key' });
      if (error) throw error;
      setSiteConfigs(prev => ({ ...prev, [key]: value }));
    } catch (err: any) {
      alert('Erreur lors de la sauvegarde : ' + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  /* ── Upload vidéo → Storage site_assets ─────────────────────── */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(key);
    try {
      const ext = file.name.split('.').pop() || 'mp4';
      const random = Math.random().toString().slice(2, 9);
      const filePath = `site_videos/${key}_${random}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('site_assets')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('site_assets')
        .getPublicUrl(uploadData.path);
      const { error: configError } = await supabase.from('site_configs')
        .upsert({ key, value: publicUrl }, { onConflict: 'key' });
      if (configError) throw configError;
      setSiteConfigs(prev => ({ ...prev, [key]: publicUrl }));
      alert('Vidéo mise à jour avec succès !');
    } catch (err: any) {
      alert('Erreur lors du téléversement : ' + err.message);
    } finally {
      setUploadingField(null);
      if (fileInputRefs.current[key]) fileInputRefs.current[key]!.value = '';
    }
  };

  /* ── Computed ───────────────────────────────────────────────── */
  const pendingCount = bookings.filter(b => b.status === 'en_attente').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirme').length;
  const confirmRate = bookings.length ? Math.round((confirmedCount / bookings.length) * 100) : 0;

  const filteredBookings = bookings
    .filter(b => {
      const matchStatus = filterStatus === 'all' || b.status === filterStatus;
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'date_asc':  return new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime();
        case 'status_asc': return a.status.localeCompare(b.status);
        case 'type_asc':   return a.type.localeCompare(b.type);
        default:           return new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime();
      }
    });

  const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
    { id: 'overview',  label: 'Rapports',          Icon: PieChart       },
    { id: 'bookings',  label: 'Réservations',       Icon: Calendar       },
    { id: 'media',     label: 'Médiathèque',        Icon: ImgIcon        },
    { id: 'users',     label: 'Utilisateurs',       Icon: Users          },
    { id: 'config',    label: 'Configuration Site', Icon: Settings       },
  ];

  /* ── Loading screen ─────────────────────────────────────────── */
  if (isLoading && !isRefreshing) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 size={64} className="text-indigo-600 animate-spin" />
        <p className="text-xl font-black text-slate-900">Accès au Panel d'Administration</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center flex-shrink-0">
              <LayoutDashboard size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Casamance Tour Admin</h1>
              <p className="text-slate-500 text-sm">Gestion des réservations, médias et configurations.</p>
            </div>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            Synchroniser
          </button>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <div className="sticky top-24 z-30 bg-slate-200/50 backdrop-blur-md rounded-3xl p-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                <Icon size={16} />
                {label}
                {id === 'bookings' && pendingCount > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ────────────────────────────────────────── */}
        <div key={activeTab} className="animate-fade-in">

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard Icon={BarChart3}    iconColor="text-indigo-600"  label="Taux de Confirmation"  value={`${confirmRate}%`} />
              <StatCard Icon={CheckCircle}  iconColor="text-emerald-600" label="Dossiers Clôturés"     value={confirmedCount} />
              <StatCard Icon={Clock}        iconColor="text-amber-500"   label="En Attente"            value={pendingCount} />
              <StatCard Icon={Layers}       iconColor="text-slate-500"   label="Total Ressources"      value={mediaLibrary.length} />
            </div>
          )}

          {/* TAB: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* DB Error */}
              {dbError && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Database size={24} className="text-amber-600" />
                    <h3 className="font-black text-amber-900">Connexion API Introuvable</h3>
                  </div>
                  <p className="text-amber-700 text-sm mb-4">{dbError}</p>
                  <div className="bg-slate-900 rounded-2xl p-4">
                    <code className="text-emerald-400 text-xs font-mono">
                      cd backend && php artisan serve --port=8001
                    </code>
                  </div>
                </div>
              )}

              {/* Toolbar */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-indigo-600" />
                  <h2 className="font-black text-slate-900 text-lg">Journal Opérationnel</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="🔍 Rechercher nom / email..."
                    className="flex-1 min-w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none">
                    <option value="date_desc">+ Récents</option>
                    <option value="date_asc">+ Anciens</option>
                    <option value="status_asc">Par Statut</option>
                    <option value="type_asc">Par Prestation</option>
                  </select>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none">
                    <option value="all">Tous</option>
                    <option value="en_attente">En attente</option>
                    <option value="confirme">Confirmé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {['CLIENT', 'PRESTATION', 'STATUT', 'DÉTAILS', 'ACTIONS'].map(h => (
                          <th key={h} className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredBookings.map(b => {
                        const st = STATUS_STYLES[b.status] ?? STATUS_STYLES.en_attente;
                        return (
                          <tr key={b.id} className="group hover:bg-slate-50 transition-colors">
                            {/* Client */}
                            <td className="px-6 py-4">
                              <p className="font-black text-slate-900 text-sm">{b.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{b.email}</p>
                            </td>
                            {/* Prestation */}
                            <td className="px-6 py-4">
                              <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg">
                                {b.type}
                              </span>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {new Date(b.booking_date).toLocaleDateString('fr-FR')} · {b.region.split('-')[0]}
                              </p>
                            </td>
                            {/* Status */}
                            <td className="px-6 py-4">
                              <span className={`text-xs font-black px-3 py-1.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
                                {st.label}
                              </span>
                              {b.status === 'annule' && b.refusal_reason && (
                                <p className="text-[10px] text-rose-400 italic mt-1 max-w-[200px] truncate">
                                  Motif : {b.refusal_reason}
                                </p>
                              )}
                            </td>
                            {/* Détails */}
                            <td className="px-6 py-4">
                              <button
                                onClick={() => { setDetailBooking(b); setShowDetailModal(true); }}
                                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-xs font-black transition-colors"
                                title="Voir les détails"
                              >
                                <Eye size={14} /> Voir
                              </button>
                            </td>
                            {/* Actions */}
                            <td className="px-6 py-4">
                              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {b.status !== 'confirme' && (
                                  <button onClick={() => { setSelectedBookingId(String(b.id)); setConfirmNote(''); setShowConfirmModal(true); }}
                                    className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors" title="Confirmer">
                                    <Check size={14} />
                                  </button>
                                )}
                                {b.status !== 'annule' && (
                                  <button onClick={() => { setSelectedBookingId(String(b.id)); setRefusalReason(''); setShowRefusalModal(true); }}
                                    className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors" title="Refuser">
                                    <XCircle size={14} />
                                  </button>
                                )}
                                <button onClick={() => deleteBooking(b.id)}
                                  className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-colors" title="Supprimer">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredBookings.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-16 text-slate-400 text-sm">Aucune réservation trouvée</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-10">
              {/* Video slots */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900 mb-6">
                  <Video size={22} className="text-indigo-600" /> Vidéos Configurées
                </h2>
                <div className="space-y-4">
                  {VIDEO_SLOTS.map(({ key, label, Icon, color }) => {
                    const url = siteConfigs[key];
                    const isYt = url?.includes('youtube') || url?.includes('youtu.be');
                    return (
                      <div key={key} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-40 aspect-video rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center">
                          {url ? (
                            isYt
                              ? <iframe src={url} className="w-full h-full pointer-events-none" title={label} />
                              : <video src={url} className="w-full h-full object-cover" muted />
                          ) : (
                            <Video size={24} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon size={14} className={color} />
                            <p className="font-bold text-slate-900 text-sm">{label}</p>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{url || 'Non configuré'}</p>
                        </div>
                        {url && (
                          <button onClick={() => handleCopy(url)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${copyFeedback === url ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            <Copy size={13} /> {copyFeedback === url ? 'COPIÉ !' : 'Copy'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Image bank */}
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900 mb-6">
                  <ImgIcon size={22} className="text-indigo-600" /> Banque d'Images
                  <span className="text-sm font-normal text-slate-400">({mediaLibrary.length} images)</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {mediaLibrary.map((item, i) => (
                    <div key={i} className="group relative aspect-square rounded-[2rem] overflow-hidden cursor-pointer">
                      <img src={item.url} alt={item.category} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => handleCopy(item.url)}
                          className={`flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl text-xs font-bold hover:scale-110 transition-transform ${copyFeedback === item.url ? 'text-emerald-700' : 'text-slate-900'}`}>
                          <Copy size={14} /> {copyFeedback === item.url ? 'Copié !' : 'Copier URL'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Membres Casamance Tour</h2>
              <p className="text-slate-500 text-sm mb-8">Liste des voyageurs inscrits et du personnel administratif.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {profiles.map(user => (
                  <div key={user.id}
                    className="group bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all duration-300 flex items-center gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 group-hover:rotate-3 transition-transform">
                      <UserIcon size={22} className="text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-sm uppercase truncate">{user.name}</p>
                      <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full mt-1 ${
                        user.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
                {profiles.length === 0 && (
                  <p className="col-span-full text-center text-slate-400 py-12 italic">Aucun utilisateur chargé.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB: CONFIG */}
          {activeTab === 'config' && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-3xl font-black text-slate-900">Gestion Multimédia du Site</h2>
                <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-full">
                  <Video size={12} /> Vidéothèque &amp; Storage
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {VIDEO_SLOTS.map(({ key, label, Icon, color }) => {
                  const currentVal = siteConfigs[key] || '';
                  const inputVal = configInputs[key] ?? currentVal;
                  const saving = uploadingField === key;
                  const isStorageUrl = currentVal.startsWith('http') && currentVal.includes('supabase');
                  const isYouTubeId = currentVal && !currentVal.startsWith('http');
                  return (
                    <div key={key} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={color} />
                        <p className="font-black text-slate-900 text-sm">{label}</p>
                        {currentVal && <span className="ml-auto bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full">Active</span>}
                      </div>

                      {/* Preview */}
                      {currentVal && (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 group">
                          {isStorageUrl ? (
                            <video src={currentVal} muted loop controls className="w-full h-full object-cover" />
                          ) : isYouTubeId ? (
                            <iframe src={`https://www.youtube.com/embed/${currentVal}`} className="w-full h-full" allowFullScreen />
                          ) : null}
                          {saving && (
                            <div className="absolute inset-0 bg-indigo-600/80 flex flex-col items-center justify-center gap-2 z-10">
                              <Loader2 size={32} className="text-white animate-spin" />
                              <p className="text-white text-sm font-bold">Téléversement...</p>
                            </div>
                          )}
                          {/* Upload overlay on hover */}
                          {!saving && (
                            <label className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10">
                              <div className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-sm">
                                <Upload size={14} /> Remplacer la vidéo
                              </div>
                              <input type="file" accept="video/*" className="hidden"
                                ref={el => { fileInputRefs.current[key] = el; }}
                                onChange={e => handleFileUpload(e, key)} />
                            </label>
                          )}
                        </div>
                      )}

                      {/* Upload si pas encore de vidéo */}
                      {!currentVal && (
                        <label className={`flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-indigo-400 transition-colors ${saving ? 'opacity-50 pointer-events-none' : ''}`}>
                          {saving ? <Loader2 size={32} className="text-indigo-600 animate-spin" /> : <>
                            <Upload size={28} className="text-slate-400 mb-2" />
                            <p className="text-xs font-bold text-slate-500">Cliquez pour uploader</p>
                            <p className="text-[10px] text-slate-400">MP4, WebM, MOV...</p>
                          </>}
                          <input type="file" accept="video/*" className="hidden"
                            ref={el => { fileInputRefs.current[key] = el; }}
                            onChange={e => handleFileUpload(e, key)} />
                        </label>
                      )}

                      {/* YouTube ID input */}
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Ou ID YouTube</p>
                        <div className="flex gap-2">
                          <input type="text" value={inputVal}
                            onChange={e => setConfigInputs(p => ({ ...p, [key]: e.target.value }))}
                            placeholder="ex: dQw4w9WgXcQ"
                            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-400 font-mono" />
                          <button onClick={() => handleSaveConfig(key, inputVal)}
                            disabled={saving || !inputVal || inputVal === currentVal}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-indigo-700 transition-colors flex items-center gap-1">
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Sauver
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Détail Réservation ─────────────────────────── */}
      {showDetailModal && detailBooking && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-indigo-600 px-8 py-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-0.5">
                  Dossier #{detailBooking.id.slice(0, 8)}
                </p>
                <h2 className="text-xl font-black text-white">{detailBooking.name}</h2>
              </div>
              <button onClick={() => setShowDetailModal(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors">
                <XCircle size={22} />
              </button>
            </div>

            {/* Corps */}
            <div className="p-8 space-y-4">
              {[
                { label: 'Email',       value: detailBooking.email,        icon: <Mail size={14} /> },
                { label: 'Type',        value: detailBooking.type,         icon: <Layers size={14} /> },
                { label: 'Région',      value: detailBooking.region,       icon: <MapPin size={14} /> },
                { label: 'Date',        value: new Date(detailBooking.booking_date).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }), icon: <Calendar size={14} /> },
                { label: 'Soumis le',   value: new Date(detailBooking.created_at).toLocaleString('fr-FR'), icon: <Clock size={14} /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-400">
                    {icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-semibold text-slate-900">{value}</p>
                  </div>
                </div>
              ))}

              {/* Message */}
              {detailBooking.message && (
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MessageSquare size={11} /> Message du client
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{detailBooking.message}</p>
                </div>
              )}

              {/* Motif de refus (si annulé) */}
              {detailBooking.status === 'annule' && detailBooking.refusal_reason && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle size={11} /> Motif du refus
                  </p>
                  <p className="text-sm text-rose-800 italic">"{detailBooking.refusal_reason}"</p>
                </div>
              )}

              {/* Note de confirmation (si confirmé) */}
              {detailBooking.status === 'confirme' && detailBooking.refusal_reason && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle size={11} /> Note de confirmation
                  </p>
                  <p className="text-sm text-emerald-800 italic">"{detailBooking.refusal_reason}"</p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-8 pb-8 flex gap-3">
              {detailBooking.status !== 'confirme' && (
                <button
                  onClick={() => { setShowDetailModal(false); setSelectedBookingId(detailBooking.id); setConfirmNote(''); setShowConfirmModal(true); }}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <Check size={15} /> Confirmer
                </button>
              )}
              {detailBooking.status !== 'annule' && (
                <button
                  onClick={() => { setShowDetailModal(false); setSelectedBookingId(detailBooking.id); setRefusalReason(''); setShowRefusalModal(true); }}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-colors flex items-center justify-center gap-2">
                  <XCircle size={15} /> Refuser
                </button>
              )}
              <button onClick={() => setShowDetailModal(false)}
                className="px-5 py-3 border border-slate-200 text-slate-600 rounded-2xl font-semibold text-sm hover:bg-slate-50 transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Confirmation avec motif ────────────────────────── */}
      {showConfirmModal && selectedBookingId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl border border-slate-100 animate-slide-up">
            <button onClick={() => { setShowConfirmModal(false); setConfirmNote(''); setSelectedBookingId(null); }}
              className="float-right text-slate-400 hover:text-slate-600">
              <XCircle size={20} />
            </button>
            <CheckCircle size={32} className="text-emerald-500 mb-4" />
            <h2 className="text-2xl font-black text-slate-900 mb-3">Confirmer ce dossier ?</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Ajoutez un message pour le client expliquant les prochaines étapes ou toute information utile.
            </p>
            <div className="flex items-start gap-2 mb-4">
              <MessageSquare size={16} className="text-slate-400 mt-2.5 flex-shrink-0" />
              <textarea
                rows={4}
                value={confirmNote}
                onChange={e => setConfirmNote(e.target.value)}
                placeholder="Ex: Votre réservation est validée. Notre guide vous contactera 48h avant la date..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowConfirmModal(false); setConfirmNote(''); setSelectedBookingId(null); }}
                className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                Annuler
              </button>
              <button
                onClick={() => updateStatus(selectedBookingId, 'confirme', confirmNote)}
                disabled={isUpdatingStatus}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black disabled:opacity-50 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
              >
                {isUpdatingStatus
                  ? <><Loader2 size={16} className="animate-spin" /> Confirmation...</>
                  : <><Check size={16} /> Confirmer le dossier</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Refus ──────────────────────────────────────────── */}
      {showRefusalModal && selectedBookingId && (
        <RefusalModal
          reason={refusalReason}
          setReason={setRefusalReason}
          isUpdating={isUpdatingStatus}
          onCancel={() => { setShowRefusalModal(false); setRefusalReason(''); setSelectedBookingId(null); }}
          onConfirm={() => updateStatus(selectedBookingId, 'annule', refusalReason)}
        />
      )}
    </div>
  );
}
