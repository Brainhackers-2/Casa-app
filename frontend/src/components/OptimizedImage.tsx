import { useState, useRef, useEffect } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}

export default function OptimizedImage({ src, alt, className = '', style, priority = false }: Props) {
  const [loaded,  setLoaded]  = useState(false);
  const [error,   setError]   = useState(false);
  const [inView,  setInView]  = useState(priority);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || inView) return;
    const el = wrapRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' } // commence à charger 300px avant le viewport
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, inView]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`} style={style}>
      {/* Shimmer skeleton pendant le chargement */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
      )}

      {/* Image — ne se charge que quand dans le viewport */}
      {inView && !error && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Fallback erreur */}
      {error && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <span className="text-slate-400 text-xs text-center px-2">Image non disponible</span>
        </div>
      )}
    </div>
  );
}
