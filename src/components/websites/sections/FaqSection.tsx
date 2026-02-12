import { SectionProps } from "./types";

export function FaqSection({ section, primaryColor, font, variant = 1 }: SectionProps) {
  const c = section.content;

  const faqs = [1, 2, 3, 4, 5].map(i => ({
    question: c[`faq${i}Question`],
    answer: c[`faq${i}Answer`],
  })).filter(f => f.question);

  return (
    <section id={`section-${section.id}`} className="py-16 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <h3 className="font-medium mb-2" style={{ fontFamily: font }}>{f.question}</h3>
              <p className="text-gray-600 text-sm" style={{ fontFamily: font }}>{f.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
