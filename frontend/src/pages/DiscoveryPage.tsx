import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Waves, TreePine, Mountain, Film, Monitor, Sparkles,
  Compass, Calendar, MapPin,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SiteConfigs } from '../types';

/* ─── Types ─────────────────────────────────────────────────── */
type RegionId = 'basse' | 'moyenne' | 'haute';

interface DiscoveryLocation {
  id: string;
  name: string;
  city: string;
  category: string;
  description: string;
  image: string;
  region: RegionId;
}

interface RegionConfig {
  id: RegionId;
  dbName: string;
  name: string;
  subtitle: string;
  iconName: 'Waves' | 'TreePine' | 'Mountain';
  iconColor: string;
  description: string;
  features: { title: string; description: string }[];
  slideshowImages: string[];
  videoConfigKey: keyof SiteConfigs;
  defaultVideo: string;
  locations: DiscoveryLocation[];
}

/* ─── Regions config ─────────────────────────────────────────── */
const REGIONS: Record<RegionId, RegionConfig> = {
  basse: {
    id: 'basse',
    dbName: 'Basse-Casamance',
    name: 'Basse-Casamance',
    subtitle: 'OCÉAN & MANGROVES',
    iconName: 'Waves',
    iconColor: 'text-blue-500',
    description:
      "La partie la plus emblématique, célèbre pour ses bolongs serpentant dans la mangrove, ses forêts de palmiers et les plages infinies de Ziguinchor. C'est le sanctuaire de la culture Diola.",
    features: [
      {
        title: 'Culture Diola',
        description:
          "Découvrez les villages traditionnels et l'organisation sociale unique de ce peuple fier.",
      },
      {
        title: 'Labyrinthe Aquatique',
        description:
          'Explorez les centaines de chenaux (bolons) en pirogue ou en kayak.',
      },
    ],
    slideshowImages: [
      'https://i.pinimg.com/736x/94/c6/dd/94c6dd025080754314c97360e5b33546.jpg',
      'https://lequotidien.sn/wp-content/uploads/2024/08/Memorial-musee-Le-Joola.jpg',
      'https://teranga-decouvertes.com/wp-content/uploads/2024/06/The-Island-of-Carabane.webp',
    ],
    videoConfigKey: 'video_basse',
    defaultVideo: 'https://www.youtube.com/embed/_Hto2CaAQIQ?rel=0&autoplay=0',
    locations: [
      { id: 'b1', name: 'Cap Skirring',    city: 'Oussouye',   category: 'Plage',     description: "Une des plus belles plages d'Afrique de l'Ouest.",                    image: 'https://lequotidien.sn/wp-content/uploads/2024/08/Memorial-musee-Le-Joola.jpg',                                                                                                    region: 'basse' },
      { id: 'b2', name: 'Île de Carabane', city: 'Oussouye',   category: 'Historique', description: "Une île historique sans voitures au bout du fleuve Casamance.",         image: 'https://teranga-decouvertes.com/wp-content/uploads/2024/06/The-Island-of-Carabane.webp',                                                                                          region: 'basse' },
      { id: 'b3', name: 'Oussouye Ville',  city: 'Oussouye',   category: 'Culture',   description: "Le cœur du royaume Diola et de ses traditions séculaires.",             image: 'https://i.pinimg.com/1200x/03/2d/09/032d09e4f77e2f030a9a5095357abad0.jpg',                                                                                                        region: 'basse' },
      { id: 'b4', name: 'Ziguinchor',      city: 'Ziguinchor', category: 'Historique', description: "Architecture coloniale portugaise et port animé sur le fleuve.",         image: 'https://i.pinimg.com/1200x/81/54/3d/81543d7cd858bdb1cc52e473339be7e9.jpg',                                                                                                        region: 'basse' },
      { id: 'b5', name: 'Elinkine',        city: 'Oussouye',   category: 'Nature',    description: "Port de pêche traditionnel, point de départ vers Carabane.",            image: 'https://cocoplage-elinkine.com/wp-content/uploads/2025/12/20251205_104156-scaled.jpg',                                                                                             region: 'basse' },
      { id: 'b6', name: 'Niomoune',        city: 'Casamance',  category: 'Nature',    description: "Village insulaire au bout du monde, accessible uniquement en pirogue.",  image: 'https://i.la-croix.com/836x/smart/2016/06/03/1200766219/flo2492_1.jpg',                                                                                                            region: 'basse' },
    ],
  },

  moyenne: {
    id: 'moyenne',
    dbName: 'Moyenne-Casamance',
    name: 'Moyenne-Casamance',
    subtitle: 'CULTURE & FORÊTS',
    iconName: 'TreePine',
    iconColor: 'text-emerald-600',
    description:
      "Le cœur historique et spirituel de la région. Bordée par le majestueux fleuve, la Moyenne-Casamance est une terre de forêts denses et de traditions mandingues séculaires.",
    features: [
      {
        title: 'Patrimoine Mandingue',
        description:
          'Vibre au son de la Kora et des récits des grands griots de Sédhiou.',
      },
      {
        title: 'Biodiversité Forestière',
        description:
          'Une faune et une flore denses protégées par des bois sacrés.',
      },
    ],
    slideshowImages: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/0e/88/8a/au-bord-de-la-casamance.jpg?w=600&h=400&s=1',
      'https://www.au-senegal.com/IMG/jpg/banta_baatoo_lodge_sedhiou_24_.jpg',
      'https://lesechos-congobrazza.com/images/2021/PONT_1.jpg',
    ],
    videoConfigKey: 'video_moyenne',
    defaultVideo: 'https://www.youtube.com/embed/MJtyZDnzY7c?rel=0&autoplay=0',
    locations: [
      { id: 'm1', name: 'Sédhiou',       city: 'Sédhiou',          category: 'Culture', description: "Berceau de la kora et de l'histoire Mandingue.",             image: 'https://www.au-senegal.com/IMG/jpg/banta_baatoo_lodge_sedhiou_24_.jpg',                                                                    region: 'moyenne' },
      { id: 'm2', name: 'Marsassoum',    city: 'Marsassoum',        category: 'Nature',  description: "Pont iconique sur les bolons, carrefour des cultures.",      image: 'https://lesechos-congobrazza.com/images/2021/PONT_1.jpg',                                                                                  region: 'moyenne' },
      { id: 'm3', name: 'Forêt de Boffa',city: 'Boffa Bayot',      category: 'Nature',  description: "Forêt dense et luxuriante aux essences rares.",              image: 'https://i0.wp.com/www.senegal-shuttle.com/wp-content/uploads/2024/03/Noir-Lune-Blog-Banniere-3.png?fit=2240%2C1260&ssl=1',              region: 'moyenne' },
      { id: 'm4', name: 'Goudomp',       city: 'Goudomp',           category: 'Culture', description: "Cité des Balantes, port fluvial animé.",                    image: 'https://photosvideossn.com/wp-content/uploads/2021/02/rn6-1.png?w=1821&h=768&crop=1',                                                   region: 'moyenne' },
      { id: 'm5', name: 'Bambali',       city: 'Bambali',           category: 'Culture', description: "Village de champions et de traditions vivaces.",            image: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Bambali.png',                                                                      region: 'moyenne' },
      { id: 'm6', name: 'Diendé',        city: 'Diendé',            category: 'Nature',  description: "Paysages riverains calmes, idéaux pour la contemplation.",  image: 'https://static1.mclcm.net/iod/images/v2/69/citytheque/localite_104_160/420x177_80_300_000000x10x0.jpg',                             region: 'moyenne' },
    ],
  },

  haute: {
    id: 'haute',
    dbName: 'Haute-Casamance',
    name: 'Haute-Casamance',
    subtitle: 'SAVANE & TRADITIONS',
    iconName: 'Mountain',
    iconColor: 'text-amber-500',
    description:
      "Berceau de la culture Peule, le Fouladou offre des paysages contrastés et une hospitalité légendaire. Découvrez les paysages de savane, les traditions d'élevage et l'artisanat peul.",
    features: [
      {
        title: 'Le Fouladou',
        description:
          "Plongez dans l'histoire des anciens royaumes peuls et leur artisanat.",
      },
      {
        title: 'Marchés Colorés',
        description:
          "Des carrefours d'échanges dynamiques aux frontières de la Guinée.",
      },
    ],
    slideshowImages: [
      'https://www.voyage-senegal.info/medias/2022/09/monuments-region-kolda-village-ancestral-velingara-1.jpg',
      'https://www.koldanews.com/wp-content/uploads/2020/04/kd-ville.jpg',
      'https://igfm.sn/data/igfm/2022/04/accrochage_2924.png',
    ],
    videoConfigKey: 'video_haute',
    defaultVideo: 'https://www.youtube.com/embed/drHP4EvpFEk?rel=0&autoplay=0',
    locations: [
      { id: 'h1', name: 'Kolda',             city: 'Kolda',             category: 'Culture',   description: "Capitale du Fouladou, cœur de la culture Peule.",               image: 'https://www.koldanews.com/wp-content/uploads/2020/04/kd-ville.jpg',                                                                                                                                                          region: 'haute' },
      { id: 'h2', name: 'Vélingara',         city: 'Vélingara',         category: 'Culture',   description: "Carrefour commercial et marchés aux bestiaux renommés.",         image: 'https://th.bing.com/th/id/R.7be09e9537218d1e99bb8885abbbdc7c?rik=whfggh%2bwlqdZOQ&riu=http%3a%2f%2f3.bp.blogspot.com%2f_ptz7i5T4mv8%2fTFw_Zk9CiKI%2fAAAAAAAAABU%2f7r0VDCqfQ3o%2fs1600%2fBouba%2bPhotos%2b005.jpg&ehk=5VLCeNf3frT%2beZH3czDvfAUIVfDUNfR6DaVEl675LD8%3d&risl=&pid=ImgRaw&r=0', region: 'haute' },
      { id: 'h3', name: 'Savane Medina',     city: 'Medina Yoro Foulah',category: 'Nature',    description: "Espaces sauvages et faune en liberté.",                          image: 'https://igfm.sn/data/igfm/2022/04/accrochage_2924.png',                                                                                                                                                                     region: 'haute' },
      { id: 'h4', name: 'Niokolo Koba',      city: 'Kolda Région',      category: 'Nature',    description: "Parc National classé UNESCO, lions et éléphants.",               image: 'https://i.pinimg.com/1200x/8b/92/ba/8b92ba49c5e1bb24b7d2bd2043095f41.jpg',                                                                                                                                                    region: 'haute' },
      { id: 'h5', name: 'Soutouré',          city: 'Kolda',             category: 'Historique', description: "Vestiges archéologiques d'une civilisation ancienne.",           image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/KounkaneWedding.jpg/760px-Mapcarta.jpg',                                                                                                                               region: 'haute' },
      { id: 'h6', name: 'Vallée du Fouladou',city: 'Kolda',             category: 'Nature',    description: "Beauté pastorale et troupeaux de zébus au fil de l'eau.",        image: 'https://senegaldates.com/images/page/t%C3%A9l%C3%A9chargement.jpg',                                                                                                                                                          region: 'haute' },
    ],
  },
};

const ICONS = { Waves, TreePine, Mountain };

/* ─── Smart Video Player ────────────────────────────────────── */
function VideoPlayer({ url, regionId }: { url: string; regionId: RegionId }) {
  const isFile = /\.(mp4|webm|ogg|mov)$/i.test(url);

  if (isFile) {
    return (
      <video
        key={regionId}
        autoPlay
        muted
        loop
        controls
        className="w-full h-full object-cover"
      >
        <source src={url} />
      </video>
    );
  }

  return (
    <iframe
      key={regionId}
      src={url}
      title={`Vidéo ${regionId}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      className="w-full h-full border-0"
    />
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function DiscoveryPage() {
  const { state } = useLocation() as { state: { activeRegionId?: RegionId } | null };
  const [activeId, setActiveId] = useState<RegionId>(state?.activeRegionId ?? 'basse');
  const [imgIndex, setImgIndex] = useState(0);
  const [imgVisible, setImgVisible] = useState(true);
  const [configs, setConfigs] = useState<SiteConfigs>({});

  /* Fetch video configs once */
  useEffect(() => {
    supabase.from('site_configs').select('*')
      .in('key', ['video_basse', 'video_moyenne', 'video_haute'])
      .then(({ data }) => {
        if (data) {
          const obj: SiteConfigs = {};
          data.forEach((row: { key: string; value: string }) => { obj[row.key as keyof SiteConfigs] = row.value; });
          setConfigs(obj);
        }
      });
  }, []);

  /* Slideshow: reset + rotate every 4s */
  useEffect(() => {
    setImgIndex(0);
    setImgVisible(true);
    const iv = setInterval(() => {
      setImgVisible(false);
      setTimeout(() => {
        setImgIndex(i => (i + 1) % REGIONS[activeId].slideshowImages.length);
        setImgVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(iv);
  }, [activeId]);

  const region = REGIONS[activeId];
  const Icon = ICONS[region.iconName];
  const rawVideoUrl = configs[region.videoConfigKey];
  const videoUrl = rawVideoUrl || region.defaultVideo;

  const switchRegion = (id: RegionId) => {
    if (id === activeId) return;
    setActiveId(id);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── En-tête ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 py-14 px-4 text-center">
        <h1 className="text-5xl font-black text-slate-900 mb-3">Terres de Casamance</h1>
        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Chaque territoire possède son âme, ses rythmes et ses secrets.
          Sélectionnez une région pour explorer ses trésors en images et en vidéos.
        </p>
      </div>

      {/* ── Sélecteur de région ───────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex gap-3 justify-center flex-wrap">
          {(['basse', 'moyenne', 'haute'] as RegionId[]).map(id => {
            const r = REGIONS[id];
            const RIcon = ICONS[r.iconName];
            const active = activeId === id;
            return (
              <button
                key={id}
                onClick={() => switchRegion(id)}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all duration-200 hover:scale-105 ${
                  active
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 ring-offset-2 shadow-lg shadow-emerald-200'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300'
                }`}
              >
                <RIcon size={17} /> {r.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-20">

        {/* ── SECTION 1 — Intro + Features + Slideshow ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Colonne gauche — Texte & Features */}
          <div>
            {/* En-tête région */}
            <div className="flex items-start gap-5 mb-7">
              <div className={`w-14 h-14 bg-white rounded-2xl rotate-3 shadow-lg flex items-center justify-center flex-shrink-0 ${region.iconColor}`}>
                <Icon size={28} />
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-900 leading-tight">{region.name}</h2>
                <span className="text-xs text-emerald-600 font-bold tracking-widest uppercase">
                  {region.subtitle}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-lg leading-relaxed mb-8">{region.description}</p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {region.features.map((f, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-5 border border-transparent hover:border-emerald-200 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0" />
                    <h4 className="font-bold text-slate-900">{f.title}</h4>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne droite — Slideshow */}
          <div className="relative rounded-[3rem] overflow-hidden h-[420px] border-8 border-white shadow-2xl">
            {region.slideshowImages.map((img, i) => (
              <img
                key={img}
                src={img}
                alt={`${region.name} ${i + 1}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  i === imgIndex && imgVisible ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            {/* Gradient bas */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
            {/* Indicateurs */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {region.slideshowImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === imgIndex ? 'w-8 h-2 bg-emerald-400' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION 2 — Visions en Mouvement ─────────────────────── */}
        <div className="bg-emerald-900 rounded-[3rem] p-10 sm:p-16 relative overflow-hidden">
          {/* Blob décoratif */}
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">

            {/* Gauche — Texte */}
            <div>
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6">
                <Film size={13} /> Visions en Mouvement
              </span>
              <h2 className="text-4xl font-black text-white mb-4 leading-tight">
                L'atmosphère de la {region.name}
              </h2>
              <p className="text-emerald-200 text-base leading-relaxed mb-8">
                Plongez dans l'immersion totale. Regardez nos reportages exclusifs pour
                ressentir le rythme de la {region.name.toLowerCase()} avant même d'y arriver.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-3">
                  <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Monitor size={17} className="text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">Lecteur HD</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-3">
                  <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles size={17} className="text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">Son immersif</span>
                </div>
              </div>
            </div>

            {/* Droite — Lecteur intelligent */}
            <div className="aspect-video rounded-[3rem] overflow-hidden border-4 border-white/10 bg-slate-900 shadow-2xl">
              <VideoPlayer url={videoUrl} regionId={activeId} />
            </div>
          </div>
        </div>

        {/* ── SECTION 3 — Lieux Incontournables ───────────────────── */}
        <div>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900">
                Incontournables de {region.name}
              </h2>
              <p className="text-slate-500 mt-1.5">
                Lieux phares à visiter absolument lors de votre passage.
              </p>
            </div>
            <Link
              to="/visit"
              className="hidden sm:flex items-center gap-1.5 text-emerald-600 font-semibold text-sm hover:underline flex-shrink-0"
            >
              Voir tous les lieux →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {region.locations.map(loc => (
              <div
                key={loc.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:border-transparent transition-all duration-300"
              >
                {/* Image */}
                <div className="h-48 sm:h-56 overflow-hidden relative">
                  <img
                    src={loc.image}
                    alt={loc.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  {/* Badge catégorie */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-md text-emerald-600 text-xs font-bold px-3 py-1 rounded-full">
                      {loc.category}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1.5">
                    <MapPin size={11} /> {loc.city}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">
                    {loc.name}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
                    {loc.description}
                  </p>
                  <div className="h-px bg-slate-100 mb-4" />
                  <div className="flex gap-2">
                    <Link
                      to={`/visit/${loc.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      <Compass size={14} /> Détails
                    </Link>
                    <Link
                      to={`/booking?type=D%C3%A9couverte&item=${encodeURIComponent('Visite : ' + loc.name)}&region=${encodeURIComponent(region.dbName)}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <Calendar size={14} /> Réserver
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
