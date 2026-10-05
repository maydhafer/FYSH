import React from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { FeatureItem } from '../types';
import { Lang } from '../translations';

interface DetailModalProps {
  item: FeatureItem | null;
  onClose: () => void;
  onOpenLogin: () => void;
  lang: Lang;
}

export function DetailModal({ item, onClose, onOpenLogin, lang }: DetailModalProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 overflow-hidden max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-[#191919] transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 pr-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase px-2.5 py-1 bg-[#F4F3F3] text-[#191919]/70 rounded font-semibold">
              {lang === 'ar' ? 'الميزة' : 'Pillar'} {item.number}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
              {item.metrics}
            </span>
          </div>
          <h2 className="text-3xl font-serif text-[#191919]">{item.title}</h2>
          <p className="text-sm font-medium text-[#191919]/70 mt-1">{item.subtitle}</p>
        </div>

        <div className="space-y-6 overflow-y-auto pr-2 flex-1">
          <div className="bg-[#F4F3F3] p-5 rounded-xl border border-gray-200/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#191919]/50 mb-2">
              {lang === 'ar' ? 'نظرة عامة' : 'Core Overview'}
            </h4>
            <p className="text-sm text-[#191919]/80 leading-relaxed">{item.description}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#191919]/50 mb-3">
              {lang === 'ar' ? 'القدرات والمميزات الأساسية' : 'Key Capabilities & Architecture'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <div className="w-5 h-5 rounded-full bg-[#191919] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm text-[#191919]/80 font-normal">{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {lang === 'ar' ? 'جاهز لربط تطبيقاتك من مكان واحد؟' : 'Ready to connect your apps from one place?'}
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenLogin();
            }}
            className="px-6 py-2.5 bg-[#191919] text-white text-sm font-medium rounded-lg hover:bg-[#191919]/90 transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>{lang === 'ar' ? 'ابدأ الآن' : 'Get Started'}</span>
            <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
