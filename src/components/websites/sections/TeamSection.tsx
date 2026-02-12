import { User } from "lucide-react";
import { SectionProps } from "./types";

export function TeamSection({ section, primaryColor, font, variant = 1 }: SectionProps) {
  const c = section.content;

  const members = [1, 2, 3, 4].map(i => ({
    name: c[`member${i}Name`],
    role: c[`member${i}Role`],
    image: c[`member${i}Image`],
    bio: c[`member${i}Bio`],
  })).filter(m => m.name);

  const renderAvatar = (m: typeof members[0], size = "w-24 h-24") => (
    <div className={`${size} rounded-full overflow-hidden flex items-center justify-center`} style={{ backgroundColor: `${primaryColor}20` }}>
      {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" /> : <User className="w-12 h-12" style={{ color: primaryColor }} />}
    </div>
  );

  // Variant 1: Classic grid cards
  if (variant === 1) {
    return (
      <section id={`section-${section.id}`} className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
          {c.subtitle && <p className="text-gray-600 text-center mb-10" style={{ fontFamily: font }}>{c.subtitle}</p>}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((m, i) => (
              <div key={i} className="bg-white p-6 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="mx-auto mb-4">{renderAvatar(m)}</div>
                <h3 className="font-semibold text-lg" style={{ fontFamily: font }}>{m.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{m.role}</p>
                {m.bio && <p className="text-sm text-gray-600">{m.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Variant 2: Horizontal cards
  return (
    <section id={`section-${section.id}`} className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
        {c.subtitle && <p className="text-gray-600 text-center mb-12" style={{ fontFamily: font }}>{c.subtitle}</p>}
        <div className="space-y-6">
          {members.map((m, i) => (
            <div key={i} className="flex items-center gap-6 p-6 rounded-2xl border hover:shadow-md transition-shadow bg-white">
              {renderAvatar(m, "w-16 h-16")}
              <div>
                <h3 className="font-semibold text-lg" style={{ fontFamily: font }}>{m.name}</h3>
                <p className="text-sm mb-1" style={{ color: primaryColor }}>{m.role}</p>
                {m.bio && <p className="text-sm text-gray-600">{m.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
