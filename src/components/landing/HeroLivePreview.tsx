import { useEffect, useState } from "react";
import { Sparkles, Globe2 } from "lucide-react";

/**
 * Cinematic "AI is building your site" mock for the landing hero.
 * Pure presentation — typewriter loop, no real network.
 */
const SCRIPT: { who: "user" | "ai"; text: string }[] = [
  { who: "user", text: "Cria um site para o meu restaurante de sushi no Maputo" },
  { who: "ai", text: "A interpretar pedido..." },
  { who: "ai", text: "A escolher paleta: indigo + ouro 🎨" },
  { who: "ai", text: "A montar hero cinemático com vídeo de fundo" },
  { who: "ai", text: "A escrever menu com 12 pratos e preços em MZN" },
  { who: "ai", text: "A ligar formulário ao WhatsApp +258..." },
  { who: "ai", text: "✨ Pronto. Site publicado em sushi.kinjani.app" },
];

export function HeroLivePreview() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const target = SCRIPT[step]?.text ?? "";
    let i = 0;
    setTyped("");
    const tick = window.setInterval(() => {
      i += 1;
      setTyped(target.slice(0, i));
      if (i >= target.length) {
        window.clearInterval(tick);
        window.setTimeout(() => {
          setStep((s) => (s + 1) % SCRIPT.length);
        }, 900);
      }
    }, 22);
    return () => window.clearInterval(tick);
  }, [step]);

  const visible = SCRIPT.slice(0, step + 1);

  return (
    <div className="relative w-full max-w-xl mx-auto lg:mx-0">
      <div className="absolute -inset-6 bg-gradient-to-br from-caribbean-green/40 via-mountain-meadow/30 to-transparent blur-3xl opacity-60" />
      <div className="relative rounded-2xl border border-pistachio/20 bg-rich-black/70 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-pistachio/10 bg-black/40">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          <div className="ml-3 flex items-center gap-2 text-xs text-pistachio/70">
            <Globe2 className="h-3.5 w-3.5" />
            kinjani.ai / editor
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-caribbean-green">
            <span className="w-1.5 h-1.5 rounded-full bg-caribbean-green animate-pulse" />
            ao vivo
          </div>
        </div>

        <div className="p-5 space-y-3 min-h-[320px] max-h-[360px] overflow-hidden">
          {visible.map((m, i) => {
            const isLast = i === visible.length - 1;
            const text = isLast ? typed : m.text;
            return (
              <div
                key={`${step}-${i}`}
                className={`flex ${m.who === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] text-sm px-3.5 py-2.5 rounded-2xl ${
                    m.who === "user"
                      ? "bg-caribbean-green text-rich-black rounded-br-sm"
                      : "bg-pistachio/10 text-anti-flash-white rounded-bl-sm border border-pistachio/10"
                  }`}
                >
                  {m.who === "ai" && i === 0 && (
                    <Sparkles className="inline h-3.5 w-3.5 mr-1.5 text-caribbean-green -mt-0.5" />
                  )}
                  <span>{text}</span>
                  {isLast && (
                    <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-caribbean-green animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
