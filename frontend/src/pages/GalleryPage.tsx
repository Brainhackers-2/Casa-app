import { useState } from 'react';
import { X, ZoomIn, Play, Image as ImgIcon, Film } from 'lucide-react';
import { GALLERY_IMAGES } from '../data';

/* ── 48 YouTube video IDs (identiques à CinemaPage) ─────────── */
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

type Tab = 'photos' | 'videos';

export default function GalleryPage() {
  const [tab,           setTab]      = useState<Tab>('photos');
  const [selectedPhoto, setPhoto]    = useState<string | null>(null);
  const [selectedVideo, setVideo]    = useState<string | null>(null);

  /* ── Navigation clavier (photos) ───────────────────────────── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedPhoto) return;
    if (e.key === 'Escape') { setPhoto(null); return; }
    const i = GALLERY_IMAGES.indexOf(selectedPhoto);
    if (e.key === 'ArrowRight') setPhoto(GALLERY_IMAGES[(i + 1) % GALLERY_IMAGES.length]);
    if (e.key === 'ArrowLeft')  setPhoto(GALLERY_IMAGES[(i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length]);
  };

  return (
    <div className="min-h-screen bg-slate-900" onKeyDown={handleKeyDown} tabIndex={-1}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-emerald-900 text-white py-16 px-4 text-center">
        <h1 className="text-5xl font-black mb-3">Galerie Casamance</h1>
        <p className="text-emerald-200 max-w-xl mx-auto mb-6">
          Photos et vidéos des plus beaux paysages et moments de Casamance
        </p>
        <div className="flex items-center justify-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-emerald-300">
            <ImgIcon size={15} /> <strong className="text-white">{GALLERY_IMAGES.length}</strong> photos
          </span>
          <span className="w-px h-4 bg-emerald-700" />
          <span className="flex items-center gap-1.5 text-emerald-300">
            <Film size={15} /> <strong className="text-white">{VIDEO_IDS.length}</strong> vidéos
          </span>
        </div>
      </div>

      {/* ── Onglets ──────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 py-3">
          <button
            onClick={() => setTab('photos')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
              tab === 'photos'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImgIcon size={15} /> Photos
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${tab === 'photos' ? 'bg-white/20' : 'bg-slate-700'}`}>
              {GALLERY_IMAGES.length}
            </span>
          </button>
          <button
            onClick={() => setTab('videos')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
              tab === 'videos'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Film size={15} /> Vidéos
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${tab === 'videos' ? 'bg-white/20' : 'bg-slate-700'}`}>
              {VIDEO_IDS.length}
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* ════════════════════════════════════════════════════════
            ONGLET PHOTOS — Grille masonry
        ════════════════════════════════════════════════════════ */}
        {tab === 'photos' && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {GALLERY_IMAGES.map((img, i) => (
              <div
                key={i}
                onClick={() => setPhoto(img)}
                className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-xl"
              >
                <img
                  src={img}
                  alt={`Casamance ${i + 1}`}
                  loading={i < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={i < 4 ? 'high' : 'auto'}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                </div>
                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  #{i + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            ONGLET VIDÉOS — Grille YouTube thumbnails
        ════════════════════════════════════════════════════════ */}
        {tab === 'videos' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {VIDEO_IDS.map((id, i) => (
              <div
                key={id}
                onClick={() => setVideo(id)}
                className="group relative cursor-pointer rounded-2xl overflow-hidden bg-slate-800 aspect-video"
              >
                <img
                  src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`}
                  alt={`Vidéo ${i + 1}`}
                  loading={i < 6 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay play */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 group-hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm group-hover:scale-110">
                    <Play size={20} className="text-white ml-1" fill="white" />
                  </div>
                </div>
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                  #{i + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          LIGHTBOX PHOTO
      ════════════════════════════════════════════════════════ */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
            onClick={() => setPhoto(null)}
          >
            <X size={22} />
          </button>

          {/* Flèches navigation */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold transition-colors z-10"
            onClick={e => { e.stopPropagation(); const i = GALLERY_IMAGES.indexOf(selectedPhoto); setPhoto(GALLERY_IMAGES[(i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length]); }}
          >
            ‹
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold transition-colors z-10"
            onClick={e => { e.stopPropagation(); const i = GALLERY_IMAGES.indexOf(selectedPhoto); setPhoto(GALLERY_IMAGES[(i + 1) % GALLERY_IMAGES.length]); }}
          >
            ›
          </button>

          <img
            src={selectedPhoto}
            alt="Casamance"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm">
            {GALLERY_IMAGES.indexOf(selectedPhoto) + 1} / {GALLERY_IMAGES.length}
          </span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL VIDÉO
      ════════════════════════════════════════════════════════ */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setVideo(null)}
        >
          <button
            className="absolute top-4 right-4 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
            onClick={() => setVideo(null)}
          >
            <X size={22} />
          </button>
          <div
            className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <iframe
              key={selectedVideo}
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
