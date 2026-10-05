import React, { useState, useEffect } from 'react';
import { BoomerangVideoBg } from './components/BoomerangVideoBg';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Sections } from './components/Sections';
import { SignalLoginModal } from './components/SignalLoginModal';
import { DetailModal } from './components/DetailModal';
import { AppsPage } from './components/AppsPage';
import { FeatureItem } from './types';
import { Lang } from './translations';
import { checkRedirectResult } from './lib/firebase';

export default function App() {
  const [lang, setLang] = useState<Lang>('ar');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);
  
  // Standalone page routing: 'home' | 'apps'
  const [currentRoute, setCurrentRoute] = useState<'home' | 'apps'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/apps')) {
      return 'apps';
    }
    return 'home';
  });

  useEffect(() => {
    checkRedirectResult().then((user) => {
      if (user) {
        setIsLoggedIn(true);
      }
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/apps')) {
        setCurrentRoute('apps');
      } else {
        setCurrentRoute('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'apps') {
      setCurrentRoute('apps');
      window.history.pushState(null, '', '/apps');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentRoute === 'apps') {
      setCurrentRoute('home');
      window.history.pushState(null, '', '/');
      setTimeout(() => {
        if (sectionId === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreApps = () => {
    setCurrentRoute('apps');
    window.history.pushState(null, '', '/apps');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setCurrentRoute('home');
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render standalone Apps page if on /apps route
  if (currentRoute === 'apps') {
    return (
      <>
        <AppsPage
          lang={lang}
          setLang={setLang}
          onNavigateHome={handleNavigateHome}
          onOpenLogin={() => setIsLoginOpen(true)}
          isLoggedIn={isLoggedIn}
        />
        <SignalLoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          lang={lang}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden selection:bg-[#191919] selection:text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Fixed Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        onOpenLogin={() => setIsLoginOpen(true)}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
      />

      {/* Hero section with Boomerang video background */}
      <div className="relative h-screen w-full overflow-hidden bg-white">
        <BoomerangVideoBg />
        <Hero
          lang={lang}
          onOpenLogin={() => setIsLoginOpen(true)}
          onSelectFeature={(item) => setSelectedFeature(item)}
          onExploreApps={handleExploreApps}
        />
      </div>

      {/* Additional Marketing Sections */}
      <Sections
        lang={lang}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Modals */}
      <SignalLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        lang={lang}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <DetailModal
        item={selectedFeature}
        onClose={() => setSelectedFeature(null)}
        onOpenLogin={() => setIsLoginOpen(true)}
        lang={lang}
      />
    </div>
  );
}
