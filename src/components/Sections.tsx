import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, Search, ExternalLink, Plus, Trash2, Mail, Send, Linkedin } from 'lucide-react';
import { Lang, t } from '../translations';
import bannerImg from '../assets/images/regenerated_image_1787311802163.png';

import { getOrCreateStableFishUserId } from '../lib/fishUser';

interface SectionsProps {
  lang: Lang;
  onOpenLogin: () => void;
  onExploreApps?: () => void;
}

interface ToolkitApp {
  id: string;
  name: string;
  category: string;
  description?: string;
  logo: string;
  slug?: string;
}

interface ConnectedAccount {
  id: string;
  toolkit?: string;
  app?: string;
  name?: string;
  status: string;
  createdAt?: string;
}

// Curated top Featured / Main Apps for the Home page
const FEATURED_HOME_APPS: ToolkitApp[] = [
  { id: "gmail", name: "Gmail", category: "Email & Communication", logo: "https://logos.composio.dev/api/gmail" },
  { id: "googlecalendar", name: "Google Calendar", category: "Google Workspace & Productivity", logo: "https://logos.composio.dev/api/googlecalendar" },
  { id: "github", name: "GitHub", category: "Developer & Engineering", logo: "https://logos.composio.dev/api/github" },
  { id: "notion", name: "Notion", category: "Google Workspace & Productivity", logo: "https://logos.composio.dev/api/notion" },
  { id: "slack", name: "Slack", category: "Email & Communication", logo: "https://logos.composio.dev/api/slack" },
  { id: "youtube", name: "YouTube", category: "Media & Content", logo: "https://logos.composio.dev/api/youtube" },
  { id: "googledrive", name: "Google Drive", category: "Google Workspace & Productivity", logo: "https://logos.composio.dev/api/googledrive" },
  { id: "googledocs", name: "Google Docs", category: "Google Workspace & Productivity", logo: "https://logos.composio.dev/api/googledocs" },
  { id: "outlook", name: "Microsoft Outlook", category: "Email & Communication", logo: "https://logos.composio.dev/api/outlook" },
  { id: "teams", name: "Microsoft Teams", category: "Email & Communication", logo: "https://logos.composio.dev/api/teams" },
  { id: "zoom", name: "Zoom", category: "Email & Communication", logo: "https://logos.composio.dev/api/zoom" },
  { id: "discord", name: "Discord", category: "Email & Communication", logo: "https://logos.composio.dev/api/discord" },
  { id: "figma", name: "Figma", category: "Developer & Engineering", logo: "https://logos.composio.dev/api/figma" },
  { id: "stripe", name: "Stripe", category: "Business, CRM & Sales", logo: "https://logos.composio.dev/api/stripe" },
  { id: "hubspot", name: "HubSpot", category: "Business, CRM & Sales", logo: "https://logos.composio.dev/api/hubspot" },
  { id: "airtable", name: "Airtable", category: "Google Workspace & Productivity", logo: "https://logos.composio.dev/api/airtable" }
];

export function Sections({ lang, onOpenLogin, onExploreApps }: SectionsProps) {
  const currentT = t[lang];
  const [featuredApps] = useState<ToolkitApp[]>(FEATURED_HOME_APPS);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [connectionStates, setConnectionStates] = useState<Record<string, 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'FAILED'>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchConnectedAccounts();

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'COMPOSIO_CONNECTED') {
        fetchConnectedAccounts();
        setConnectionStates({});
        setSuccessMsg(lang === 'ar' ? 'تم ربط التطبيق بنجاح!' : 'Application connected successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
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
  }, [lang]);

  const fetchConnectedAccounts = async () => {
    try {
      const fishUserId = await getOrCreateStableFishUserId();
      const res = await fetch(`/api/composio/connectedAccounts?fishUserId=${encodeURIComponent(fishUserId)}`);
      const data = await res.json();
      if (data.accounts) {
        setConnectedAccounts(data.accounts);
      }
    } catch (err) {
      console.error("Failed to fetch connected accounts", err);
    }
  };

  const normalizeAppId = (id: string) => (id || '').toLowerCase().replace(/[-_]/g, '');

  const getConnectedAccount = (appId: string) => {
    const norm = normalizeAppId(appId);
    return connectedAccounts.find(acc => {
      const accToolkit = normalizeAppId(acc.toolkit || acc.app || '');
      const accId = normalizeAppId(acc.id || '');
      const status = (acc.status || '').toUpperCase();
      const isActive = status === 'ACTIVE' || status === 'CONNECTED';
      const isMatch = (accToolkit === norm || accId.includes(norm) || (accToolkit && norm.includes(accToolkit)));
      return isMatch && isActive;
    });
  };

  const handleConnectApp = async (app: ToolkitApp) => {
    const appKey = app.id;
    setErrorMsg(null);
    setSuccessMsg(null);
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
      const toolkitSlug = app.slug || app.id;

      // 1. Call server /api/composio/connect to resolve Auth Config and create Connect Link
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
        setErrorMsg(data.error || (lang === 'ar' ? 'فشل بدء الاتصال مع منصة التكامل. يرجى إعادة المحاولة.' : 'Failed to initiate connection. Please try again.'));
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

      // 3. Poll verify endpoint until ACTIVE
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
            setTimeout(() => setSuccessMsg(null), 3500);
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
              setTimeout(() => setSuccessMsg(null), 3500);
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
          console.warn("Verify poll error:", e);
        }
      }, 2000);

    } catch (err: any) {
      try { if (popup && !popup.closed) popup.close(); } catch (_) {}
      setConnectionStates(prev => ({ ...prev, [appKey]: 'FAILED' }));
      setErrorMsg(err.message || (lang === 'ar' ? 'حدث خطأ في الشبكة أثناء الاتصال.' : 'Network error during connection.'));
    }
  };

  const handleDisconnect = async (app: ToolkitApp, accountId: string) => {
    try {
      const fishUserId = await getOrCreateStableFishUserId();
      const toolkitSlug = app.slug || app.id;

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
    } catch (err) {
      console.error("Failed to disconnect", err);
    }
  };

  return (
    <div className="bg-white text-[#191919] overflow-x-hidden">
      {/* Applications / Product Section */}
      <section id="product" className="py-12 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto border-t border-gray-100">


        {/* Seamless Infinite Application Icon Marquee (Continuous, Smooth, Infinite Loop) */}
        {featuredApps.length > 0 && (
          <div className="relative w-full overflow-hidden py-5 sm:py-6 mb-10 border-y border-gray-100 bg-gradient-to-b from-[#FAF9F9]/50 via-white to-[#FAF9F9]/50 rounded-2xl sm:rounded-3xl">
            {/* Soft Edge Gradient Fades */}
            <div className="absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

            {/* Continuous Ticker Track */}
            <div className={`gap-4 sm:gap-6 md:gap-7 items-center ${lang === 'ar' ? 'animate-rail-rtl' : 'animate-rail-ltr'}`}>
              {[...featuredApps, ...featuredApps, ...featuredApps, ...featuredApps].map((app, idx) => (
                <div
                  key={`marquee-${app.id}-${idx}`}
                  className="relative group flex-shrink-0"
                  title={app.name}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white border border-gray-200/90 shadow-[0_4px_14px_rgba(0,0,0,0.06)] flex items-center justify-center p-2.5 sm:p-3.5 group-hover:shadow-[0_8px_22px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-all duration-300">
                    <img
                      src={app.logo}
                      alt={app.name}
                      className="w-full h-full object-contain pointer-events-none drop-shadow-2xs select-none"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* Banner Alert Messages */}
        {errorMsg && (
          <div className="mb-6 p-3.5 sm:p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900 font-bold px-2">✕</button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
            <span className="font-medium">{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold px-2">✕</button>
          </div>
        )}

        {/* Featured Apps Heading */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-serif text-gray-900">
            {lang === 'ar' ? 'التطبيقات الرئيسية المتكاملة' : 'Featured Integrations'}
          </h3>
          {onExploreApps && (
            <button
              onClick={onExploreApps}
              className="text-xs sm:text-sm font-semibold text-[#8B0000] hover:text-[#660000] flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>{lang === 'ar' ? 'عرض جميع التطبيقات' : 'View All Apps'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Featured Applications Circular Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-9 justify-items-center mb-8">
          {featuredApps.map((app) => {
            const connectedAcc = getConnectedAccount(app.id);
            const connected = !!connectedAcc;
            const appState = connectionStates[app.id] || (connected ? 'CONNECTED' : 'IDLE');
            const isConnecting = appState === 'CONNECTING';

            return (
              <div
                key={app.id}
                className="flex flex-col items-center group select-none"
              >
                {/* Circular Application Icon with Attached (+ / −) Action Badge */}
                <div className="relative">
                  <div
                    onClick={() => {
                      if (isConnecting) return;
                      if (connected && connectedAcc) {
                        handleDisconnect(app, connectedAcc.id);
                      } else {
                        handleConnectApp(app);
                      }
                    }}
                    title={app.name}
                    className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-white border shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center justify-center p-3.5 sm:p-4 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] cursor-pointer ${
                      connected
                        ? 'border-emerald-400 ring-2 ring-emerald-400/20'
                        : 'border-gray-200/90 group-hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={app.logo}
                      alt={app.name}
                      className="w-full h-full object-contain pointer-events-none drop-shadow-2xs select-none"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Circular Action Badge (+ / −) */}
                  <button
                    type="button"
                    aria-label={connected ? `Disconnect ${app.name}` : `Connect ${app.name}`}
                    disabled={isConnecting}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (connected && connectedAcc) {
                        handleDisconnect(app, connectedAcc.id);
                      } else {
                        handleConnectApp(app);
                      }
                    }}
                    className={`absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold leading-none shadow-md border-2 border-white transition-all duration-200 hover:scale-125 active:scale-95 disabled:opacity-60 cursor-pointer ${
                      connected
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-[#191919] hover:bg-[#8B0000] text-white'
                    }`}
                    title={connected ? (lang === 'ar' ? 'فصل التطبيق' : 'Disconnect') : (lang === 'ar' ? 'ربط التطبيق' : 'Connect')}
                  >
                    {isConnecting ? (
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : connected ? (
                      <span>−</span>
                    ) : (
                      <span>+</span>
                    )}
                  </button>
                </div>

                {/* Application Name Label */}
                <span className="text-xs font-medium text-[#191919] mt-2.5 text-center truncate max-w-[80px] sm:max-w-[90px] group-hover:text-[#8B0000] transition-colors">
                  {app.name}
                </span>

                {/* Connected Status Indicator */}
                {connected && (
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {lang === 'ar' ? 'متصل' : 'Connected'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Dedicated "More Apps / View All Apps" Button (Navigates to /apps) */}
        {onExploreApps && (
          <div className="flex justify-center mb-10">
            <button
              onClick={onExploreApps}
              className="px-6 py-3 bg-[#191919] hover:bg-[#8B0000] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer group"
            >
              <span>{lang === 'ar' ? 'عرض جميع التطبيقات (+1300 تطبيق)' : 'More Apps (+1300 Apps)'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        <div className="mt-6 p-6 sm:p-8 bg-[#F4F3F3] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 border border-gray-200">
          <div>
            <h3 className="text-lg sm:text-xl font-serif">{lang === 'ar' ? 'هل تحتاج إلى تكامل مخصص أو أداة خاصة؟' : 'Need a custom integration or private tool?'}</h3>
            <p className="text-xs sm:text-sm text-[#191919]/70 mt-1">
              {lang === 'ar' ? 'منصة فيش تربط أي واجهة برمجية (API) أو قاعدة بيانات بشكل تلقائي بالكامل.' : 'FYSH connects any API or database fully automatically in the background.'}
            </p>
          </div>
          <button
            onClick={onOpenLogin}
            className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#191919] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#191919]/90 transition-colors shrink-0"
          >
            {lang === 'ar' ? 'فتح لوحة التحكم' : 'Open Dashboard'}
          </button>
        </div>
      </section>

      {/* Solutions / How It Works Section */}
      <section id="solutions" className="py-12 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12 bg-[#F9F9F9] border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10 sm:mb-12">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
              {lang === 'ar' ? 'آلية العمل الخفية' : 'Background Engine'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mt-2 tracking-tight">
              {currentT.sections.howItWorksTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#191919]/70 mt-3 leading-relaxed">
              {currentT.sections.howItWorksSub}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {currentT.sections.steps.map((step, idx) => (
              <div key={idx} className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                    {step.num}
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif mt-3 sm:mt-4 mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-[#191919]/70 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents & Business Value Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto border-t border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 items-center">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
              {lang === 'ar' ? 'مستقبل الذكاء الاصطناعي' : 'AI Agent Ecosystem'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mt-2 tracking-tight">
              {currentT.sections.aiAgentsTitle}
            </h2>
            <p className="text-lg sm:text-xl font-serif text-[#191919]/90 mt-2">
              {currentT.sections.aiAgentsSubtitle}
            </p>
            <p className="text-sm sm:text-base text-[#191919]/70 mt-3 leading-relaxed">
              {currentT.sections.aiAgentsDesc}
            </p>
            <div className="mt-6 sm:mt-8">
              <button
                onClick={onOpenLogin}
                className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#191919] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#191919]/90 transition-colors inline-flex items-center gap-2"
              >
                <span>{lang === 'ar' ? 'اربط وكيلك الذكي الآن' : 'Connect Your AI Agent'}</span>
                <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-[#F4F3F3] p-6 sm:p-8 md:p-10 rounded-2xl border border-gray-200">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
              {currentT.sections.valueTitle}
            </span>
            <h3 className="text-xl sm:text-2xl font-serif mt-1.5 mb-5 sm:mb-6">{currentT.sections.valueSub}</h3>
            <ul className="space-y-3 sm:space-y-4">
              {currentT.sections.values.map((val, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#191919] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[#191919]/80">{val}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Kresna Footer Component */}
      <section className="footer-section" style={{ background: '#ffffff', padding: '48px 24px', fontFamily: "'DM Sans', sans-serif", color: '#2d3148', position: 'relative' }}>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{__html: `
          .footer-section *, .footer-section *::before, .footer-section *::after { box-sizing: border-box; margin: 0; padding: 0; }
          .footer-wrapper { max-width: 1150px; margin: 0 auto; display: grid; grid-template-columns: 350px 1fr; gap: 16px; align-items: stretch; }
          .footer-left { position: relative; min-height: 340px; border-radius: 28px; padding: 32px; overflow: hidden; box-shadow: 0 12px 40px rgba(21, 76, 189, 0.25); background: #1e4fc0; display: flex; flex-direction: column; justify-content: space-between; }
          .footer-left-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; pointer-events: none; }
          .footer-logo { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
          .footer-logo-mark { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.85); display: flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
          .footer-logo-name { font-family: 'DM Sans', sans-serif; font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
          .footer-tagline-container { margin-top: auto; margin-bottom: 28px; position: relative; z-index: 1; }
          .footer-tagline { font-family: 'DM Sans', sans-serif; font-size: 19px; font-weight: 400; color: #fff; line-height: 1.45; }
          .footer-tagline span { color: rgba(255, 255, 255, 0.65); }
          .footer-social-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; position: relative; z-index: 1; }
          .footer-social-label { font-family: 'Caveat', cursive; font-size: 17px; font-weight: 600; color: rgba(255,255,255,0.9); letter-spacing: 0.3px; }
          .footer-social-icons { display: flex; gap: 7px; }
          .social-icon { width: 36px; height: 36px; border-radius: 9px; background: #0e1014; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.2); transition: background 0.2s, transform 0.15s, box-shadow 0.2s; color: #fff; text-decoration: none; }
          .social-icon:hover { background: #000; transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.45); }
          .social-icon svg { width: 15px; height: 15px; fill: currentColor; }

          .footer-right { background: #f0f1f5; border-radius: 28px; padding: 40px; overflow: visible; box-shadow: 0 4px 20px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between; position: relative; }
          .footer-lucky-graphic { position: absolute; top: -36px; right: 40px; z-index: 10; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
          .lucky-cube { width: 96px; height: 96px; border-radius: 22px; transform: rotate(-10deg); background: linear-gradient(135deg, #5b9ffb 0%, #1e5dd7 55%, #1448be 100%); box-shadow: inset 3px 3px 8px rgba(255,255,255,0.35), inset -3px -3px 12px rgba(0,0,0,0.18), 8px 14px 28px rgba(20,72,200,0.35); display: flex; align-items: center; justify-content: center; }
          .lucky-cube-mark { font-family: 'DM Sans', sans-serif; font-size: 42px; font-weight: 700; color: #fff; letter-spacing: -0.04em; transform: rotate(10deg); text-shadow: 0 3px 6px rgba(0,0,0,0.25); line-height: 1; }
          .lucky-text-row { display: flex; gap: 6px; align-items: center; transform: rotate(-4deg); margin-top: 4px; }
          .lucky-arrow { width: 22px; height: 22px; color: #9ca3af; }
          .lucky-arrow svg { stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; width: 100%; height: 100%; }
          .lucky-text { font-family: 'Caveat', cursive; font-size: 20px; font-weight: 600; color: #9ca3af; white-space: nowrap; }

          .footer-right-top { display: flex; gap: 72px; padding-top: 8px; }
          .footer-col-title { font-family: 'Caveat', cursive; font-size: 24px; font-weight: 600; font-style: italic; color: #9ca3af; margin-bottom: 18px; }
          .footer-col a { display: block; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 14px; text-decoration: none; transition: color 0.2s; }
          .footer-col a:hover { color: #1f65d6; }

          .footer-bottom { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 48px; }
          .footer-copyright { font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 500; color: #9ca3af; }
          .footer-cta-mini { display: flex; flex-direction: column; gap: 14px; }
          .footer-cta-mini h4 { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 400; color: #6b7280; line-height: 1.45; }
          .footer-cta-mini h4 strong { display: block; font-size: 19px; font-weight: 700; color: #111827; }
          .footer-subscribe-row { display: flex; width: 310px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
          .footer-subscribe-row input { flex: 1; padding: 11px 14px; background: transparent; border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #111827; }
          .footer-subscribe-row input::placeholder { color: #9ca3af; }
          .footer-subscribe-row button { padding: 11px 22px; background: #111214; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; border: none; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.15); cursor: pointer; transition: background 0.2s, box-shadow 0.2s, transform 0.15s; }
          .footer-subscribe-row button:hover { background: #000; box-shadow: 0 8px 24px rgba(0,0,0,0.38); transform: translateY(-1px); }

          .footer-watermark { max-width: 1150px; margin: -60px auto 0; pointer-events: none; user-select: none; position: relative; z-index: 0; line-height: 0; }
          .footer-watermark svg { display: block; width: 100%; height: auto; overflow: visible; }
          .footer-watermark text { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: -0.03em; fill: rgba(0, 0, 0, 0.04); }

          @media (max-width: 860px) {
            .footer-wrapper { grid-template-columns: 1fr; }
            .footer-left { min-height: auto; gap: 40px; }
          }
          @media (max-width: 560px) {
            .footer-right { padding: 24px; }
            .footer-right-top { gap: 40px; }
            .footer-bottom { flex-direction: column; align-items: flex-start; gap: 24px; }
            .footer-subscribe-row { width: 100%; }
            .footer-lucky-graphic { right: 12px; top: -28px; }
            .lucky-cube { width: 72px; height: 72px; }
          }
        `}} />

        <div className="footer-wrapper">
          {/* Left card */}
          <div className="footer-left">
            <video
              className="footer-left-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src="https://res.cloudinary.com/dd3as4ova/video/upload/v1787315279/Saudi_entrepreneur_using_AI_plat__202608210829_t105qs.mp4" type="video/mp4" />
            </video>

            <div className="footer-logo">
              <img
                src="https://res.cloudinary.com/dd3as4ova/image/upload/v1787538576/logo_mexqm7.png"
                alt="FYSH Logo"
                className="h-12 sm:h-14 w-auto object-contain bg-transparent filter drop-shadow-md"
              />
              <span className="footer-logo-name">{lang === 'ar' ? 'فِيشْ' : 'FYSH'}</span>
            </div>

            <div className="footer-tagline-container">
              <div className="footer-tagline">
                {lang === 'ar' ? 'أتمتة ذكية متكاملة،' : 'Smarter integrations & signals,'}<br />
                <span>{lang === 'ar' ? 'مدعومة بالذكاء الاصطناعي.' : 'powered by FYSH AI.'}</span>
              </div>
            </div>

            <div className="footer-social-row">
              <span className="footer-social-label">May Dhafer</span>
              <div className="footer-social-icons">
                {/* Email */}
                <a
                  href="mailto:may@wakeli.online"
                  className="social-icon"
                  aria-label="Email"
                  title="may@wakeli.online"
                >
                  <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                </a>
                {/* X (Twitter) */}
                <a
                  href="https://x.com/alraigah"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label="X"
                  title="X (@alraigah)"
                >
                  <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/maydhafer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label="LinkedIn"
                  title="LinkedIn (maydhafer)"
                >
                  <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                {/* Telegram */}
                <a
                  href="https://t.me/alraigah_M"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label="Telegram"
                  title="Telegram (@alraigah_M)"
                >
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right card */}
          <div className="footer-right">
            {/* Floating creative FYSH logo badge */}
            <div className="footer-lucky-graphic">
              <div className="lucky-cube bg-transparent border-0 shadow-none !p-0">
                <img
                  src="https://res.cloudinary.com/dd3as4ova/image/upload/v1787538576/logo_mexqm7.png"
                  alt="FYSH Logo"
                  className="w-28 h-28 sm:w-36 sm:h-36 object-contain bg-transparent filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] transform -rotate-6 hover:rotate-0 hover:scale-110 transition-all duration-300"
                />
              </div>
              <div className="lucky-text-row">
                <div className="lucky-arrow">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 20 C 6 14, 10 9, 18 5" />
                    <path d="M18 5 L 12 5" />
                    <path d="M18 5 L 18 11" />
                  </svg>
                </div>
                <span className="lucky-text">{lang === 'ar' ? 'اكتشف المزيد' : 'Experience FYSH'}</span>
              </div>
            </div>

            <div className="footer-right-top">
              <div className="footer-col">
                <div className="footer-col-title">Navigation</div>
                <a href="#product">How it works</a>
                <a href="#product">Features</a>
                <a href="#product">Pricing</a>
                <a href="#product">Testimonials</a>
                <a href="#product">FAQ</a>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">Company</div>
                <a href="#">Blog</a>
                <a href="#">About</a>
                <a href="#">Terms and Condition</a>
                <a href="#">Privacy Policy</a>
              </div>
            </div>

            <div className="footer-bottom">
              <div className="footer-copyright">
                May Dhafer © 2026
              </div>
              <div className="footer-cta-mini">
                <h4>
                  {lang === 'ar' ? 'الذكاء الاصطناعي يتطور بسرعة.' : 'AI moves fast.'}<br />
                  <strong>{lang === 'ar' ? 'ابق في المقدمة دائماً مع فيش.' : 'Stay ahead with FYSH.'}</strong>
                </h4>
                <div className="footer-subscribe-row">
                  <input type="email" placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter email address'} />
                  <button type="button">{lang === 'ar' ? 'اشتراك' : 'Subscribe'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-watermark" aria-hidden="true">
          <svg id="watermarkSvg" viewBox="62 95 876 175" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
            <text id="watermarkText" x="500" y="240" textAnchor="middle" fontSize="320">FYSH</text>
          </svg>
        </div>

        <script dangerouslySetInnerHTML={{__html: `
          function fitWatermark() {
            const svg = document.getElementById('watermarkSvg');
            const text = document.getElementById('watermarkText');
            if (!svg || !text) return;
            try {
              const bbox = text.getBBox();
              svg.setAttribute('viewBox',
                 \`\${bbox.x} \${bbox.y} \${bbox.width} \${bbox.height}\`);
            } catch (e) {}
          }
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(fitWatermark);
          } else {
            window.addEventListener('load', fitWatermark);
          }
          window.addEventListener('resize', fitWatermark);
          setTimeout(fitWatermark, 100);
        `}} />
      </section>
    </div>
  );
}
