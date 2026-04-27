export const languages = {
  zh: '中文',
  en: 'English',
} as const;

export const defaultLang = 'zh' as const;

export type Lang = keyof typeof languages;

export const ui = {
  zh: {
    // Site meta
    'site.title': "Roxiez 的数字空间 · Roxie's Space",
    'site.description': 'Roxiez 的个人站点：营销、GEO、洞察报告与前沿 AI 部署。',
    'site.skipLink': '跳到主内容',
    'site.footer': "Roxiez · Roxie's Space",

    // Nav
    'nav.home': '首页',
    'nav.works': '作品集',
    'nav.blog': '博客',
    'nav.links': '链接',
    'nav.langSwitch': 'EN',
    'nav.langSwitch.aria': 'Switch to English',

    // Home
    'home.eyebrow': "在线 · 欢迎来到 Roxie's Space",
    'home.greeting.before': 'Hi, 我是',
    'home.greeting.after': '👋',
    'home.intro': '营销、GEO、洞察报告与前沿 AI 部署 —— 这里是我的数字空间，记录作品、想法和正在折腾的事。也欢迎和我的 AI 分身聊聊。',
    'home.cta.primary': '查看作品 →',
    'home.cta.secondary': '阅读博客',

    // Works
    'works.title': '作品集',
    'works.metaTitle': "作品集 · Roxie's Space",
    'works.subtitle': '这些是我做过的、还在做的，以及打算继续做的事 —— 报告、视频、项目、小玩意儿。',
    'works.more': '更多作品陆续上架中。',

    // Links
    'links.title': '社交链接',
    'links.metaTitle': "链接 · Roxie's Space",
    'links.subtitle': '在这些地方都能找到我。',
    'links.gmail.desc': 'roxiezhao999@gmail.com',
    'links.github.desc': '@RoxieBOT — 我的开源项目',
    'links.wechat.desc': '点击查看二维码 · ID 16621670830',
    'links.airoxie.desc': '和我的 AI 分身聊聊 — 点这里直接打开',
    'links.wechat.modalTitle': '扫码加我微信',
    'links.wechat.copyBtn': '复制微信号 16621670830',
    'links.wechat.copied': '已复制：',
    'links.wechat.copyFail': '复制失败，请手动选取',
    'links.modal.close': '关闭',

    // Chat widget
    'chat.bubbleAria': '打开聊天',
    'chat.title': 'Roxiez 的 AI 分身',
    'chat.closeAria': '关闭',
    'chat.greeting': '嗨，我是 Roxiez 的 AI 分身。营销、GEO、AI 部署 —— 想聊什么直接说。',
    'chat.placeholder': '输入消息...',

    // Blog (kept Chinese; only listing labels translated)
    'blog.title': '博客',
    'blog.metaTitle': "博客 · Roxie's Space",
    'blog.empty': '暂无文章。',
    'blog.postNotice': '',
  },
  en: {
    // Site meta
    'site.title': "Roxiez's Digital Space · Roxie's Space",
    'site.description': "Roxiez's personal site: marketing, GEO, insight reports, and frontier AI deployment.",
    'site.skipLink': 'Skip to main content',
    'site.footer': "Roxiez · Roxie's Space",

    // Nav
    'nav.home': 'Home',
    'nav.works': 'Works',
    'nav.blog': 'Blog',
    'nav.links': 'Links',
    'nav.langSwitch': '中',
    'nav.langSwitch.aria': '切换到中文',

    // Home
    'home.eyebrow': "Online · Welcome to Roxie's Space",
    'home.greeting.before': "Hi, I'm",
    'home.greeting.after': '👋',
    'home.intro': "Marketing, GEO, insight reports, and frontier AI deployment — this is my digital space, where I log my work, ideas, and what I'm currently building. Feel free to chat with my AI clone.",
    'home.cta.primary': 'View Works →',
    'home.cta.secondary': 'Read Blog',

    // Works
    'works.title': 'Works',
    'works.metaTitle': "Works · Roxie's Space",
    'works.subtitle': "Things I've shipped, things in progress, and things I plan to keep building — reports, videos, projects, and small experiments.",
    'works.more': 'More works coming soon.',

    // Links
    'links.title': 'Connect',
    'links.metaTitle': "Links · Roxie's Space",
    'links.subtitle': 'You can find me in these places.',
    'links.gmail.desc': 'roxiezhao999@gmail.com',
    'links.github.desc': '@RoxieBOT — my open source projects',
    'links.wechat.desc': 'Click for QR code · ID 16621670830',
    'links.airoxie.desc': "Chat with my AI clone — click here to open",
    'links.wechat.modalTitle': 'Scan to add me on WeChat',
    'links.wechat.copyBtn': 'Copy WeChat ID 16621670830',
    'links.wechat.copied': 'Copied: ',
    'links.wechat.copyFail': 'Copy failed, please select manually',
    'links.modal.close': 'Close',

    // Chat widget
    'chat.bubbleAria': 'Open chat',
    'chat.title': "Roxiez's AI Clone",
    'chat.closeAria': 'Close',
    'chat.greeting': "Hey, I'm Roxiez's AI clone. Marketing, GEO, AI deployment — ask me anything.",
    'chat.placeholder': 'Type a message...',

    // Blog
    'blog.title': 'Blog',
    'blog.metaTitle': "Blog · Roxie's Space",
    'blog.empty': "Blog posts are written in Chinese. Use your browser's translate feature to read them in English.",
    'blog.postNotice': "📝 This post is written in Chinese. Right-click the page and choose 'Translate to English' for a machine translation.",
  },
} as const;

export type UiKey = keyof (typeof ui)[typeof defaultLang];

export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split('/')[1];
  if (seg === 'en') return 'en';
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

export function localizedPath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  return `/en${clean === '/' ? '' : clean}`;
}

export function switchLangPath(currentPath: string, currentLang: Lang): string {
  if (currentLang === 'en') {
    const stripped = currentPath.replace(/^\/en/, '') || '/';
    return stripped;
  }
  return `/en${currentPath === '/' ? '' : currentPath}`;
}
