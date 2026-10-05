import React, { useEffect, useRef, useState } from 'react';
import { auth, db, signInWithGoogle, signInWithGoogleRedirect, checkRedirectResult, signInWithEmail, signUpWithEmail, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { X, User, LogOut, Check, Camera, AlertCircle } from 'lucide-react';
import { Lang, t } from '../translations';

interface SignalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
}

export function SignalLoginModal({ isOpen, onClose, lang, isLoggedIn, setIsLoggedIn }: SignalLoginModalProps) {
  const currentT = t[lang];
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Email / Password states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // User Profile State (for when logged in)
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
        setDisplayName(user.displayName || user.email?.split('@')[0] || (lang === 'ar' ? 'مستخدم فيش' : 'FYSH User'));
        if (user.photoURL) {
          setProfileImage(user.photoURL);
        }
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
              email: user.email || 'guest@fysh.ai',
              displayName: user.displayName || (lang === 'ar' ? 'مستخدم فيش' : 'FYSH User'),
              bio: '',
              profileImage: user.photoURL || '',
              createdAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (error: any) {
          console.warn("User profile sync note:", error?.message || error);
          if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          }
        }
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, [lang, setIsLoggedIn]);

  useEffect(() => {
    if (!isOpen || isLoggedIn) return;
    const handleLayout = () => {
      document.body.classList.remove('tabport', 'stacked');
    };
    handleLayout();
  }, [isOpen, isLoggedIn]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        setFirebaseUser(user);
        setIsLoggedIn(true);
        setDisplayName(user.displayName || user.email?.split('@')[0] || (lang === 'ar' ? 'مستخدم فيش' : 'FYSH User'));
        if (user.photoURL) {
          setProfileImage(user.photoURL);
        }
        onClose();
      }
    } catch (error: any) {
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
      if (error?.code === 'auth/popup-closed-by-user') {
        // User voluntarily closed popup
      } else if (error?.code === 'auth/api-key-not-valid') {
        setErrorMsg(
          lang === 'ar'
            ? 'مفتاح Firebase API غير صالح أو لم يتم تفعيل Identity Toolkit API في مشروع Firebase/Google Cloud. يرجى مراجعة إعدادات Firebase Authentication.'
            : 'Firebase API key is invalid or Identity Toolkit is not enabled. Please enable Authentication in Firebase Console.'
        );
      } else if (error?.code === 'auth/unauthorized-domain') {
        setErrorMsg(
          lang === 'ar'
            ? `نطاق التطبيق الحالي (${currentDomain}) غير مضاف في قائمة النطاقات المصرّح بها (Authorized Domains) في Firebase Authentication. يرجى إضافته في لوحة تحكم Firebase > Authentication > Settings > Authorized domains، أو استخدام زر الدخول التجريبي أدناه.`
            : `Domain (${currentDomain}) is not authorized in Firebase Console > Authentication > Settings > Authorized domains. Alternatively, use Demo Mode below.`
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg(null);
    setIsLoading(true);
    try {
      let user;
      if (isSignUp) {
        user = await signUpWithEmail(email, password);
      } else {
        user = await signInWithEmail(email, password);
      }
      if (user) {
        setFirebaseUser(user);
        setIsLoggedIn(true);
        onClose();
      }
    } catch (error: any) {
      setErrorMsg(error?.message || (lang === 'ar' ? 'فشل المصادقة بالبريد الإلكتروني وكلمة المرور' : 'Email authentication failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
      onClose();
    }, 500);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
    } catch (error) {
      console.error(error);
      setIsLoggedIn(false);
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
    const currentUser = firebaseUser || auth.currentUser;
    if (!currentUser) {
      setErrorMsg(lang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please sign in first');
      return;
    }
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName,
        bio: userBio,
        profileImage,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
      setErrorMsg(lang === 'ar' ? 'فشل حفظ الملف الشخصي' : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      {/* If logged in, show the profile control panel card */}
      {isLoggedIn ? (
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 overflow-hidden max-h-[90vh] flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-[#191919] transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>

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
            <div className="flex flex-col items-center justify-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center shadow-sm" style={{ borderRadius: '50%' }}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" style={{ borderRadius: '50%' }}>
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">{lang === 'ar' ? 'تغيير الصورة' : 'Upload'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <span className="text-xs text-gray-500 mt-2">{lang === 'ar' ? 'انقر لرفع صورة من جهازك (دائرية تماماً)' : 'Click to upload profile photo'}</span>
            </div>

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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#191919]/60 mb-2">
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                type="email"
                disabled
                value={firebaseUser?.email || 'guest@fysh.ai'}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 cursor-not-allowed"
              />
            </div>

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
      ) : (
        /* Horizontal Rectangle Compact Centered Login Card */
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col lg:flex-row max-h-[88vh]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 text-gray-500 hover:text-black bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Login Options (Google & Email/Password) */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[88vh]">
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-serif text-[#2c3343] tracking-tight">
                  {lang === 'ar' ? 'مرحباً بك في فيش' : 'Welcome to FYSH'}
                </h1>
                <p className="text-xs sm:text-sm text-[#797979] mt-1 leading-relaxed">
                  {lang === 'ar' ? 'سجّل الدخول للمتابعة إلى منصة التكامل والوكلاء الذكيين.' : 'Sign in to continue to toolkits and AI workflows.'}
                </p>
              </div>

              {/* Google Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className="w-full h-11 border-[1.5px] border-gray-300 rounded-full bg-white shadow-xs flex items-center justify-center gap-2.5 cursor-pointer hover:bg-gray-50 hover:shadow-sm active:scale-[0.99] transition-all disabled:opacity-60 text-xs sm:text-sm font-medium text-[#232424]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.61l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.44-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.46-10.41l-7.97 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>{isLoading && !errorMsg ? (lang === 'ar' ? 'جاري الاتصال...' : 'Connecting...') : (lang === 'ar' ? 'المتابعة باستخدام Google' : 'Continue with Google')}</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-[11px] uppercase tracking-wider">{lang === 'ar' ? 'أو البريد الإلكتروني' : 'Or Email'}</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-xl bg-[#8B0000] text-white text-xs sm:text-sm font-medium hover:bg-[#660000] transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSignUp ? (lang === 'ar' ? 'إنشاء حساب جديد' : 'Sign Up') : (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-[#8B0000] hover:underline font-medium"
                  >
                    {isSignUp ? (lang === 'ar' ? 'لديك حساب؟ تسجيل الدخول' : 'Already have an account? Sign in') : (lang === 'ar' ? 'ليس لديك حساب؟ إنشاء حساب' : "Don't have an account? Sign up")}
                  </button>
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="text-gray-600 hover:text-black font-medium"
                  >
                    {lang === 'ar' ? '🚀 دخول تجريبي' : '🚀 Demo Login'}
                  </button>
                </div>
              </form>

              {errorMsg && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-tight">{errorMsg}</p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-center text-gray-400 pt-3">
              {lang === 'ar' ? 'بالاستمرار، أنت توافق على شروط الخدمة وسياسة الخصوصية.' : 'By continuing, you agree to Terms & Privacy Policy.'}
            </p>
          </div>

          {/* Right Column: Existing Video */}
          <div className="w-full lg:w-1/2 relative bg-[#111] overflow-hidden min-h-[220px] lg:min-h-[420px] flex items-center justify-center">
            <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline preload="auto">
              <source src="https://res.cloudinary.com/dd3as4ova/video/upload/v1787375509/Applications_emerging_from_FYSH___202608211518_r3xeec.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            
            <div className="relative z-10 p-6 flex flex-col justify-end h-full w-full text-white">
              <div className="inline-flex items-center h-7 px-3 rounded-full bg-white/15 backdrop-blur-md text-white whitespace-nowrap w-max mb-2">
                <span className="text-[11px] font-medium">{lang === 'ar' ? 'منصة متكاملة' : 'Integrated Platform'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif tracking-tight">
                {lang === 'ar' ? 'اكتشف إشاراتك وحوّلها إلى قرارات فورية' : 'Find Signal to Action Instantly'}
              </h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

