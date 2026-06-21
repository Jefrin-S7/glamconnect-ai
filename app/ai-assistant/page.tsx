import { Sparkles } from "lucide-react";
import { BeautyAssistant } from "@/components/ai-assistant/beauty-assistant";

export default function AIAssistantPage() {
  return (
    <main className="min-h-screen bg-ink">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-violet-light">
            <Sparkles size={14} /> AI Beauty Assistant
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-paper mt-4">
            Tell us about your hair. <span className="gradient-text">Get matched in seconds.</span>
          </h1>
          <p className="text-paper/65 mt-3">
            Describe your hair, face shape, or skin — we&apos;ll suggest styles and match you
            to real salons on GlamConnect AI.
          </p>
        </div>

        <div className="mt-10">
          <BeautyAssistant />
        </div>
      </div>
    </main>
  );
}
