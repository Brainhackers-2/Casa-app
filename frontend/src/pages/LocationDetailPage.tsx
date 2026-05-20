import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Tag, CreditCard } from 'lucide-react';
import { LOCATIONS, ACTIVITIES } from '../data';

export default function LocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = LOCATIONS.find(l => l.id === id);

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Lieu non trouvé</h2>
          <Link to="/visit" className="text-emerald-600 hover:underline">Retour aux lieux</Link>
        </div>
      </div>
    );
  }

  const relatedActivities = ACTIVITIES.filter(a => a.region === location.region).slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative h-96">
        <img src={location.image} alt={location.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute top-6 left-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm transition-colors backdrop-blur-sm">
            <ArrowLeft size={16} /> Retour
          </button>
        </div>
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">{location.category}</span>
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">{location.region}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white">{location.name}</h1>
          <p className="text-white/80 mt-2 flex items-center gap-1"><MapPin size={14} /> {location.city}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">À propos de {location.name}</h2>
              <p className="text-slate-600 leading-relaxed text-lg">{location.description}</p>
            </div>

            {relatedActivities.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-5">Activités dans la région</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedActivities.map(a => (
                    <Link key={a.id} to="/activities" className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                      <div className="h-36 overflow-hidden">
                        <img src={a.image} alt={a.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4">
                        <span className="text-xs text-emerald-600 font-bold uppercase">{a.type}</span>
                        <h4 className="font-semibold text-slate-900 text-sm mt-1">{a.name}</h4>
                        <p className="text-amber-600 font-bold text-sm mt-1">{a.price.toLocaleString()} CFA</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Informations</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Tag size={18} className="text-emerald-600" />
                  <div>
                    <p className="text-xs text-slate-500">Catégorie</p>
                    <p className="font-semibold text-slate-900">{location.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-emerald-600" />
                  <div>
                    <p className="text-xs text-slate-500">Région</p>
                    <p className="font-semibold text-slate-900">{location.region}</p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              to={`/booking?type=Découverte&region=${encodeURIComponent(location.region)}`}
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
            >
              <CreditCard size={20} /> Réserver une visite guidée
            </Link>

            <Link
              to="/guides"
              className="flex items-center justify-center gap-2 w-full border border-emerald-600 text-emerald-700 py-4 rounded-2xl font-semibold hover:bg-emerald-50 transition-colors"
            >
              Voir les guides locaux
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
