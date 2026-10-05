import React, { useState, useEffect } from 'react';
import { X, User, LogOut, Upload, Check, Camera } from 'lucide-react';
import { Lang, t } from '../translations';
import { auth, db, googleProvider, signInWithGoogle, handleFirestoreError, OperationType } from '../lib/firebase';
import { signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
}

export function LoginModal({ isOpen, onClose, lang, isLoggedIn, setIsLoggedIn }: LoginModalProps) {
  const currentT = t[lang];
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // User Profile State
  const [displayName, setDisplayName] = useState('');
  const [userBio, setUserBio] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsLoggedIn(true);
        setDisplayName(user.displayName || user.email?.split('@')[0] || 'مستخدم فيش');
        
        // Fetch user profile from Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.displayName) setDisplayName(data.displayName);
            if (data.bio) setUserBio(data.bio);
            if (data.profileImage) setProfileImage(data.profileImage);
          } else {
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'مستخدم فيش',
              bio: '',
              profileImage: user.photoURL || '',
              createdAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        setFirebaseUser(user);
        setIsLoggedIn(true);
        setDisplayName(user.displayName || user.email?.split('@')[0] || (lang === 'ar' ? 'مستخدم فيش' : 'FYSH User'));
        if (user.photoURL) {
          setProfileImage(user.photoURL);
        }
      }
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        // User closed popup
      } else if (error?.code === 'auth/api-key-not-valid') {
        setErrorMsg(
          lang === 'ar'
            ? 'مفتاح Firebase API غير صالح أو لم يتم تفعيل Identity Toolkit API في مشروع Firebase. يرجى مراجعة إعدادات Firebase Authentication.'
            : 'Firebase API key is invalid or Identity Toolkit is not enabled. Please enable Authentication in Firebase Console.'
        );
      } else if (error?.code === 'auth/unauthorized-domain') {
        setErrorMsg(
          lang === 'ar'
            ? 'نطاق التطبيق غير مضاف في قائمة النطاقات المصرّح بها (Authorized Domains) في Firebase Authentication.'
            : 'This domain is not in the Firebase Authorized Domains list in Firebase Console.'
        );
      } else if (error?.code === 'auth/configuration-not-found') {
        setErrorMsg(
          lang === 'ar'
            ? 'خدمة Firebase Authentication لم يتم تفعيلها في مشروع Firebase بعد. يرجى الدخول إلى Firebase Console > Build > Authentication والضغط على "Get Started" وتفعيل موفر Google.'
            : 'Firebase Authentication is not enabled yet in your Firebase Project. Please go to Firebase Console > Build > Authentication, click "Get Started", and enable Google sign-in.'
        );
      } else if (error?.code === 'auth/operation-not-allowed') {
        setErrorMsg(
          lang === 'ar'
            ? 'موفر تسجيل الدخول عبر Google غير مفعّل في لوحة تحكم Firebase (Authentication > Sign-in method).'
            : 'Google Sign-In is not enabled in Firebase Console (Authentication > Sign-in method).'
        );
      } else {
        setErrorMsg(error?.message || (lang === 'ar' ? 'فشل تسجيل الدخول عبر قوقل' : 'Google authentication failed'));
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        displayName,
        bio: userBio,
        profileImage,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
      setErrorMsg('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 overflow-hidden max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-[#191919] transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        {!isLoggedIn ? (
          <div>
            <div className="mb-6">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
                {lang === 'ar' ? 'بوابة الدخول' : 'Authentication'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#191919] mt-1">{currentT.login.title}</h2>
              <p className="text-sm text-[#191919]/70 mt-2">
                {currentT.login.subtitle}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3.5 px-4 border border-gray-300 rounded-xl text-sm font-medium text-[#191919] hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 shadow-xs"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.19v3.15C3.18 21.35 7.28 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.19C.43 8.14 0 9.87 0 12s.43 3.86 1.19 5.39l4.08-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.28 0 3.18 2.65 1.19 6.61l4.08 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
                </svg>
                <span>{currentT.login.google}</span>
              </button>

              <p className="text-center text-xs text-gray-500 pt-2">
                {lang === 'ar' 
                  ? 'تسجيل دخول سريع ومباشر بحساب جوجل المعتمد' 
                  : 'Fast and secure sign-in with your Google account'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
                  {lang === 'ar' ? 'لوحة التحكم الشخصية' : 'User Control Panel'}
                </span>
                <h2 className="text-2xl font-serif text-[#191919] mt-0.5">
                  {lang === 'ar' ? 'إدارة الملف الشخصي' : 'Profile Management'}
                </h2>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{currentT.login.logout}</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto pr-1 space-y-6">
              {/* Profile Image Uploader */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center shadow-sm">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">{lang === 'ar' ? 'تغيير الصورة' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                <span className="text-xs text-gray-500 mt-2">{lang === 'ar' ? 'انقر لرفع صورة من جهازك' : 'Click to upload from device'}</span>
              </div>

              {/* Name field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#191919]/60 mb-2">
                  {lang === 'ar' ? 'الاسم' : 'Display Name'}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={lang === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
                />
              </div>

              {/* Email field (readonly) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#191919]/60 mb-2">
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  disabled
                  value={firebaseUser?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Bio / Info field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#191919]/60 mb-2">
                  {lang === 'ar' ? 'نبذة / بيانات إضافية' : 'Bio / Additional Info'}
                </label>
                <textarea
                  rows={3}
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  placeholder={lang === 'ar' ? 'أدخل معلوماتك الشخصية أو نبذة...' : 'Enter your bio or details...'}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] resize-none"
                />
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تم حفظ التغييرات بنجاح في السحابة.' : 'Changes saved successfully.'}</span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 text-[#191919] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {currentT.login.close}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#8B0000] text-white text-sm font-medium rounded-lg hover:bg-[#660000] transition-colors disabled:opacity-50"
                >
                  {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
