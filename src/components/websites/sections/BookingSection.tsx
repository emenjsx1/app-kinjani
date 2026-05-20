import { useMemo, useState } from "react";
import { Calendar, Clock, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SectionProps } from "./types";

/**
 * BookingSection
 * Multi-step appointment booking: 1) pick service, 2) pick date/time, 3) confirmation form.
 * Reads up to 6 services from content (service1Title..service6Title).
 * On submit, opens WhatsApp with the full summary if whatsappNumber present.
 */
export function BookingSection({ section, primaryColor, font }: SectionProps) {
  const c = section.content;
  const title = c.title || "Marque a sua consulta";
  const subtitle = c.subtitle || "Escolha o serviço, o horário e confirme em segundos";

  const services = useMemo(() => {
    const out: { title: string; description?: string }[] = [];
    for (let i = 1; i <= 6; i++) {
      const t = c[`service${i}Title`];
      if (t) out.push({ title: t, description: c[`service${i}Description`] });
    }
    if (out.length === 0) out.push({ title: "Consulta geral" });
    return out;
  }, [c]);

  const slots = useMemo(() => {
    const raw = c.slots || "09:00, 10:00, 11:00, 14:00, 15:00, 16:00, 17:00";
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }, [c.slots]);

  const nextDays = useMemo(() => {
    const arr: { iso: string; label: string }[] = [];
    const today = new Date();
    for (let i = 1; i <= 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push({
        iso: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("pt-PT", { weekday: "short", day: "2-digit", month: "short" }),
      });
    }
    return arr;
  }, []);

  const [step, setStep] = useState(1);
  const [service, setService] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const whatsappNumber = c.whatsappNumber || c.phone?.replace(/\D/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const summary = encodeURIComponent(
      `*Nova Marcação*\n\n*Serviço:* ${service}\n*Data:* ${date}\n*Hora:* ${time}\n\n*Nome:* ${form.name}\n*Email:* ${form.email}\n*Telefone:* ${form.phone}\n*Notas:* ${form.notes || "—"}`
    );
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}?text=${summary}`, "_blank");
    }
    toast.success("Marcação enviada! Vamos confirmar em breve.");
    setStep(4);
    setSubmitting(false);
  };

  return (
    <section className="py-20 px-4 bg-gray-50" id={section.id}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: font }}>{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white transition"
                style={{ backgroundColor: step >= n ? primaryColor : "#cbd5e1" }}
              >
                {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
              </div>
              {n < 3 && <div className="w-10 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">1. Escolha o serviço</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {services.map((s) => (
                  <button
                    key={s.title}
                    onClick={() => { setService(s.title); setStep(2); }}
                    className="text-left p-4 border-2 rounded-xl hover:shadow-md transition"
                    style={{ borderColor: service === s.title ? primaryColor : "#e5e7eb" }}
                  >
                    <p className="font-medium">{s.title}</p>
                    {s.description && <p className="text-xs text-gray-500 mt-1">{s.description}</p>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> 2. Escolha data e hora</h3>
              <p className="text-sm text-gray-500 mb-3">Serviço: <span className="font-medium text-gray-800">{service}</span></p>

              <p className="text-xs uppercase text-gray-500 mt-4 mb-2">Data</p>
              <div className="flex gap-2 flex-wrap mb-6">
                {nextDays.map((d) => (
                  <button
                    key={d.iso}
                    onClick={() => setDate(d.iso)}
                    className="px-3 py-2 rounded-lg border-2 text-xs"
                    style={{ borderColor: date === d.iso ? primaryColor : "#e5e7eb", backgroundColor: date === d.iso ? `${primaryColor}10` : "white" }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <p className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Horário</p>
              <div className="flex gap-2 flex-wrap mb-6">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setTime(s)}
                    className="px-3 py-2 rounded-lg border-2 text-sm"
                    style={{ borderColor: time === s ? primaryColor : "#e5e7eb", backgroundColor: time === s ? `${primaryColor}10` : "white" }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="text-sm text-gray-500 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Voltar</button>
                <button
                  disabled={!date || !time}
                  onClick={() => setStep(3)}
                  className="px-5 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h3 className="text-xl font-semibold mb-4">3. Confirme os seus dados</h3>
              <div className="text-sm text-gray-600 mb-4 p-3 rounded-lg bg-gray-50">
                <p><span className="font-medium">Serviço:</span> {service}</p>
                <p><span className="font-medium">Data:</span> {date} às {time}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <Input required placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input required placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="md:col-span-2" />
                <Textarea placeholder="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="md:col-span-2" />
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" onClick={() => setStep(2)} className="text-sm text-gray-500 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Voltar</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>
                  {submitting ? "A enviar..." : "Confirmar marcação"}
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: primaryColor }} />
              <h3 className="text-2xl font-semibold mb-2">Marcação recebida!</h3>
              <p className="text-gray-600">Entraremos em contacto em breve para confirmar.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
