import { useState } from 'react';
import { Film, Play } from 'lucide-react';

/* ─── 48 YouTube video IDs ───────────────────────────────────── */
const VIDEO_IDS = [
  'Fbx-y2RkY3c', '_AQ-nZDiaq0', 'zuaAVeovJHo', '01n5AgN5LtM',
  'sjE1muXYiso', '-6ksPddgm7E', 'z3wiyMpJeKc', 'ONI3lgp-Ogo',
  'klB2BhBz8EU', 'ehAN1pyBMpY', 'FnymYhpCQFA', 'DVE8AC-fNC4',
  'rq622vpNavY', 'FsrUvYaafyo', 'th4UXNvcavI', 'atyJjBbKL3M',
  'ELqk6e1kGTM', 'BopJCzpWd80', 'wOvowibylVU', 'iPxIQluVGj4',
  'JApPiMCL39Q', 'ES_TbhgE__U', 'b1s2JQGHdcg', 'Wi_hJB3k_tY',
  'jm-E-IGHwE8', '69LuUB9F5oU', 'MhY7bp3OINY', '62FMkKCpmuk',
  'e8ln9O7pFUo', 'OHJeklllcFE', 'g_f_RaviIy4', 'iVk9hc5yuKY',
  'Esq7upvGoO4', 'w3v0W_4Squo', 'zFZLR7MWov0', '_8x7KKhiX1w',
  'AVp0rE3iap4', 'gmaSK1w3j6Q', 'tTPSxh1tvd8', 'sabaGfct4Pk',
  'lsR_hbUB9IU', 'sWOI1HU-RRM', 'l0HWh6Qow8Q', 'mct2Y3awEgs',
  'LGGEuT2_z_M', 'bS3u_J55Bf8', 'R0LcZyZWleM', '9KSJGXdaCAU',
];

export default function CinemaPage() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const activeVideoId = VIDEO_IDS[activeVideoIndex];

  const handleSelect = (index: number) => {
    setActiveVideoIndex(index);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section 1 — En-tête ──────────────────────────────────── */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-black uppercase tracking-widest px-4 py-2 mb-6">
            <Film size={14} /> Galerie Vidéo
          </span>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-5">
            Visionnez la Casamance
          </h1>
          <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">
            Découvrez nos plus beaux films documentaires et extraits vidéos sur la région.
          </p>
        </div>

        {/* ── Section 2 — Lecteur Principal ────────────────────────── */}
        <div className="max-w-4xl mx-auto mb-14">
          <div
            className="relative aspect-video rounded-[3.5rem] overflow-hidden border-4 bg-slate-900"
            style={{
              borderColor: 'rgba(255,255,255,0.05)',
              boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
            }}
          >
            {activeVideoId ? (
              <>
                <iframe
                  key={activeVideoId}
                  src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                  title={`Vidéo Casamance ${activeVideoIndex + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
                {/* REC indicator */}
                <div className="absolute top-8 left-8 flex items-center gap-2 pointer-events-none">
                  <span
                    className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"
                    style={{ boxShadow: '0 0 10px rgba(220,38,38,0.8)' }}
                  />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    Lecteur Iframe Sécurisé
                  </span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Play size={36} className="text-emerald-500 fill-emerald-500 ml-1" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.3em]">
                  Aucune vidéo disponible
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 3 — Grille miniatures ────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {VIDEO_IDS.map((videoId, index) => {
            const isActive = index === activeVideoIndex;
            return (
              <button
                key={videoId}
                onClick={() => handleSelect(index)}
                className={`group relative aspect-video rounded-2xl overflow-hidden transition-all duration-300 border-2 ${
                  isActive
                    ? 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-xl shadow-emerald-900/40'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Thumbnail */}
                <img
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                  alt={`Vidéo ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay */}
                <div
                  className={`absolute inset-0 transition-colors ${
                    isActive ? 'bg-transparent' : 'bg-slate-900/40 group-hover:bg-slate-900/20'
                  }`}
                />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-emerald-500'
                        : 'bg-white/10 group-hover:bg-white/30'
                    }`}
                  >
                    <Play
                      size={14}
                      className={`ml-0.5 ${isActive ? 'fill-white text-white' : 'fill-white/80 text-white/80'}`}
                    />
                  </div>
                </div>

                {/* Label bas */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                  style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.9), transparent)' }}
                >
                  <span className="text-[10px] text-white font-bold">
                    Vidéo {index + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
