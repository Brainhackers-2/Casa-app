import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Groq from 'groq-sdk';
import { useTranslation } from '../context/LanguageContext';
import {
  LOCATIONS, ACTIVITIES, GUIDES, ACCOMMODATIONS,
  DISHES, DRINKS, AGENDA_EVENTS
} from '../data';

/* ── Types ──────────────────────────────────────────────────── */
interface Message {
  role: 'user' | 'bot';
  text: string;
}

/* ── Messages de bienvenue ──────────────────────────────────── */
const WELCOME: Record<string, string> = {
  fr: 'Bonjour ! Je suis votre assistant Casamance Tour. Posez-moi toutes vos questions sur la Casamance, le Sénégal ou nos offres !',
  en: 'Hello! I am your Casamance Tour assistant. Ask me anything about Casamance, Senegal or our offers!',
  wo: 'Nanga def ! Maay sa ndimbal ci Casamance Tour.',
  dyo: 'Kassoumaye ! Inje n-dimbal nu.',
};

function getWelcome(lang: string): string {
  return WELCOME[lang] ?? WELCOME['fr'];
}

/* ── Contexte enrichi du site ───────────────────────────────── */
function buildSiteContext(): string {
  const lieux = LOCATIONS.map(l =>
    `• ${l.name} (${l.region} — ${l.category}) : ${l.description}`
  ).join('\n');

  const activites = ACTIVITIES.map(a =>
    `• ${a.name} | Type: ${a.type} | Région: ${a.region} | Durée: ${a.duration} | Prix: ${a.price?.toLocaleString('fr-FR')} FCFA — ${a.description}`
  ).join('\n');

  const hebergements = ACCOMMODATIONS.map(a =>
    `• ${a.name} (${(a as any).region ?? ''}) : ${(a as any).description ?? ''}`
  ).join('\n');

  const plats = DISHES.map(d =>
    `• ${d.name} : ${(d as any).description ?? ''}`
  ).join('\n');

  const boissons = DRINKS.map(d =>
    `• ${d.name} : ${(d as any).description ?? ''}`
  ).join('\n');

  const guides = GUIDES.map(g =>
    `• ${g.name} — Spécialité: ${(g as any).specialty ?? ''} : ${(g as any).description ?? ''}`
  ).join('\n');

  const evenements = AGENDA_EVENTS.map(e =>
    `• ${e.title} (${(e as any).date ?? ''}, ${(e as any).location ?? ''}) : ${(e as any).description ?? ''}`
  ).join('\n');

  return `
=== LIEUX & DESTINATIONS ===
${lieux}

=== ACTIVITÉS ===
${activites}

=== HÉBERGEMENTS ===
${hebergements}

=== GASTRONOMIE — PLATS ===
${plats}

=== GASTRONOMIE — BOISSONS ===
${boissons}

=== GUIDES TOURISTIQUES ===
${guides}

=== AGENDA & ÉVÉNEMENTS ===
${evenements}
`.trim();
}

/* ── Prompt système complet ─────────────────────────────────── */
function buildSystemPrompt(langLabel: string): string {
  const siteContext = buildSiteContext();

  return `Tu es un assistant touristique expert de **Casamance Tour**, une plateforme dédiée au tourisme en Casamance, au Sénégal. Tu réponds impérativement en ${langLabel}.

## TES DOMAINES DE COMPÉTENCE

1. **Les offres de Casamance Tour** : lieux, activités, hébergements, gastronomie, guides, événements — utilise les données exactes ci-dessous.
2. **Tourisme en Casamance** : culture, histoire, géographie, conseils pratiques, vie locale.
3. **Tourisme au Sénégal** : toutes les destinations, informations générales.

---

## DONNÉES DU SITE CASAMANCE TOUR

${siteContext}

---

## CONNAISSANCE GÉNÉRALE — CASAMANCE & SÉNÉGAL

### Géographie
La Casamance est au sud du Sénégal, séparée du nord par la Gambie. Elle comprend :
- **Ziguinchor** (Basse-Casamance) : la plus touristique — plages, mangroves, culture Diola.
- **Sédhiou** (Moyenne-Casamance) : fleuve Casamance, cultures Mandingue et Balante.
- **Kolda** (Haute-Casamance) : culture Peul, porte du Parc du Niokolo-Koba.

### Cultures & Peuples
- **Diola (Joola)** : peuple autochtone de la Basse-Casamance, traditionnellement animistes, cultivateurs de riz, célèbres pour leurs rites initiatiques (Boukout, Kankourang — UNESCO).
- **Mandingues** : commerçants, musulmans, artisans du cuir, présents surtout en Moyenne-Casamance.
- **Peuls (Fula)** : éleveurs nomades, artisanat reconnu, implantés en Haute-Casamance.
- **Balante** : agriculteurs traditionnels, villages en banco.

### Comment venir en Casamance
- **Avion** : Dakar (AIBD) → Ziguinchor ou Cap Skirring avec Air Sénégal / Transair (~1h, à partir de 35 000 FCFA).
- **Ferry** : Dakar → Ziguinchor avec le Joola II (12-18h, traversée sur l'Atlantique, départs plusieurs fois/semaine).
- **Route** : via la Gambie (~8-10h depuis Dakar), ou route nationale 4 par le Nord.
- **Bus** : compagnies DDD, Viateur, Cars Diallo depuis Dakar.

### Meilleure période pour visiter
- **Novembre à mai** : saison sèche, idéale — plages, randonnées, festivals.
- **Juin à octobre** : hivernage (saison des pluies) — nature luxuriante, moins de touristes, certaines routes difficiles.

### Infos pratiques
- **Monnaie** : Franc CFA (XOF) — 1 € ≈ 655 FCFA, 1 USD ≈ 610 FCFA.
- **Langues** : Français (officiel), Diola (Joola), Mandingue, Pulaar, Wolof.
- **Santé** : vaccin fièvre jaune obligatoire, prophylaxie antipaludéenne recommandée.
- **Sécurité** : situation calme depuis 2014. Se renseigner avant tout séjour.
- **Urgences** : Police 17, Pompiers 18, SAMU 15.
- **Réseau** : Orange, Free, Expresso — couverture correcte en ville.

### Gastronomie sénégalaise (hors site)
Thiéboudienne (riz au poisson — plat national), Yassa poulet, Mafé (sauce arachide), Caldou, Domoda, Benachin.
Boissons : Bissap (hibiscus), Bouye (baobab), Ditakh, Wonjo, Thiakry (mil fermenté).

### Tourisme au Sénégal — autres destinations
- **Dakar** : capitale cosmopolite, Île de Gorée (UNESCO), plages de Yoff et Ngor, surf, musées.
- **Saint-Louis** : ancienne capitale coloniale, jazz festival, parc des oiseaux du Djoudj (UNESCO).
- **Sine-Saloum** : delta et mangroves, pêche, pirogue, campements.
- **Thiès** : tapisseries renommées, artisanat.
- **Touba** : ville sainte mouride, grande mosquée.
- **Parc du Niokolo-Koba** : UNESCO, lions, éléphants, hippos, 350+ espèces d'oiseaux.

---

## TON STYLE DE RÉPONSE
- Chaleureux, professionnel, passionné par la Casamance.
- Réponses **concises mais complètes** — utilise des listes, des titres courts si nécessaire.
- Cite les **noms exacts** des offres du site quand pertinent.
- Si la question touche une rubrique du site, invite l'utilisateur à la consulter (Activités, Hébergements, Gastronomie, Guides, Agenda).
- Pour les questions hors tourisme, réponds poliment que tu es spécialisé dans le tourisme au Sénégal.`;
}

/* ── Locale pour la reconnaissance vocale ───────────────────── */
const SPEECH_LOCALES: Record<string, string> = {
  fr:  'fr-FR',
  en:  'en-US',
  wo:  'fr-SN',
  dyo: 'fr-SN',
  man: 'fr-GN',
  ff:  'fr-GN',
};

/* ── Composant principal ────────────────────────────────────── */
export default function Chatbot() {
  const [isOpen, setIsOpen]           = useState(false);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef      = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const { t, lang } = useTranslation();

  /* Réinitialise au changement de langue */
  useEffect(() => {
    setMessages([{ role: 'bot', text: getWelcome(lang) }]);
  }, [lang]);

  /* Nettoyage reconnaissance vocale */
  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  /* ── Reconnaissance vocale ──────────────────────────────────── */
  const toggleRecording = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome ou Edge.');
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang           = SPEECH_LOCALES[lang] ?? 'fr-FR';
    recognition.continuous     = false;
    recognition.interimResults = true;

    recognition.onstart  = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };
    recognition.onend   = () => { setIsRecording(false); recognitionRef.current = null; };
    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') console.error('Speech error:', event.error);
      setIsRecording(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  /* ── Envoi du message via Groq ──────────────────────────────── */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');

    setMessages(prev => [
      ...prev,
      { role: 'user', text: userMsg },
      { role: 'bot',  text: '' },
    ]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

      const langLabel = t(`lang.${lang}`) || lang;

      /* Historique de la conversation (sans le placeholder vide) */
      const history = messages
        .filter(m => m.text !== '')
        .map(m => ({
          role:    m.role === 'bot' ? ('assistant' as const) : ('user' as const),
          content: m.text,
        }));

      const stream = await groq.chat.completions.create({
        model:       'llama-3.3-70b-versatile',
        max_tokens:  2048,
        temperature: 0.7,
        stream:      true,
        messages: [
          { role: 'system', content: buildSystemPrompt(langLabel) },
          ...history,
          { role: 'user',   content: userMsg },
        ],
      });

      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk.choices[0]?.delta?.content ?? '';
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'bot', text: fullText };
          return updated;
        });
      }
    } catch (err) {
      console.error('Groq error:', err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'bot',
          text: 'Service indisponible. Vérifiez votre clé VITE_GROQ_API_KEY dans le fichier .env.',
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Rendu ──────────────────────────────────────────────────── */
  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 bg-[#1A3C34] text-[#fdfbf7] px-4 py-3 rounded-full shadow-[0_8px_30px_rgba(26,60,52,0.3)] hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Ouvrir l'assistant"
      >
        <MessageSquare size={20} className="text-[#C1E1C1]" />
        <span className="hidden sm:inline text-sm font-medium">{t('nav.contact')}</span>
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[60] flex flex-col bg-[#fdfbf7] rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
          style={{ width: 'min(400px, calc(100vw - 3rem))', height: 'min(600px, calc(100vh - 6rem))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#1A3C34] px-5 py-4 border-b border-black/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-[#2A4C44] rounded-full p-2">
                <Bot size={22} className="text-[#C1E1C1]" />
              </div>
              <div>
                <p className="font-serif text-[17px] font-medium tracking-wide text-[#fdfbf7]">
                  Assistant Casamance
                </p>
                <p className="text-[10px] tracking-widest text-[#C1E1C1] uppercase">{lang}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#fdfbf7] hover:bg-[#2A4C44] rounded-full p-1.5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-5 space-y-5 bg-[#fdfbf7]">
            {messages.map((msg, i) =>
              msg.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <div className="bg-[#1A3C34] text-[#fdfbf7] rounded-l-2xl rounded-tr-2xl rounded-br-sm max-w-[85%] px-4 py-3 text-[15px] leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  {msg.text === '' && isLoading ? (
                    <div className="bg-white border border-[#1A3C34]/10 rounded-r-2xl rounded-tl-2xl rounded-bl-sm px-4 py-3">
                      <Loader2 size={18} className="animate-spin text-[#1A3C34]" />
                    </div>
                  ) : (
                    <div className="bg-white border border-[#1A3C34]/10 rounded-r-2xl rounded-tl-2xl rounded-bl-sm max-w-[85%] px-4 py-3 text-[15px] prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          a:      ({ ...props }) => <a      {...props} className="text-[#1A3C34] hover:underline" />,
                          strong: ({ ...props }) => <strong {...props} className="font-bold text-gray-900" />,
                          ul:     ({ ...props }) => <ul     {...props} className="space-y-1 my-2 pl-4 list-disc" />,
                          ol:     ({ ...props }) => <ol     {...props} className="space-y-1 my-2 pl-4 list-decimal" />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Zone de saisie */}
          <div className="flex-shrink-0 p-4 bg-white border-t border-[#1A3C34]/10 space-y-2">
            {isRecording && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-50 rounded-full border border-rose-200 w-fit mx-auto">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-bold text-rose-600">Enregistrement en cours...</span>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={isRecording ? 'Parlez maintenant...' : (t('chatbot.placeholder') || 'Posez votre question...')}
                disabled={isLoading}
                className={`flex-1 border rounded-full px-5 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                  isRecording
                    ? 'bg-rose-50 border-rose-200 text-rose-800 focus:ring-rose-200'
                    : 'bg-[#fdfbf7] border-[#1A3C34]/10 text-slate-800 focus:ring-[#1A3C34]/20'
                } disabled:opacity-50`}
              />
              <button
                onClick={toggleRecording}
                disabled={isLoading}
                title={isRecording ? "Arrêter l'enregistrement" : 'Enregistrer un vocal'}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse hover:bg-rose-600'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50'
                }`}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 bg-[#1A3C34] text-white rounded-full flex items-center justify-center hover:bg-[#2A4C44] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
