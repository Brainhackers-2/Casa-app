import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';

/* ─── Inline social SVG icons (lucide-react doesn't include brand icons) */
function FbIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function TwIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* ─── Footer link with sliding green line ────────────────────── */
function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 transition-colors"
      style={{ color: '#a1b8ac' }}
    >
      <span
        className="block h-px w-3 transition-all duration-300 opacity-0 group-hover:opacity-100 flex-shrink-0"
        style={{ background: '#10b981' }}
      />
      <span
        className="text-[0.95rem] font-medium group-hover:text-white transition-colors"
      >
        {label}
      </span>
    </Link>
  );
}

/* ─── Column heading ─────────────────────────────────────────── */
function ColTitle({ text }: { text: string }) {
  return (
    <p className="text-sm uppercase tracking-[0.2em] text-white font-medium mb-8">
      {text}
    </p>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */
export default function Footer() {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);

  const qrData = encodeURIComponent('https://casamance-tourisme-xiih.vercel.app/');
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${qrData}&margin=1`;

  const handleNewsletter = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Merci pour votre inscription à la newsletter !');
    formRef.current?.reset();
  };

  return (
    <footer
      className="mt-20 relative overflow-hidden"
      style={{ background: '#0b1310' }}
    >
      {/* Decorative blob — top-right */}
      <div
        className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(6,78,59,0.4)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">

        {/* ── 12-col grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-14">

          {/* COL 1 — Logo + Tagline + Social */}
          <div className="col-span-12 lg:col-span-4">
            {/* Logo + Name */}
            <div className="flex items-center gap-4 pb-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <img
                src="https://i.imgur.com/mhdy6s5.png"
                alt="Casamance Tour"
                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                style={{ border: '2px solid rgba(16,185,129,0.3)' }}
              />
              <h2
                className="text-4xl font-light tracking-tight text-white leading-none"
              >
                <span className="font-serif">Casamance</span>
                <span style={{ color: '#10b981' }} className="font-sans">Tour</span>
              </h2>
            </div>

            {/* Tagline */}
            <p
              className="text-[1.05rem] font-medium leading-relaxed pr-4 mt-6 mb-6"
              style={{ color: '#a1b8ac' }}
            >
              Le portail de référence pour un tourisme durable, éthique et authentique
              en Terre de Casamance.
            </p>

            {/* Social buttons */}
            <div
              className="flex items-center gap-3 pt-6 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              {[
                { Icon: FbIcon, href: '#', label: 'Facebook' },
                { Icon: IgIcon, href: '#', label: 'Instagram' },
                { Icon: TwIcon, href: '#', label: 'Twitter' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-emerald-600 hover:-translate-y-1"
                  style={{ border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* COL 2 — Services (col-start-6 on lg) */}
          <div className="col-span-6 md:col-span-4 lg:col-span-2 lg:col-start-6">
            <ColTitle text={t('footer.services')} />
            <nav className="space-y-4">
              <FooterLink to="/gastronomy"    label={t('footer.s.gastronomy')} />
              <FooterLink to="/guides"        label={t('footer.s.guides')} />
              <FooterLink to="/accommodations" label={t('footer.s.accommodations')} />
              <FooterLink to="/activities"    label={t('footer.s.activities')} />
            </nav>
          </div>

          {/* COL 3 — Communauté */}
          <div className="col-span-6 md:col-span-4 lg:col-span-2">
            <ColTitle text={t('footer.community')} />
            <nav className="space-y-4">
              <FooterLink to="/gallery"       label={t('footer.c.gallery')} />
              <FooterLink to="/testimonials"  label={t('footer.c.testimonials')} />
              <FooterLink to="/reviews"       label={t('footer.c.reviews')} />
              <FooterLink to="/contact"       label={t('footer.c.contact')} />
            </nav>
          </div>

          {/* COL 4 — Newsletter */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <ColTitle text={t('footer.newsletter')} />
            <p
              className="text-[0.95rem] font-medium mb-6"
              style={{ color: '#a1b8ac' }}
            >
              {t('footer.newsletterText')}
            </p>
            <form ref={formRef} onSubmit={handleNewsletter} className="relative">
              <input
                type="email"
                required
                name="email"
                autoComplete="email"
                placeholder="Votre adresse email"
                className="w-full pl-5 pr-36 py-4 rounded-full text-sm text-white focus:outline-none transition-colors"
                style={{
                  background: '#15241f',
                  border: '1px solid #233b32',
                  // placeholder color via CSS trick
                }}
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all"
                style={{ boxShadow: '0 0 20px rgba(5,150,105,0.3)' }}
              >
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────── */}
        <div
          className="mt-12 pt-8 flex flex-col items-center gap-5"
          style={{ borderTop: '1px solid #233b32' }}
        >
          {/* QR label */}
          <p
            className="text-xs uppercase tracking-[0.2em] font-medium"
            style={{ color: '#a1b8ac' }}
          >
            Scannez pour visiter l'application mobile
          </p>

          {/* QR code */}
          <a
            href="https://casamance-tourisme-xiih.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-3xl backdrop-blur-md shadow-xl transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <img
              src={qrUrl}
              alt="QR Code Casamance Tour"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl bg-white p-2"
              style={{ imageRendering: 'pixelated' }}
              loading="lazy"
            />
          </a>

          {/* Copyright */}
          <p
            className="text-sm font-medium uppercase tracking-widest text-center"
            style={{ color: '#a1b8ac' }}
          >
            © {new Date().getFullYear()} Casamance Tour —{' '}
            <span style={{ opacity: 0.6 }}>SMI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
