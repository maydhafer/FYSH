import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Check, 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  X, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Globe, 
  User, 
  SlidersHorizontal,
  Layers,
  Sparkles
} from 'lucide-react';
import { Lang, t } from '../translations';
import { ALL_COMPOSIO_APPS, APPS_CATEGORIES, AppCategory, AppItem } from '../data/appsData';
import { getOrCreateStableFishUserId } from '../lib/fishUser';

interface AppsPageProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
  onNavigateHome: () => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
}

interface ConnectedAccount {
  id: string;
  toolkit?: string;
  app?: string;
  name?: string;
  status: string;
  createdAt?: string;
}

interface CustomMcpItem {
  id: string;
  name: string;
  url: string;
  category: string;
  createdAt: string;
}

export function AppsPage({ lang, setLang, onNavigateHome, onOpenLogin, isLoggedIn }: AppsPageProps) {
  const currentT = t[lang];
  const [appsList, setAppsList] = useState<AppItem[]>(ALL_COMPOSIO_APPS);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [customMcps, setCustomMcps] = useState<CustomMcpItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'connected'>('all');
  
  // Connection state machine per app ID: { [id: string]: 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'FAILED' }
  const [connectionStates, setConnectionStates] = useState<Record<string, 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'FAILED'>>({});
  const [errorMsg, setErrorMsg] = useState<{ id?: string; message: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Modal states
  const [isAddMcpOpen, setIsAddMcpOpen] = useState(false);
  const [mcpName, setMcpName] = useState('');
  const [mcpUrl, setMcpUrl] = useState('');
  const [mcpCategory, setMcpCategory] = useState('Developer & Engineering');



  // Combine built-in apps with custom MCPs
  const combinedApps: AppItem[] = useMemo(() => {
    const customAsAppItems: AppItem[] = customMcps.map(m => ({
      id: m.id,
      name: m.name,
      category: m.category,
      logo: 'https://raw.githubusercontent.com/ComposioHQ/composio/master/docs/public/composio-logo.png',
      verified: false,
      isBuiltInActive: true,
      description: `Custom MCP Server: ${m.url}`,
    }));
    return [...appsList, ...customAsAppItems];
  }, [appsList, customMcps]);

  // Load dynamic catalog from Composio v3.1 backend endpoint
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      setIsLoadingCatalog(true);
      try {
        const res = await fetch('/api/composio/toolkits');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.toolkits && Array.isArray(data.toolkits) && data.toolkits.length > 0) {
            const mapped: AppItem[] = data.toolkits.map((t: any) => ({
              id: t.slug || t.id,
              name: t.name || t.slug,
              category: t.category || 'Developer & Engineering',
              logo: t.logo || `https://logos.composio.dev/api/${t.slug || t.id}`,
              verified: t.verified ?? true,
              composioSlug: t.slug || t.id,
              description: t.description || `${t.name} integration via Composio MCP.`
            }));

            // Merge with local ALL_COMPOSIO_APPS to ensure popular items and logos are preserved
            const existingSlugs = new Set(mapped.map(m => m.id.toLowerCase().replace(/[-_]/g, '')));
            const extraLocal = ALL_COMPOSIO_APPS.filter(localApp => {
              const cleanLocal = localApp.id.toLowerCase().replace(/[-_]/g, '');
              return !existingSlugs.has(cleanLocal);
            });

            setAppsList([...mapped, ...extraLocal]);
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote Composio toolkits, using built-in catalog:", err);
      } finally {
        if (isMounted) setIsLoadingCatalog(false);
      }
    }
    loadCatalog();
    return () => { isMounted = false; };
  }, []);

  // Load custom MCPs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fysh_custom_mcps');
      if (saved) {
        setCustomMcps(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load custom MCPs", e);
    }
  }, []);

  // Fetch connected accounts from Composio
  const fetchConnectedAccounts = useCallback(async () => {
    try {
      const fishUserId = await getOrCreateStableFishUserId();
      const res = await fetch(`/api/composio/connectedAccounts?fishUserId=${encodeURIComponent(fishUserId)}`);
      const data = await res.json();
      if (data.accounts && Array.isArray(data.accounts)) {
        setConnectedAccounts(data.accounts);
      }
    } catch (err) {
      console.warn("Failed to fetch connected accounts", err);
    }
  }, []);

  useEffect(() => {
    fetchConnectedAccounts();
  }, [fetchConnectedAccounts]);

  // Listen to postMessage from OAuth popup callback and focus/visibility events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'COMPOSIO_CONNECTED') {
        fetchConnectedAccounts();
        setConnectionStates({});
        setSuccessMsg(lang === 'ar' ? 'تم ربط التطبيق بنجاح!' : 'Application connected successfully!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchConnectedAccounts();
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', fetchConnectedAccounts);
    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', fetchConnectedAccounts);
    };
  }, [fetchConnectedAccounts, lang]);

  // Normalize app ID for comparison
  const normalizeAppId = (id: string) => (id || '').toLowerCase().replace(/[-_]/g, '');

  const getConnectedAccount = (app: AppItem) => {
    const normId = normalizeAppId(app.id);
    const normSlug = normalizeAppId(app.composioSlug || app.id);
    return connectedAccounts.find(acc => {
      const accToolkit = normalizeAppId(acc.toolkit || acc.app || '');
      const accId = normalizeAppId(acc.id || '');
      const status = (acc.status || '').toUpperCase();
      const isActive = status === 'ACTIVE' || status === 'CONNECTED';
      
      const isMatch = (
        accToolkit === normSlug || 
        accToolkit === normId || 
        accId.includes(normSlug) || 
        (accToolkit && normSlug.includes(accToolkit))
      );

      return isMatch && isActive;
    });
  };

  // Connect Handler using backend flow with Auth Config resolution and active account verification
  const handleConnect = async (app: AppItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const appKey = app.id;

    // State machine: Set to CONNECTING
    setConnectionStates(prev => ({ ...prev, [appKey]: 'CONNECTING' }));

    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // Open popup synchronously during user gesture to prevent popup blockers
    let popup: Window | null = null;
    try {
      popup = window.open(
        'about:blank', 
        `Connect_${app.name.replace(/\s+/g, '_')}`, 
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
      );
      if (popup && popup.document) {
        popup.document.write(`
          <!DOCTYPE html>
          <html>
            <head><title>Connecting to ${app.name}...</title></head>
            <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#fafafa;text-align:center;">
              <div>
                <div style="width:36px;height:36px;border:3px solid #e5e7eb;border-top-color:#191919;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px auto;"></div>
                <h3 style="margin:0 0 8px 0;font-size:16px;color:#111;">Connecting to ${app.name}...</h3>
                <p style="margin:0;font-size:13px;color:#666;">Opening secure authorization window...</p>
              </div>
              <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            </body>
          </html>
        `);
      }
    } catch (_) {}

    try {
      const fishUserId = await getOrCreateStableFishUserId();
      const toolkitSlug = app.composioSlug || app.id;

      // 1. Call server /api/composio/connect
      const res = await fetch('/api/composio/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          toolkitSlug,
          fishUserId,
          callbackUrl: `${window.location.origin}/api/composio/callback`
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.redirectUrl) {
        try { if (popup && !popup.closed) popup.close(); } catch (_) {}
        setConnectionStates(prev => ({ ...prev, [appKey]: 'FAILED' }));
        setErrorMsg({
          id: app.id,
          message: data.error || (lang === 'ar' ? 'فشل بدء الاتصال مع منصة التكامل. يرجى إعادة المحاولة.' : 'Failed to initiate connection. Please try again.')
        });
        return;
      }

      // 2. Direct popup window to Composio Connect redirectUrl
      if (popup && !popup.closed) {
        popup.location.href = data.redirectUrl;
      } else {
        const fallback = window.open(data.redirectUrl, '_blank');
        if (!fallback) {
          window.location.href = data.redirectUrl;
        }
      }

      const targetAccountId = data.connectedAccountId;

      // 3. Poll verify endpoint to check when status becomes ACTIVE
      let attempts = 0;
      const maxAttempts = 30; // 30 x 2s = 60s
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const verifyRes = await fetch('/api/composio/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fishUserId,
              toolkitSlug,
              connectedAccountId: targetAccountId
            })
          });

          const verifyData = await verifyRes.json();

          if (verifyData.active || verifyData.status === 'ACTIVE' || verifyData.status === 'CONNECTED') {
            clearInterval(pollInterval);
            setConnectionStates(prev => ({ ...prev, [appKey]: 'CONNECTED' }));
            await fetchConnectedAccounts();
            setSuccessMsg(lang === 'ar' ? `تم ربط ${app.name} بنجاح!` : `${app.name} connected successfully!`);
            setTimeout(() => setSuccessMsg(null), 4000);
            try { if (popup && !popup.closed) popup.close(); } catch (_) {}
            return;
          }

          if (popup && popup.closed) {
            // Popup closed by user, do final verification check
            const finalRes = await fetch('/api/composio/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fishUserId, toolkitSlug, connectedAccountId: targetAccountId })
            });
            const finalData = await finalRes.json();
            clearInterval(pollInterval);
            await fetchConnectedAccounts();
            if (finalData.active || finalData.status === 'ACTIVE' || finalData.status === 'CONNECTED') {
              setConnectionStates(prev => ({ ...prev, [appKey]: 'CONNECTED' }));
              setSuccessMsg(lang === 'ar' ? `تم ربط ${app.name} بنجاح!` : `${app.name} connected successfully!`);
              setTimeout(() => setSuccessMsg(null), 4000);
            } else {
              setConnectionStates(prev => ({ ...prev, [appKey]: 'IDLE' }));
            }
            return;
          }

          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            await fetchConnectedAccounts();
            setConnectionStates(prev => ({ ...prev, [appKey]: 'IDLE' }));
          }
        } catch (e) {
          console.warn("Poll verification step error:", e);
        }
      }, 2000);

    } catch (err: any) {
      try { if (popup && !popup.closed) popup.close(); } catch (_) {}
      setConnectionStates(prev => ({ ...prev, [appKey]: 'FAILED' }));
      setErrorMsg({
        id: app.id,
        message: err.message || (lang === 'ar' ? 'حدث خطأ أثناء الاتصال.' : 'Error during connection.')
      });
    }
  };

  // Disconnect Handler
  const handleDisconnect = async (app: AppItem, accountId: string) => {
    try {
      const fishUserId = await getOrCreateStableFishUserId();
      const toolkitSlug = app.composioSlug || app.id;

      await fetch('/api/composio/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectedAccountId: accountId,
          fishUserId,
          toolkitSlug
        })
      });

      setConnectionStates(prev => ({ ...prev, [app.id]: 'IDLE' }));
      await fetchConnectedAccounts();
      setSuccessMsg(lang === 'ar' ? `تم إلغاء ربط ${app.name}` : `Disconnected ${app.name}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg({ id: app.id, message: err.message || 'Failed to disconnect' });
    }
  };



  // Add Custom MCP Handler
  const handleSaveCustomMcp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mcpName.trim() || !mcpUrl.trim()) return;

    const newMcp: CustomMcpItem = {
      id: `custom_${Date.now()}`,
      name: mcpName.trim(),
      url: mcpUrl.trim(),
      category: mcpCategory,
      createdAt: new Date().toISOString()
    };

    const updated = [newMcp, ...customMcps];
    setCustomMcps(updated);
    try {
      localStorage.setItem('fysh_custom_mcps', JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage error", e);
    }

    setMcpName('');
    setMcpUrl('');
    setIsAddMcpOpen(false);
    setSuccessMsg(lang === 'ar' ? 'تمت إضافة خادم MCP المخصص بنجاح!' : 'Custom MCP server added successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Filtering using combinedApps & getConnectedAccount
  const filteredApps = useMemo(() => {
    return combinedApps.filter(app => {
      const matchesSearch = 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;

      const isConn = app.isBuiltInActive || !!getConnectedAccount(app);
      const matchesTab = activeTab === 'all' || (activeTab === 'connected' && isConn);

      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [combinedApps, searchQuery, selectedCategory, activeTab, connectedAccounts]);

  const connectedCount = useMemo(() => {
    return combinedApps.filter(app => app.isBuiltInActive || !!getConnectedAccount(app)).length;
  }, [combinedApps, connectedAccounts]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#191919] selection:bg-[#191919] selection:text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Standalone Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 md:px-12 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-[#8B0000] transition-colors group cursor-pointer"
            title={lang === 'ar' ? 'الرجوع إلى الصفحة الرئيسية' : 'Return to Home'}
          >
            {lang === 'ar' ? <ArrowRight className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> : <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />}
            <span>{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </button>

          <div className="h-4 w-px bg-gray-300 mx-1 hidden sm:block" />

          <a
            href="/"
            onClick={(e) => { e.preventDefault(); onNavigateHome(); }}
            className="flex items-center"
          >
            <img
              src="https://res.cloudinary.com/dd3as4ova/image/upload/v1787538576/logo_mexqm7.png"
              alt="FYSH Logo"
              className="h-10 sm:h-12 w-auto object-contain bg-transparent"
            />
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="px-2.5 py-1.5 rounded-md text-[#191919] hover:bg-gray-100 transition-colors text-xs font-bold"
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          <button
            onClick={onOpenLogin}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#8B0000] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#660000] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>{isLoggedIn ? (lang === 'ar' ? 'حسابي' : 'My Account') : (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')}</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        {/* Banner Alert Messages */}
        {errorMsg && (
          <div className="mb-5 p-3.5 sm:p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-start justify-between shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{errorMsg.message}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center justify-between shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header Bar Matching Screenshot Exactly */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          {/* Left: Heading + Tabs */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Apps
            </h1>

            {/* Filter Pills: All / Connected */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200/80">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('connected')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'connected'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>Connected</span>
                {connectedCount > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {connectedCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Center: Real Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Actions matching screenshot */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddMcpOpen(true)}
              className="px-3.5 py-2 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Custom MCP</span>
            </button>

            <a
              href="mailto:may@wakeli.online?subject=Request%20New%20App%20Integration"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <span>Request App</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200/80 pt-1">
          {APPS_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white shadow-2xs'
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200/70'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Applications Circular Grid */}
        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-2xs max-w-lg mx-auto mt-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              {lang === 'ar' ? 'لم يتم العثور على تطبيقات' : 'No applications found'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'ar' 
                ? 'جرب البحث باسم تطبيق مختلف أو اختر تصنيفاً آخر.' 
                : 'Try searching with another keyword or reset the category filter.'}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setActiveTab('all'); }}
              className="mt-4 px-4 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-9 justify-items-center bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-2xs">
            {filteredApps.map((app) => {
              const connectedAcc = getConnectedAccount(app);
              const isConnected = !!connectedAcc;
              const appState = connectionStates[app.id] || (isConnected ? 'CONNECTED' : 'IDLE');
              const isConnecting = appState === 'CONNECTING';
              const isBuiltIn = !!app.isBuiltInActive;

              return (
                <div
                  key={app.id}
                  id={`app-item-${app.id}`}
                  className="flex flex-col items-center group select-none relative"
                >
                  {/* Circular Application Icon Container */}
                  <div className="relative">
                    <div
                      onClick={() => {
                        if (isConnecting) return;
                        if (!isConnected && !isBuiltIn) {
                          handleConnect(app);
                        }
                      }}
                      title={app.name}
                      className={`w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-white border shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center justify-center p-3 sm:p-3.5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] cursor-pointer ${
                        isConnected || isBuiltIn
                          ? 'border-emerald-400 ring-2 ring-emerald-400/20'
                          : 'border-gray-200/90 group-hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={app.logo}
                        alt={app.name}
                        className="w-full h-full object-contain pointer-events-none drop-shadow-2xs select-none"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Circular Action Badge (+ / − / Check) */}
                    {isBuiltIn ? (
                      <div
                        className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold leading-none shadow-md border-2 border-white bg-emerald-600 text-white"
                        title="Active Built-in MCP"
                      >
                        ✓
                      </div>
                    ) : (
                      <button
                        type="button"
                        aria-label={isConnected ? `Disconnect ${app.name}` : `Connect ${app.name}`}
                        disabled={isConnecting}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isConnected && connectedAcc) {
                            handleDisconnect(app, connectedAcc.id);
                          } else {
                            handleConnect(app);
                          }
                        }}
                        className={`absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold leading-none shadow-md border-2 border-white transition-all duration-200 hover:scale-125 active:scale-95 disabled:opacity-60 cursor-pointer ${
                          isConnected
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-[#191919] hover:bg-[#8B0000] text-white'
                        }`}
                        title={isConnected ? (lang === 'ar' ? 'فصل التطبيق' : 'Disconnect') : (lang === 'ar' ? 'ربط التطبيق' : 'Connect')}
                      >
                        {isConnecting ? (
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : isConnected ? (
                          <span>−</span>
                        ) : (
                          <span>+</span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Application Name Label (in English official title) */}
                  <span className="text-xs font-medium text-[#191919] mt-2 text-center truncate max-w-[72px] sm:max-w-[84px] group-hover:text-[#8B0000] transition-colors">
                    {app.name}
                  </span>

                  {/* Status Indicator */}
                  {(isConnected || isBuiltIn) && (
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {lang === 'ar' ? 'متصل' : 'Connected'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Custom MCP Modal */}
      {isAddMcpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6 relative animate-scale-up">
            <button
              onClick={() => setIsAddMcpOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Add Custom MCP Server</h3>
                <p className="text-xs text-gray-500">Connect any standard Model Context Protocol server</p>
              </div>
            </div>

            <form onSubmit={handleSaveCustomMcp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Server Name
                </label>
                <input
                  type="text"
                  required
                  value={mcpName}
                  onChange={(e) => setMcpName(e.target.value)}
                  placeholder="e.g. Postgres Custom MCP, Internal Tools"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Endpoint URL (SSE / HTTP)
                </label>
                <input
                  type="url"
                  required
                  value={mcpUrl}
                  onChange={(e) => setMcpUrl(e.target.value)}
                  placeholder="https://mcp.your-domain.com/sse"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={mcpCategory}
                  onChange={(e) => setMcpCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  {APPS_CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMcpOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                >
                  Save & Register MCP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
