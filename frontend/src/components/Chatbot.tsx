import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Mic, MicOff } from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';
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
  fr: 'Bonjour ! Je suis votre assistant Casamance Tour. Comment puis-je vous aider ?',
  en: 'Hello! I am your Casamance Tour assistant. How can I help you today?',
  wo: 'Nanga def ! Maay sa ndimbal ci Casamance Tour.',
  dyo: 'Kassoumaye ! Inje n-dimbal nu.',
};

function getWelcome(lang: string): string {
  return WELCOME[lang] ?? WELCOME['fr'];
}

/* ── Données contexte (noms uniquement) ─────────────────────── */
function buildContextData() {
  return {
    activites:            ACTIVITIES.map(a => a.name).join(', '),
    hebergements:         ACCOMMODATIONS.map(a => a.name).join(', '),
    gastronomie_plats:    DISHES.map(d => d.name).join(', '),
    gastronomie_boissons: DRINKS.map(d => d.name).join(', '),
    guides:               GUIDES.map(g => g.name).join(', '),
    lieux:                LOCATIONS.map(l => l.name).join(', '),
    evenements:           AGENDA_EVENTS.map(e => e.title).join(', '),
  };
}

/* ── Prompt système ─────────────────────────────────────────── */
function buildSystemPrompt(langLabel: string): string {
  const d = buildContextData();
  return `Tu es un assistant touristique expert pour la plateforme Casamance Tour.
IMPORTANT: Tu dois impérativement répondre en ${langLabel}.

Ton rôle :
- Aider les utilisateurs à planifier leur voyage en Casamance.
- Proposer des activités, hébergements, plats, boissons, guides, lieux ou événements disponibles EXACTEMENT selon les données de notre site.

Voici les données du site à utiliser pour répondre :
Activités : ${d.activites}
Hébergements : ${d.hebergements}
Plats : ${d.gastronomie_plats}
Boissons : ${d.gastronomie_boissons}
Guides : ${d.guides}
Lieux : ${d.lieux}
Événements : ${d.evenements}

Tes réponses doivent être directes, utiles, chaleureuses et concises.
Cite les noms exacts de notre base de données. N'hésite pas à conseiller aux utilisateurs de consulter les rubriques (Activités, Hébergements, Gastronomie, Guides, Agenda) dans le menu principal.`;
}

/* ── Composant principal ────────────────────────────────────── */
/* ── Locale pour la reconnaissance vocale ───────────────────── */
const SPEECH_LOCALES: Record<string, string> = {
  fr:  'fr-FR',
  en:  'en-US',
  wo:  'fr-SN',
  dyo: 'fr-SN',
  man: 'fr-GN',
  ff:  'fr-GN',
};

export default function Chatbot() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef      = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const { t, lang } = useTranslation();

  /* Réinitialise au changement de langue */
  useEffect(() => {
    setMessages([{ role: 'bot', text: getWelcome(lang) }]);
  }, [lang]);

  /* Nettoyage reconnaissance vocale au démontage */
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
    recognition.lang            = SPEECH_LOCALES[lang] ?? 'fr-FR';
    recognition.continuous      = false;
    recognition.interimResults  = true;

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        console.error('Speech error:', event.error);
      }
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');

    // Ajoute message user + placeholder bot vide
    setMessages(prev => [
      ...prev,
      { role: 'user', text: userMsg },
      { role: 'bot', text: '' },
    ]);
    setIsLoading(true);

    try {
      const apiKey =
        (typeof process !== 'undefined' && process.env?.API_KEY) ||
        (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
        (import.meta as any).env.VITE_GEMINI_API_KEY;

      const ai = new GoogleGenAI({ apiKey });

      /* Historique pour Gemini */
      const contents = messages.map(msg => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      }));
      contents.push({ role: 'user', parts: [{ text: userMsg }] });

      const langLabel = t(`lang.${lang}`) || lang;
      const systemInstruction = buildSystemPrompt(langLabel);

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: { systemInstruction },
      });

      let fullBotText = '';
      for await (const chunk of responseStream) {
        fullBotText += chunk.text ?? '';
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'bot', text: fullBotText };
          return updated;
        });
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'bot',
          text: 'Service indisponible ou clé API non configurée.',
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Bouton flottant ──────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 bg-[#1A3C34] text-[#fdfbf7] px-4 py-3 rounded-full shadow-[0_8px_30px_rgba(26,60,52,0.3)] hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Ouvrir l'assistant"
      >
        <MessageSquare size={20} className="text-[#C1E1C1]" />
        <span className="hidden sm:inline text-sm font-medium">{t('nav.contact')}</span>
      </button>

      {/* ── Fenêtre de chat ──────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[60] flex flex-col bg-[#fdfbf7] rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
          style={{
            width: 'min(400px, calc(100vw - 3rem))',
            height: 'min(600px, calc(100vh - 6rem))',
          }}
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
          <div
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-5 space-y-5 bg-[#fdfbf7]"
          >
            {messages.map((msg, i) =>
              msg.role === 'user' ? (
                /* Message utilisateur */
                <div key={i} className="flex justify-end">
                  <div className="bg-[#1A3C34] text-[#fdfbf7] rounded-l-2xl rounded-tr-2xl rounded-br-sm max-w-[85%] px-4 py-3 text-[15px] leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              ) : (
                /* Message bot */
                <div key={i} className="flex justify-start">
                  {msg.text === '' && isLoading ? (
                    /* Indicateur chargement */
                    <div className="bg-white border border-[#1A3C34]/10 rounded-r-2xl rounded-tl-2xl rounded-bl-sm px-4 py-3">
                      <Loader2 size={18} className="animate-spin text-[#1A3C34]" />
                    </div>
                  ) : (
                    /* Réponse Markdown */
                    <div className="bg-white border border-[#1A3C34]/10 rounded-r-2xl rounded-tl-2xl rounded-bl-sm max-w-[85%] px-4 py-3 text-[15px] prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          a: ({ ...props }) => (
                            <a {...props} className="text-[#1A3C34] hover:underline" />
                          ),
                          strong: ({ ...props }) => (
                            <strong {...props} className="font-bold text-gray-900" />
                          ),
                          ul: ({ ...props }) => (
                            <ul {...props} className="space-y-1 my-2 pl-4 list-disc" />
                          ),
                          ol: ({ ...props }) => (
                            <ol {...props} className="space-y-1 my-2 pl-4 list-decimal" />
                          ),
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
            {/* Indicateur enregistrement */}
            {isRecording && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-50 rounded-full border border-rose-200 w-fit mx-auto">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-bold text-rose-600">Enregistrement en cours... Parlez maintenant</span>
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
              {/* Bouton Micro */}
              <button
                onClick={toggleRecording}
                disabled={isLoading}
                title={isRecording ? 'Arrêter l\'enregistrement' : 'Enregistrer un vocal'}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse hover:bg-rose-600'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50'
                }`}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              {/* Bouton Envoyer */}
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
