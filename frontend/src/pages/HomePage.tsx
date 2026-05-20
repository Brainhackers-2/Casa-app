import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass, Play, MapPin, X, UserCheck, Film,
  Sparkles, Camera, Utensils, ArrowRight, Star, Bed,
} from 'lucide-react';
import { ACTIVITIES, DISHES, DRINKS, GUIDES, ACCOMMODATIONS, GALLERY_IMAGES } from '../data';
import type { Activity, Guide } from '../types';

/* ─── Data ──────────────────────────────────────────────────── */

const HERO_SLIDES = [
  {
    tag: 'Bienvenue au pays de la Teranga',
    title: 'La Casamance',
    subtitle: 'Le Jardin du Sénégal',
    description: 'De la mangrove sauvage aux traditions séculaires, vivez une immersion totale dans l\'écrin vert du Sénégal.',
    image: 'https://5afe5a211849786b420d348fdaea7d74.cdn.bubble.io/f1722522911734x967238509210139600/Photo%20Excursion%20-%202024-08-01T162327.398-min.png',
  },
  {
    tag: 'Détente & Sérénité',
    title: 'Cap Skirring',
    subtitle: 'Le Paradis sur Terre',
    description: 'Évadez-vous sur des kilomètres de sable fin baigné par l\'Atlantique, loin de l\'agitation du monde.',
    image: 'https://i.pinimg.com/1200x/06/55/0c/06550cedb991bc5c286c389f9433a7f1.jpg',
  },
  {
    tag: 'Immersion Culturelle',
    title: 'Île de Carabane',
    subtitle: 'L\'Histoire au fil de l\'eau',
    description: 'Voyagez dans le temps sur cette île sans voiture, bercée par les murmures de l\'histoire coloniale.',
    image: 'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcRz1EKDLk65cJ5w6LoeRS7hghqpP8Aq7Yb-dc-Djycj-YiWOkLRcrk9zE1USo6Ih5EmGaVKJEXJwa0hm9zfnXX12C0&s=19',
  },
  {
    tag: 'Nature Sauvage',
    title: 'Les Bolongs',
    subtitle: 'Labyrinthe Aquatique',
    description: 'Glissez silencieusement en pirogue à travers les mangroves, au rythme des hérons et des martins-pêcheurs.',
    image: 'https://reseau-iles-casamance.org/wp-content/uploads/2023/12/Pelicans-scaled.jpg',
  },
];

const REGION_CARDS = [
  {
    id: 'basse',
    label: 'Océan & Mangroves',
    title: 'Basse-Casamance',
    image: 'https://lequotidien.sn/wp-content/uploads/2024/08/Memorial-musee-Le-Joola.jpg',
  },
  {
    id: 'moyenne',
    label: 'Culture & Forêts',
    title: 'Moyenne-Casamance',
    image: 'https://www.au-senegal.com/local/cache-vignettes/L756xH756/sans-titre-3-54-8fbbe.jpg?1727134948',
  },
  {
    id: 'haute',
    label: 'Savane & Traditions',
    title: 'Haute-Casamance',
    image: 'https://www.koldanews.com/wp-content/uploads/2024/08/jeune-filles.jpg',
  },
];

const VIDEO_BLOCKS = [
  {
    Icon: Sparkles,
    iconColor: 'text-amber-500',
    title: 'Traditions vivantes',
    desc: 'Suivez nos guides dans les forêts sacrées au rythme des djembés.',
  },
  {
    Icon: Camera,
    iconColor: 'text-emerald-600',
    title: 'Éveil de la nature',
    desc: 'Observez l\'envol des flamants roses au lever du soleil sur le fleuve.',
  },
  {
    Icon: Utensils,
    iconColor: 'text-indigo-500',
    title: 'L\'art du pilon',
    desc: 'Immersion dans les cuisines villageoises où se préparent les secrets de la Teranga.',
  },
];

/* ─── Helper: filter guides by activity type ─────────────────── */
const GUIDE_TYPE_MAP: Record<string, string[]> = {
  Sport:       ['Pêche', 'Navigation', 'Randonnée', 'Safari', 'Écotourisme'],
  Culture:     ['Culture', 'Histoire', 'Artisanat', 'Tradition', 'Art'],
  Nature:      ['Ornithologie', 'Faune', 'Forêt', 'Conservation', 'Écotourisme'],
  Gastronomie: ['Gastronomie', 'Cuisine'],
};

function guidesForActivity(activity: Activity): Guide[] {
  const keywords = GUIDE_TYPE_MAP[activity.type] ?? [];
  const matched = GUIDES.filter(g =>
    g.specialty.some(s => keywords.some(k => s.toLowerCase().includes(k.toLowerCase())))
  );
  return matched.length > 0 ? matched : GUIDES.slice(0, 4);
}

/* ─── Section 0 — Guide Selection Modal ──────────────────────── */
function GuideModal({
  activity,
  onClose,
}: {
  activity: Activity;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const guides = guidesForActivity(activity);

  const select = (guide: Guide) => {
    const params = new URLSearchParams({
      type: activity.type,
      item: activity.name,
      region: activity.region,
      guideName: guide.name,
      guideImage: guide.image,
    });
    navigate(`/booking?${params.toString()}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row min-h-[320px]">

          {/* Left — emerald */}
          <div className="bg-emerald-600 text-white p-8 md:w-72 flex-shrink-0 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
                <UserCheck size={26} />
              </div>
              <h2 className="text-2xl font-black mb-3">Choisissez votre expert</h2>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Pour l'activité <span className="font-bold text-white">«&nbsp;{activity.name}&nbsp;»</span>
                {' '}({activity.type}) — sélectionnez le guide qui vous correspond.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 border border-white/40 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              <X size={15} /> Annuler
            </button>
          </div>

          {/* Right — guide grid */}
          <div className="flex-1 p-6">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-4">
              {guides.length} guide{guides.length > 1 ? 's' : ''} disponible{guides.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guides.map(guide => (
                <button
                  key={guide.id}
                  onClick={() => select(guide)}
                  className="text-left group bg-slate-50 hover:bg-emerald-50 rounded-2xl p-4 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={guide.image}
                      alt={guide.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 group-hover:border-emerald-400 transition-colors"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{guide.name}</p>
                      <p className="text-slate-500 text-xs">{guide.experience}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 w-full justify-center bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors">
                    Sélectionner →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [guideActivity, setGuideActivity] = useState<Activity | null>(null);
  const [gastroIndex, setGastroIndex] = useState(0);
  const [gastroVisible, setGastroVisible] = useState(true);

  /* Hero auto-advance */
  useEffect(() => {
    const iv = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 8000);
    return () => clearInterval(iv);
  }, []);

  /* Gastronomy carousel with fade */
  const gastroItems = [...DISHES.slice(0, 4), ...DRINKS.slice(0, 2)];
  useEffect(() => {
    const iv = setInterval(() => {
      setGastroVisible(false);
      setTimeout(() => {
        setGastroIndex(i => (i + 1) % gastroItems.length);
        setGastroVisible(true);
      }, 350);
    }, 4000);
    return () => clearInterval(iv);
  }, [gastroItems.length]);

  const gastroImages = [
    gastroItems[gastroIndex % gastroItems.length]?.image ?? '',
    gastroItems[(gastroIndex + 1) % gastroItems.length]?.image ?? '',
    gastroItems[(gastroIndex + 2) % gastroItems.length]?.image ?? '',
    gastroItems[(gastroIndex + 3) % gastroItems.length]?.image ?? '',
  ];

  /* Featured activities: 1 Sport + 3 Culture */
  const sportAct = ACTIVITIES.filter(a => a.type === 'Sport').slice(0, 1);
  const cultureAct = ACTIVITIES.filter(a => a.type === 'Culture').slice(0, 3);
  const featuredActivities = [...sportAct, ...cultureAct];

  /* Featured accommodations: 2 Hôtels + 1 Campement + 1 Éco-Lodge */
  const featuredAccommodations = [
    ...ACCOMMODATIONS.filter(a => a.type === 'Hôtel').slice(0, 2),
    ...ACCOMMODATIONS.filter(a => a.type === 'Campement').slice(0, 1),
    ...ACCOMMODATIONS.filter(a => a.type === 'Éco-Lodge').slice(0, 1),
  ];

  /* Gallery rotation: 8 photos, offset toutes les 4s */
  const [galleryOffset, setGalleryOffset] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setGalleryVisible(false);
      setTimeout(() => {
        setGalleryOffset(o => (o + 8) % GALLERY_IMAGES.length);
        setGalleryVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const gallerySlice = Array.from({ length: 8 }, (_, i) =>
    GALLERY_IMAGES[(galleryOffset + i) % GALLERY_IMAGES.length]
  );

  const openGuideModal = useCallback((activity: Activity) => {
    setGuideActivity(activity);
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* ── SECTION 1 — Hero ─────────────────────────────────────── */}
      <section className="relative bg-slate-900 overflow-hidden" style={{ height: '90vh' }}>
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              i === slide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-slate-950/60" />
          </div>
        ))}

        {/* Slide content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="inline-flex items-center gap-2 bg-emerald-500/40 border border-emerald-300/60 text-white text-sm font-bold px-5 py-2 rounded-full backdrop-blur-sm mb-6 tracking-widest uppercase shadow-lg">
            {HERO_SLIDES[slide].tag}
          </span>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-none mb-3 drop-shadow-lg">
            {HERO_SLIDES[slide].title}
          </h1>
          <p className="text-2xl sm:text-4xl lg:text-5xl text-emerald-300 italic font-semibold mb-5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {HERO_SLIDES[slide].subtitle}
          </p>
          <p className="text-white/90 text-base sm:text-xl max-w-2xl mb-8 leading-relaxed">
            {HERO_SLIDES[slide].description}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/discovery"
              className="flex items-center gap-2 px-7 py-3.5 bg-emerald-600 text-white rounded-full font-bold text-sm sm:text-base hover:bg-emerald-500 transition-colors shadow-lg"
            >
              <Compass size={18} /> Lancer l'aventure
            </Link>
            <Link
              to="/cinema"
              className="flex items-center gap-2 px-7 py-3.5 bg-white/10 text-white backdrop-blur-sm border border-white/20 rounded-full font-bold text-sm sm:text-base hover:bg-white/20 transition-colors"
            >
              <Play size={18} /> Voir le film
            </Link>
          </div>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === slide ? 'w-8 h-2 bg-emerald-400' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── SECTION 2 — Régions ──────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-600 font-bold block mb-2">
                Casamance
              </span>
              <h2 className="text-4xl font-black text-slate-900">Explorez nos Territoires</h2>
              <p className="text-slate-500 mt-2 max-w-xl">
                Trois zones géographiques, trois identités fortes à découvrir absolument.
              </p>
            </div>
            <Link to="/discovery" className="hidden sm:flex items-center gap-1.5 text-emerald-600 font-semibold text-sm hover:underline">
              Voir plus <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REGION_CARDS.map(r => (
              <Link
                key={r.id}
                to="/discovery"
                state={{ activeRegionId: r.id }}
                className="group relative overflow-hidden rounded-[2.5rem] h-60 md:h-72 block"
              >
                <img
                  src={r.image}
                  alt={r.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block mb-1">
                    {r.label}
                  </span>
                  <h3 className="text-2xl font-black text-white">{r.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — Vidéo Immersive ─────────────────────────── */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Blobs décoratifs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              <Film size={13} /> Expérience Sensorielle
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-3">
              La Casamance en Mouvement
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Plongez dans l'ambiance sonore et visuelle d'une région qui vous transformera.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Video */}
            <Link to="/cinema" className="group relative rounded-[3.5rem] overflow-hidden border-8 border-slate-50 shadow-2xl aspect-video cursor-pointer block">
              <iframe
                src="https://www.youtube.com/embed/27Y7pWU3XGQ?autoplay=1&mute=1&loop=1&controls=0&playlist=27Y7pWU3XGQ"
                title="Casamance"
                allow="autoplay; encrypted-media"
                className="w-full h-full pointer-events-none"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                  <Play size={24} className="text-white ml-1" />
                </div>
              </div>
            </Link>

            {/* Blocks */}
            <div className="space-y-5">
              {VIDEO_BLOCKS.map(({ Icon, iconColor, title, desc }, i) => (
                <div
                  key={i}
                  className="group flex gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md transition-all cursor-default"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100 group-hover:bg-emerald-600 transition-colors ${iconColor}`}>
                    <Icon size={20} className="group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">
                      {title}
                    </h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}

              <Link
                to="/cinema"
                className="flex items-center gap-2 mt-4 text-emerald-600 font-semibold hover:underline text-sm"
              >
                Explorer la Vidéothèque <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — Activités ────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-600 font-bold block mb-2">
                Activités
              </span>
              <h2 className="text-4xl font-black text-slate-900">Expériences Uniques</h2>
              <p className="text-slate-500 mt-2">
                Plongez au cœur de l'aventure avec nos activités incontournables.
              </p>
            </div>
            <Link to="/activities" className="hidden sm:flex items-center gap-1.5 text-emerald-600 font-semibold text-sm hover:underline">
              Voir plus <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {featuredActivities.map(activity => (
              <div
                key={activity.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image */}
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={activity.image}
                    alt={activity.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      activity.type === 'Sport' ? 'bg-blue-100 text-blue-700' :
                      activity.type === 'Culture' ? 'bg-amber-100 text-amber-700' :
                      activity.type === 'Nature' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1.5">
                    <MapPin size={12} />
                    {activity.region}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{activity.name}</h3>
                  <div className="h-px bg-slate-100 mb-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-amber-600 font-black text-lg">
                      {activity.price.toLocaleString()} <span className="text-sm font-semibold">FCFA</span>
                    </span>
                    <div className="flex gap-2">
                      <Link
                        to="/activities"
                        className="px-4 py-2 border border-slate-200 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors"
                      >
                        Détails
                      </Link>
                      <button
                        onClick={() => openGuideModal(activity)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Réserver
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5 — Gastronomie ──────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border border-amber-100 rounded-[3rem] p-10 sm:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Left — dynamic text */}
              <div>
                <span className="inline-flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-widest mb-4">
                  <Utensils size={13} /> Gastronomie
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">
                  La Casamance dans Toute sa Richesse Culinaire
                </h2>

                <div
                  className={`transition-all duration-350 ${
                    gastroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                  }`}
                >
                  <div className="border-l-4 border-emerald-500 pl-5 mb-4">
                    <h3 className="text-2xl font-black text-slate-900 mb-1">
                      {gastroItems[gastroIndex % gastroItems.length]?.name}
                    </h3>
                    <p className="text-slate-600 italic text-sm leading-relaxed">
                      {gastroItems[gastroIndex % gastroItems.length]?.description}
                    </p>
                  </div>
                  <span className="inline-block bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
                    Prix : {gastroItems[gastroIndex % gastroItems.length]?.price ?? 'À partir de 500 CFA'}
                  </span>
                </div>

                <Link
                  to="/gastronomy"
                  className="flex items-center gap-2 text-emerald-700 font-bold hover:underline text-sm"
                >
                  Explorer le menu <ArrowRight size={15} />
                </Link>
              </div>

              {/* Right — rotating image grid */}
              <div className="grid grid-cols-2 gap-4 group">
                {[
                  { rotate: '-rotate-3', translate: '' },
                  { rotate: 'rotate-3', translate: 'translate-y-4' },
                  { rotate: '-rotate-6', translate: '-translate-y-4' },
                  { rotate: 'rotate-6', translate: 'translate-y-8' },
                ].map((style, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl overflow-hidden shadow-lg transition-transform duration-500 ${style.rotate} ${style.translate} group-hover:rotate-0 group-hover:translate-y-0`}
                  >
                    <img
                      src={gastroImages[i]}
                      alt={`Gastronomie ${i}`}
                      className="w-full h-36 object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6 — Hébergements ─────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-600 font-bold block mb-2">
                Hébergements
              </span>
              <h2 className="text-4xl font-black text-slate-900">Où Séjourner</h2>
              <p className="text-slate-500 mt-2 max-w-xl">
                Découvrez notre sélection variée : Hôtels, Campements villageois et Éco-lodges.
              </p>
            </div>
            <Link to="/accommodations" className="hidden sm:flex items-center gap-1.5 text-emerald-600 font-semibold text-sm hover:underline flex-shrink-0">
              Voir plus <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {featuredAccommodations.map(acc => (
              <div key={acc.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                {/* Image */}
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={acc.images[0]}
                    alt={acc.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                      acc.type === 'Hôtel' ? 'bg-blue-100 text-blue-700' :
                      acc.type === 'Campement' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Bed size={11} />
                      {acc.type}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight pr-3">{acc.name}</h3>
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                      <Star size={11} className="fill-amber-500 text-amber-500" />
                      {acc.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
                    <MapPin size={12} /> {acc.region}
                  </div>
                  <div className="h-px bg-slate-100 mb-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">
                      <span className="text-xs text-slate-400">À partir de </span>
                      <span className="font-black text-slate-900">{acc.priceRange.replace('À partir de ', '')}</span>
                    </span>
                    <div className="flex gap-2">
                      <Link
                        to="/accommodations"
                        className="px-4 py-2 border border-slate-200 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors"
                      >
                        Détails
                      </Link>
                      <Link
                        to={`/booking?type=H%C3%A9bergement&item=${encodeURIComponent(acc.name)}&region=${encodeURIComponent(acc.region)}`}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Réserver
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7 — Galerie ──────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              <Sparkles size={13} /> Instantanés
            </span>
            <h2 className="text-4xl font-black text-slate-900 mb-2">Galerie</h2>
            <p className="text-slate-400 italic">La Casamance sous tous ses angles.</p>
          </div>

          {/* Grid 4 cols × 2 rows */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-3 transition-opacity duration-300 ${
              galleryVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {gallerySlice.map((img, i) => (
              <Link key={`${galleryOffset}-${i}`} to="/gallery" className="group aspect-square rounded-[2rem] overflow-hidden block">
                <img
                  src={img}
                  alt={`Casamance ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 px-7 py-3 border-2 border-emerald-600 text-emerald-600 rounded-full font-semibold text-sm hover:bg-emerald-600 hover:text-white transition-all"
            >
              <Camera size={17} /> Explorer
            </Link>
          </div>
        </div>
      </section>

      {/* ── Guide Modal (Section 0) ───────────────────────────────── */}
      {guideActivity && (
        <GuideModal
          activity={guideActivity}
          onClose={() => setGuideActivity(null)}
        />
      )}
    </div>
  );
}
