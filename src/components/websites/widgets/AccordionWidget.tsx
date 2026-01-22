import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionWidgetProps {
  content: Record<string, string>;
  primaryColor: string;
  font: string;
  spacing?: {
    paddingTop?: string;
    paddingBottom?: string;
  };
}

export function AccordionWidget({ content, primaryColor, font, spacing }: AccordionWidgetProps) {
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const items = [1, 2, 3, 4, 5]
    .map(i => ({
      title: content[`item${i}Title`],
      content: content[`item${i}Content`],
    }))
    .filter(item => item.title && item.content);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section 
      className="px-6 bg-white"
      style={{
        paddingTop: `${spacing?.paddingTop || 64}px`,
        paddingBottom: `${spacing?.paddingBottom || 64}px`,
      }}
    >
      <div className="max-w-3xl mx-auto">
        {content.title && (
          <h2 
            className="text-3xl font-bold text-center mb-10"
            style={{ color: primaryColor, fontFamily: font }}
          >
            {content.title}
          </h2>
        )}
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div 
              key={idx}
              className="border rounded-xl overflow-hidden transition-all"
              style={{ borderColor: openItems.includes(idx) ? primaryColor : undefined }}
            >
              <button
                onClick={() => toggleItem(idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span 
                  className="font-medium"
                  style={{ fontFamily: font }}
                >
                  {item.title}
                </span>
                <ChevronDown 
                  className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    openItems.includes(idx) && "rotate-180"
                  )}
                  style={{ color: primaryColor }}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  openItems.includes(idx) ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p 
                    className="p-4 pt-0 text-gray-600"
                    style={{ fontFamily: font }}
                  >
                    {item.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
