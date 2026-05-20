import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, X, Compass, Activity, Home, ChevronDown, Globe, LogOut,
  LogIn, Utensils, Users, Bed, Image, Calendar, MessageSquare,
  Star, Mail, LayoutDashboard, Inbox, AlertCircle, Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation, type Language } from '../context/LanguageContext';

const LANGS: { code: Language; label: string; short: string }[] = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'wo', label: 'Wolof', short: 'WO' },
  { code: 'dyo', label: 'Diola', short: 'DY' },
  { code: 'man', label: 'Mandingue', short: 'MA' },
  { code: 'ff', label: 'Peul', short: 'FF' },
];

const EXPLORE_ICONS = [Utensils, Users, Bed, Image, Calendar, MessageSquare, Star];
const EXPLORE_PATHS = ['/gastronomy', '/guides', '/accommodations', '/gallery', '/agenda', '/testimonials', '/reviews'];
const EXPLORE_KEYS  = ['nav.gastronomy', 'nav.guides', 'nav.accommodations', 'nav.gallery', 'nav.agenda', 'nav.testimonials', 'footer.c.reviews'];

export default function Navbar() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [langOpen,    setLangOpen]    = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const exploreTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMenuRef    = useRef<HTMLDivElement>(null);

  /* Ferme le menu utilisateur en cliquant ailleurs */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { user, isAuthenticated, logout } = useAuth();
  const { lang, setLang, t } = useTranslation();
  const exploreLinks = EXPLORE_PATHS.map((to, i) => ({
    to,
    label: t(EXPLORE_KEYS[i]),
    Icon:  EXPLORE_ICONS[i],
  }));
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeAll = () => {
    setLangOpen(false);
    setExploreOpen(false);
  };

  /* Hover helpers for explore dropdown */
  const onExploreEnter = () => {
    if (exploreTimeout.current) clearTimeout(exploreTimeout.current);
    setExploreOpen(true);
  };
  const onExploreLeave = () => {
    exploreTimeout.current = setTimeout(() => setExploreOpen(false), 150);
  };

  const currentLang = LANGS.find(l => l.code === lang) ?? LANGS[0];

  return (
    <>
      {/* ── Beta Banner ─────────────────────────────────────────────── */}
      <div className="bg-amber-500 text-white text-xs font-medium py-1.5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2].map(n => (
            <span key={n} className="inline-flex items-center gap-2 mx-8">
              <AlertCircle size={13} className="flex-shrink-0" />
              Version Bêta — Site en cours d'amélioration, merci pour votre compréhension.
            </span>
          ))}
        </div>
      </div>

      {/* ── Main Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ──────────────────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group relative">
              <img
                src="https://i.imgur.com/mhdy6s5.png"
                alt="Casamance Tour"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="hidden lg:block font-black text-lg leading-none">
                <span className="text-slate-900">Casamance</span>
                <span className="text-emerald-600">Tour</span>
              </span>
              {/* Tooltip */}
              <div className="hidden lg:block absolute left-0 top-full mt-2 w-72 bg-slate-900 text-white text-xs rounded-xl px-4 py-3 shadow-xl
                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 leading-relaxed">
                Le vert émeraude symbolise la nature luxuriante, la case représente le patrimoine,
                et le soleil l'accueil chaleureux.
              </div>
            </Link>

            {/* ── Desktop Nav ───────────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-0.5">

              {/* Accueil — always visible */}
              <Link to="/" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-medium">
                <Home size={15} /> {t('nav.home')}
              </Link>

              {isAuthenticated && (
                <>
                  <Link to="/discovery" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-medium">
                    <Compass size={15} /> {t('nav.discover')}
                  </Link>

                  <Link to="/activities" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-medium">
                    <Activity size={15} /> {t('nav.activities')}
                  </Link>

                  {/* Explorer dropdown — hover */}
                  <div
                    className="relative"
                    onMouseEnter={onExploreEnter}
                    onMouseLeave={onExploreLeave}
                  >
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-medium">
                      {t('nav.explore')}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {exploreOpen && (
                      <div
                        className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50"
                        onMouseEnter={onExploreEnter}
                        onMouseLeave={onExploreLeave}
                      >
                        {exploreLinks.map(({ to, label, Icon }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setExploreOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          >
                            <Icon size={15} className="text-emerald-500 flex-shrink-0" />
                            {label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mes Réservations — masqué si admin */}
                  {user?.role !== 'admin' && (
                    <Link to="/my-bookings" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-medium">
                      <Inbox size={15} /> {t('nav.myReservations')}
                    </Link>
                  )}

                  {/* Contact */}
                  <Link
                    to="/contact"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition-colors text-sm font-medium ml-1"
                  >
                    <Mail size={15} /> {t('nav.contact')}
                  </Link>

                  {/* Admin panel */}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors text-sm font-medium ml-1"
                    >
                      <LayoutDashboard size={15} /> {t('nav.adminPanel')}
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* ── Right zone ────────────────────────────────────────── */}
            <div className="flex items-center gap-2">

              {/* Language selector */}
              <div className="relative">
                <button
                  onClick={() => { setLangOpen(!langOpen); setExploreOpen(false); }}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors text-sm font-semibold"
                >
                  <Globe size={16} className="text-emerald-600" />
                  <span>{currentLang.short}</span>
                </button>
                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                    <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                      {LANGS.map(l => (
                        <button
                          key={l.code}
                          onClick={() => { setLang(l.code); setLangOpen(false); }}
                          className={`w-full text-left flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                            lang === l.code ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{l.label}</span>
                          <span className="text-xs text-slate-400 font-mono">{l.short}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Authenticated user — dropdown */}
              {isAuthenticated && user ? (
                <div className="hidden lg:block relative" ref={userMenuRef}>
                  {/* Bouton déclencheur */}
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-full px-3 py-1.5 transition-colors max-w-[220px]"
                  >
                    <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold leading-none">{user.name[0].toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 truncate" style={{ maxWidth: 90 }}>
                      {user.name}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                      {/* Infos utilisateur */}
                      <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="inline-block mt-1 bg-violet-100 text-violet-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {t('nav.admin')}
                          </span>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="p-1.5 space-y-0.5">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <Settings size={16} className="text-slate-400" />
                          {t('nav.profile')}
                        </Link>
                        <button
                          onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <LogOut size={16} className="text-slate-400" />
                          {t('nav.disconnect')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <LogIn size={15} /> {t('nav.connect')}
                </Link>
              )}

              {/* Hamburger */}
              <button
                onClick={() => { setMenuOpen(!menuOpen); closeAll(); }}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ─────────────────────────────────────────────── */}
        <div
          className={`lg:hidden overflow-y-auto border-t border-slate-100 bg-white transition-all duration-300 ease-in-out ${
            menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none h-0'
          }`}
          style={{ maxHeight: menuOpen ? 'calc(100vh - 100px)' : 0 }}
        >
          <div className="px-4 py-4 space-y-1">

            {/* User block */}
            {isAuthenticated && user && (
              <div className="bg-emerald-600 rounded-xl px-4 py-3 mb-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{user.name[0].toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                  {user.role === 'admin' && (
                    <span className="text-emerald-200 text-xs">{t('nav.modeAdmin')}</span>
                  )}
                </div>
              </div>
            )}

            {/* Base links */}
            <MobileLink to="/" Icon={Home} label={t('nav.home')} onClick={() => setMenuOpen(false)} />

            {isAuthenticated && (
              <>
                <MobileLink to="/discovery" Icon={Compass} label={t('nav.discover')} onClick={() => setMenuOpen(false)} />
                <MobileLink to="/activities" Icon={Activity} label={t('nav.activities')} onClick={() => setMenuOpen(false)} />

                {/* Explorer section */}
                <div className="pt-2">
                  <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">{t('nav.explore')}</p>
                  {exploreLinks.map(({ to, label, Icon }) => (
                    <MobileLink key={to} to={to} Icon={Icon} label={label} onClick={() => setMenuOpen(false)} />
                  ))}
                </div>

                {/* Mes Réservations (non admin) */}
                {user?.role !== 'admin' && (
                  <div className="pt-2">
                    <MobileLink to="/my-bookings" Icon={Inbox} label={t('nav.myReservations')} onClick={() => setMenuOpen(false)} />
                  </div>
                )}

                <MobileLink to="/profile" Icon={Settings} label={t('nav.profile')} onClick={() => setMenuOpen(false)} />
                <MobileLink to="/contact" Icon={Mail} label={t('nav.contact')} onClick={() => setMenuOpen(false)} />

                {/* Admin panel */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-50 text-violet-700 font-semibold text-sm mt-2"
                  >
                    <LayoutDashboard size={17} /> {t('nav.adminPanel')}
                  </Link>
                )}
              </>
            )}

            {/* Auth button */}
            <div className="pt-3 border-t border-slate-100 mt-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-700 transition-colors"
                >
                  <LogOut size={16} /> {t('nav.disconnect')}
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
                >
                  <LogIn size={16} /> {t('nav.connect')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function MobileLink({
  to, Icon, label, onClick,
}: {
  to: string;
  Icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium"
    >
      <Icon size={17} className="text-emerald-600 flex-shrink-0" />
      {label}
    </Link>
  );
}
