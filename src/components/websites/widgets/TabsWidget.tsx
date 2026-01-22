import { useState } from "react";
import { cn } from "@/lib/utils";

interface TabsWidgetProps {
  content: Record<string, string>;
  primaryColor: string;
  font: string;
  spacing?: {
    paddingTop?: string;
    paddingBottom?: string;
  };
}

export function TabsWidget({ content, primaryColor, font, spacing }: TabsWidgetProps) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [1, 2, 3, 4]
    .map(i => ({
      title: content[`tab${i}Title`],
      content: content[`tab${i}Content`],
    }))
    .filter(tab => tab.title && tab.content);

  return (
    <section 
      className="px-6 bg-gray-50"
      style={{
        paddingTop: `${spacing?.paddingTop || 64}px`,
        paddingBottom: `${spacing?.paddingBottom || 64}px`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {content.title && (
          <h2 
            className="text-3xl font-bold text-center mb-10"
            style={{ color: primaryColor, fontFamily: font }}
          >
            {content.title}
          </h2>
        )}
        
        {/* Tab Headers */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "px-6 py-3 rounded-lg font-medium transition-all",
                activeTab === idx 
                  ? "text-white shadow-lg" 
                  : "bg-white text-gray-600 hover:bg-gray-100"
              )}
              style={{
                backgroundColor: activeTab === idx ? primaryColor : undefined,
                fontFamily: font,
              }}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl p-8 shadow-sm min-h-[200px]">
          {tabs.map((tab, idx) => (
            <div
              key={idx}
              className={cn(
                "transition-all duration-300",
                activeTab === idx 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-4 hidden"
              )}
            >
              <p 
                className="text-gray-600 leading-relaxed"
                style={{ fontFamily: font }}
              >
                {tab.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
