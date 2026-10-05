import React, { useState, useEffect } from 'react';
import { LogoMark } from './Logo';
import { Lang, t } from '../translations';
import { Globe, User } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface NavbarProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
  onOpenLogin: () => void;
  onNavigate: (sectionId: string) => void;
  isLoggedIn: boolean;
}

export function Navbar({ lang, setLang, onOpenLogin, onNavigate, isLoggedIn }: NavbarProps) {
  const currentT = t[lang];
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserPhoto(user.photoURL);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists() && docSnap.data().profileImage) {
            setUserPhoto(docSnap.data().profileImage);
          }
        } catch (e) {
          // fallback to auth photoURL
        }
      } else {
        setUserPhoto(null);
      }
    });
    return () => unsub();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    onNavigate(sectionId);
  };

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 md:px-14 py-3 sm:py-5 md:py-6 flex items-center justify-between bg-transparent border-0">
      {/* Brand logo: Official FYSH logo without background */}
      <div className="flex items-center">
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, 'hero')}
          className="flex items-center group transition-transform duration-200 hover:scale-105"
        >
          <img
            src="https://res.cloudinary.com/dd3as4ova/image/upload/v1787538576/logo_mexqm7.png"
            alt="FYSH Logo"
            className="h-12 sm:h-16 md:h-20 w-auto object-contain bg-transparent drop-shadow-md"
          />
        </a>
      </div>

      {/* Center: Navigation Links (evenly spaced) */}
      <nav className="hidden md:flex items-center justify-around flex-1 max-w-md mx-auto px-12">
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, 'hero')}
          className="text-sm text-[#191919] hover:text-[#8B0000] transition-colors duration-200 font-medium"
        >
          {currentT.nav.home}
        </a>
        <a
          href="/apps"
          onClick={(e) => handleNavClick(e, 'apps')}
          className="text-sm text-[#191919]/80 hover:text-[#8B0000] transition-colors duration-200 font-medium"
        >
          {currentT.nav.apps}
        </a>
        <a
          href="#solutions"
          onClick={(e) => handleNavClick(e, 'solutions')}
          className="text-sm text-[#191919]/80 hover:text-[#8B0000] transition-colors duration-200 font-medium"
        >
          {currentT.nav.howItWorks}
        </a>
      </nav>

      {/* Left: Language switch (letter only) + Login CTA / Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleLanguage}
          title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md text-[#191919] hover:text-[#8B0000] hover:bg-black/5 transition-all text-xs font-bold tracking-wider"
        >
          {lang === 'ar' ? 'EN' : 'عربي'}
        </button>

        {isLoggedIn ? (
          <button
            onClick={onOpenLogin}
            title={lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-[#8B0000] transition-all shadow-sm focus:outline-none flex items-center justify-center bg-gray-100"
            style={{ borderRadius: '50%' }}
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="Profile Avatar"
                className="w-full h-full object-cover rounded-full"
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#8B0000] text-white flex items-center justify-center text-xs font-bold" style={{ borderRadius: '50%' }}>
                <User className="w-4 h-4" />
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-[#8B0000] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#660000] transition-colors duration-200 shadow-sm flex items-center gap-1.5 sm:gap-2"
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{currentT.nav.login}</span>
          </button>
        )}
      </div>
    </header>
  );
}
