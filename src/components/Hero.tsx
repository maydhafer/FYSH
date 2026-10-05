import React from 'react';
import { ArrowRight } from 'lucide-react';
import { FeatureItem } from '../types';
import { Lang, t } from '../translations';

interface HeroProps {
  lang: Lang;
  onOpenLogin: () => void;
  onSelectFeature: (item: FeatureItem) => void;
  onExploreApps: () => void;
}

export function Hero({ lang, onOpenLogin, onSelectFeature, onExploreApps }: HeroProps) {
  const currentT = t[lang];

  return (
    <>
      <section id="hero" className="relative flex items-center justify-center min-h-screen overflow-hidden">
        {/* Pure video background with no text inside */}
      </section>

      {/* Hero content section right below the hero video with smaller text */}
      <div className="py-16 sm:py-20 px-6 sm:px-10 md:px-14 bg-white text-center border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#191919] font-normal leading-snug whitespace-pre-line">
            {lang === 'ar' ? (
              <>
                اربط <span className="text-[#8B0000]">كل تطبيقاتك</span> من مكان واحد.
              </>
            ) : (
              <>
                Connect <span className="text-[#8B0000]">all your apps</span> from one place.
              </>
            )}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#191919]/70 max-w-xl mx-auto leading-relaxed">
            {currentT.hero.subcopy}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenLogin}
              className="px-6 py-2.5 bg-[#8B0000] text-white text-sm font-medium rounded-lg hover:bg-[#660000] transition-colors duration-200 shadow-sm"
            >
              {currentT.hero.ctaPrimary}
            </button>
            <button
              onClick={onExploreApps}
              className="px-6 py-2.5 bg-white text-[#191919] border border-gray-300 text-sm font-medium rounded-lg hover:border-[#8B0000] hover:text-[#8B0000] transition-colors duration-200 shadow-sm"
            >
              {currentT.hero.ctaSecondary}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
