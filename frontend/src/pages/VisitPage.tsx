import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { LOCATIONS } from '../data';
import type { Region } from '../types';

const CATEGORIES = ['Tous', 'Nature', 'Culture', 'Plage', 'Historique'] as const;
const REGIONS: (Region | 'Toutes')[] = ['Toutes', 'Basse-Casamance', 'Moyenne-Casamance', 'Haute-Casamance'];

export default function VisitPage() {
  const [category, setCategory] = useState<string>('Tous');
  const [region, setRegion] = useState<string>('Toutes');
  const [search, setSearch] = useState('');

  const filtered = LOCATIONS.filter(loc => {
    const matchCat = category === 'Tous' || loc.category === category;
    const matchReg = region === 'Toutes' || loc.region === region;
    const matchSearch = !search || loc.name.toLowerCase().includes(search.toLowerCase()) || loc.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchReg && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-emerald-900 text-white py-16 px-4 text-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold mb-2 block">18 destinations</span>
        <h1 className="text-5xl font-black mb-4">Lieux à Visiter</h1>
        <p className="text-emerald-200 max-w-2xl mx-auto">Découvrez les plus beaux endroits de la Casamance</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un lieu..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === c ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Region filter */}
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-400"
            >
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-slate-500 text-sm mb-6">{filtered.length} lieu(x) trouvé(s)</p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <MapPin size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Aucun lieu trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(loc => (
              <Link key={loc.id} to={`/visit/${loc.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="h-52 overflow-hidden relative">
                  <img src={loc.image} alt={loc.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">{loc.category}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
                    <MapPin size={12} /> {loc.city} · {loc.region}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{loc.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{loc.description}</p>
                  <div className="mt-4 text-emerald-600 text-sm font-semibold group-hover:underline">
                    Explorer →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
