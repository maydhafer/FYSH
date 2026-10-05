export type Lang = 'ar' | 'en';

export const t = {
  ar: {
    brand: 'فِيشْ',
    brandEn: 'FYSH',
    nav: {
      home: 'الرئيسية',
      apps: 'التطبيقات',
      howItWorks: 'كيف تعمل',
      login: 'تسجيل الدخول',
      workspace: 'مساحة العمل',
    },
    hero: {
      headline: 'اربط كل تطبيقاتك\nمن مكان واحد.',
      subcopy: 'فِيشْ تجمع آلاف التطبيقات والخدمات في منصة واحدة، لتربط أدواتك وتدير تكاملاتك بسهولة وبدون تعقيد.',
      ctaPrimary: 'ابدأ الآن',
      ctaSecondary: 'استكشف التطبيقات',
      whatWeDo: 'ماذا نفعل؟',
      bottomHeadline: 'تطبيقات كثيرة\nمنصة واحدة.',
      bottomDesc: 'بدلاً من ربط كل تطبيق بشكل منفصل، تتيح لك فِيشْ إدارة جميع تكاملاتك وأدواتك من لوحة تحكم مركزية واحدة وبموثوقية تامة.',
    },
    features: [
      {
        id: 'apps',
        number: '01',
        title: 'التطبيقات',
        subtitle: 'توصيل آلاف التطبيقات والخدمات في مكان واحد.',
        description: 'ادمج أدوات العمل، التخزين السحابي، منصات التواصل، وإدارة العملاء بكل سهولة دون الحاجة لكتابة أي كود برمجي.',
        details: [
          'دعم لأكثر من 5,000+ تطبيق عالمي ومحلي',
          'ربط سريع وبضع نقرات لتفعيل المزامنة الفورية',
          'دعم تطبيقات Google Workspace و Microsoft 365 و Slack وغيرها',
          'تحديثات فورية للبيانات بين التطبيقات المرتبطة'
        ],
        metrics: '5,000+ تطبيق مدعوم'
      },
      {
        id: 'workflows',
        number: '02',
        title: 'سير العمل',
        subtitle: 'أتمتة المهام والعمليات بين الأدوات بسلاسة.',
        description: 'أنشئ مسارات عمل تلقائية تربط الأحداث في تطبيق ما بتنفيذ إجراءات فورية في تطبيقات أخرى.',
        details: [
          'محرك أتمتة مرن وسريع الاستجابة',
          'شروط مخصصة وتصفية متقدمة للبيانات',
          'سجل متابعة دقيق لجميع العمليات والرسائل',
          'تنبيهات فورية عند حدوث أي خطأ أو اكتمال المهمة'
        ],
        metrics: '99.99% موثوقية التنفيذ'
      },
      {
        id: 'ai-agents',
        number: '03',
        title: 'وكلاء الذكاء الاصطناعي',
        subtitle: 'منصة مصممة لتمكين الـ AI Agents من الوصول للأدوات.',
        description: 'عندك AI Agent؟ فِيشْ تعطيه الأدوات والواجهات التي يحتاجها ليتفاعل مع كافة تطبيقاتك بشكل آمن ومباشر.',
        details: [
          'ربط وكلاء الذكاء الاصطناعي بالبيانات الحية',
          'صلاحيات تحكم دقيقة لكل وكيل ومهمة',
          'دعم نماذج الذكاء الاصطناعي الكبرى',
          'تنفيذ آمن للأوامر والمهام المعقدة'
        ],
        metrics: 'جاهز لتكامل الذكاء الاصطناعي'
      }
    ],
    sections: {
      appsTitle: 'تطبيقات كثيرة — منصة واحدة.',
      appsSub: 'اربط أدواتك المفضلة وتطبيقات العمل اليومية من واجهة مركزية واحدة.',
      howItWorksTitle: 'كيف تعمل فِيشْ؟',
      howItWorksSub: 'خطوات بسيطة لربط وتسهيل أعمالك الرقمية.',
      steps: [
        { num: '01', title: 'سجّل دخولك', desc: 'أنشئ حسابك أو سجل دخولك إلى منصة فِيشْ بكل سهولة.' },
        { num: '02', title: 'اختر التطبيقات', desc: 'استعرض آلاف التطبيقات والخدمات التي تستخدمها يومياً.' },
        { num: '03', title: 'اربطها', desc: 'قم بربط حساباتك وأدواتك بضغطة زر واحدة وآمنة.' },
        { num: '04', title: 'خلّ فِيشْ تدير التكامل', desc: 'دع المنصة تتولى مزامنة البيانات وأتمتة سير العمل بالنيابة عنك.' }
      ],
      aiAgentsTitle: 'عندك AI Agent؟',
      aiAgentsSubtitle: 'فِيشْ تعطيه الأدوات اللي يحتاجها.',
      aiAgentsDesc: 'منصة فِيشْ توفر الربط البرمجي اللازم لتمكين وكلاء الذكاء الاصطناعي من تنفيذ المهام واستدعاء الأدوات عبر التطبيقات المختلفة بكفاءة عالية.',
      valueTitle: 'القيمة الحقيقية للأعمال',
      valueSub: 'لماذا تعتمد الشركات والمنظمات على فِيشْ؟',
      values: [
        'تقليل تعقيد التكاملات البرمجية',
        'ربط التطبيقات من مكان واحد',
        'توفير الوقت والجهد التشغيلي',
        'تبسيط إدارة الأدوات والاشتراكات',
        'تقليل الحاجة إلى بناء تكامل منفصل لكل تطبيق',
        'إدارة مركزية وشاملة للتكاملات'
      ]
    },
    login: {
      title: 'تسجيل الدخول إلى فِيشْ',
      subtitle: 'اختر طريقة تسجيل الدخول للوصول إلى مساحة عملك.',
      google: 'المتابعة بواسطة Google',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'name@company.com',
      emailSubmit: 'متابعة بالبريد الإلكتروني',
      workspaceTitle: 'مساحة عمل فِيشْ',
      connectedApps: 'التطبيقات المرتبطة',
      addApp: 'إضافة تطبيق جديد',
      manageIntegrations: 'إدارة التكاملات',
      services: 'الخدمات النشطة',
      account: 'إدارة الحساب',
      close: 'إغلاق',
      logout: 'تسجيل الخروج'
    }
  },
  en: {
    brand: 'FYSH',
    brandEn: 'FYSH',
    nav: {
      home: 'Home',
      apps: 'Apps',
      howItWorks: 'How It Works',
      login: 'Login',
      workspace: 'Workspace',
    },
    hero: {
      headline: 'Connect all your apps\nfrom one place.',
      subcopy: 'FYSH brings thousands of applications and services into a single platform to connect your tools and manage integrations effortlessly.',
      ctaPrimary: 'Get Started',
      ctaSecondary: 'Explore Apps',
      whatWeDo: 'WHAT DO WE DO?',
      bottomHeadline: 'Many apps\nOne platform.',
      bottomDesc: 'Instead of connecting every application separately, FYSH allows you to manage all your integrations and tools from a single centralized dashboard.',
    },
    features: [
      {
        id: 'apps',
        number: '01',
        title: 'Applications',
        subtitle: 'Connect thousands of apps and services in one place.',
        description: 'Easily integrate work tools, cloud storage, communication platforms, and CRMs without writing a single line of code.',
        details: [
          'Support for over 5,000+ global and local apps',
          'Fast setup with secure one-click OAuth authentication',
          'Seamless integration with Google Workspace, Microsoft 365, Slack & more',
          'Real-time data synchronization across connected tools'
        ],
        metrics: '5,000+ Supported Apps'
      },
      {
        id: 'workflows',
        number: '02',
        title: 'Workflows',
        subtitle: 'Automate tasks and processes smoothly between tools.',
        description: 'Build automated workflows that connect triggers in one application to immediate actions in others.',
        details: [
          'Flexible and responsive automation engine',
          'Custom conditions and advanced data filtering',
          'Detailed audit logs for all operations and events',
          'Instant notifications for any errors or successful runs'
        ],
        metrics: '99.99% Execution Reliability'
      },
      {
        id: 'ai-agents',
        number: '03',
        title: 'AI Agents',
        subtitle: 'Built to empower AI Agents with the tools they need.',
        description: 'Got an AI Agent? FYSH gives it the tools and APIs required to interact with all your enterprise applications safely and directly.',
        details: [
          'Connect AI agents to live business data',
          'Granular permissions control for every agent and task',
          'Support for leading foundational AI models',
          'Secure execution of complex commands and actions'
        ],
        metrics: 'AI-Agent Ready Architecture'
      }
    ],
    sections: {
      appsTitle: 'Many apps — one platform.',
      appsSub: 'Connect your favorite tools and daily work applications from a single centralized interface.',
      howItWorksTitle: 'How FYSH Works',
      howItWorksSub: 'Simple steps to connect and simplify your digital operations.',
      steps: [
        { num: '01', title: 'Sign In', desc: 'Create your account or sign in to FYSH securely.' },
        { num: '02', title: 'Choose Apps', desc: 'Browse thousands of applications and services you use daily.' },
        { num: '03', title: 'Connect', desc: 'Link your accounts and tools with a single click.' },
        { num: '04', title: 'Let FYSH Manage', desc: 'Let the platform handle data sync and workflow automation for you.' }
      ],
      aiAgentsTitle: 'Have an AI Agent?',
      aiAgentsSubtitle: 'FYSH gives it the tools it needs.',
      aiAgentsDesc: 'FYSH provides the necessary API connectors to enable artificial intelligence agents to execute tasks and call tools across various applications with high efficiency.',
      valueTitle: 'Business Value',
      valueSub: 'Why organizations rely on FYSH',
      values: [
        'Reduce integration complexity',
        'Connect apps from one place',
        'Save operational time',
        'Simplify tool & subscription management',
        'Eliminate custom point-to-point coding',
        'Centralized integration governance'
      ]
    },
    login: {
      title: 'Sign in to FYSH',
      subtitle: 'Choose your sign in method to access your workspace.',
      google: 'Continue with Google',
      emailLabel: 'Work Email',
      emailPlaceholder: 'name@company.com',
      emailSubmit: 'Continue with Email',
      workspaceTitle: 'FYSH Workspace',
      connectedApps: 'Connected Applications',
      addApp: 'Add New App',
      manageIntegrations: 'Manage Integrations',
      services: 'Active Services',
      account: 'Account Settings',
      close: 'Close',
      logout: 'Logout'
    }
  }
};
