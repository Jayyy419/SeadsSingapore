export type Locale = "en" | "zh" | "ms" | "hi";

export type Translation = {
  navHome: string;
  navAbout: string;
  navPrograms: string;
  navEvents: string;
  navStories: string;
  navMedia: string;
  navDonate: string;
  heroEyebrow: string;
  heroPos: string;
  heroDef1: string;
  heroDef2: string;
  tagSea: string;
  tagEst: string;
  ctaPrimary: string;
  ctaSecondary: string;
  aboutEyebrow: string;
  aboutBody1: string;
  aboutBody2: string;
  aboutCta: string;
  programsEyebrow: string;
  programsTitle: string;
  programsLink: string;
  eventsTitle: string;
  viewAll: string;
  storiesTitle: string;
  galleryTitle: string;
  galleryLink: string;
  teamTitle: string;
  testimonialsTitle: string;
  contactEyebrow: string;
  contactTitle: string;
  contactBody: string;
  namePh: string;
  emailPh: string;
  interestPh: string;
  submit: string;
  footerTagline: string;
};

export const translations: Record<Locale, Translation> = {
  en: {
    navHome: "Home", navAbout: "About", navPrograms: "Programs", navEvents: "Events", navStories: "Stories", navMedia: "Media", navDonate: "Donate",
    heroEyebrow: "Seads Singapore · South East Asia",
    heroPos: "noun & verb · South East Asia + seeds",
    heroDef1: "A youth-led non-profit cultivating sustainability, mental health awareness, and personal growth across Southeast Asia.",
    heroDef2: "To give a young person the soil, water, and light to grow — we seads communities, one youth at a time.",
    tagSea: "SEA + seeds", tagEst: "Est. Singapore",
    ctaPrimary: "Explore Programs", ctaSecondary: "Our Story",
    aboutEyebrow: "Where the name comes from",
    aboutBody1: "South East Asia is where we plant. Seeds are what we plant — the potential in every young person we work with.",
    aboutBody2: "Seads started with a simple observation: youth across the region have the same drive to build a better future, but rarely the same access to support. We build programs in sustainability, mental health, and leadership that meet young people where they are — and give them room to grow.",
    aboutCta: "Meet the team",
    programsEyebrow: "What we grow", programsTitle: "Signature Programs", programsLink: "Partner with us",
    eventsTitle: "Upcoming Events", viewAll: "View all",
    storiesTitle: "Latest Stories",
    galleryTitle: "Photo Wall", galleryLink: "Open full gallery",
    teamTitle: "Meet The Team",
    testimonialsTitle: "Voices From The Community",
    contactEyebrow: "Get involved", contactTitle: "Help us plant the next seed.",
    contactBody: "Volunteer, partner, or simply tell us what you're interested in — we'll follow up.",
    namePh: "Full name", emailPh: "Email", interestPh: "What are you interested in?", submit: "Submit interest",
    footerTagline: "A youth-led movement seeding sustainability, mental health awareness, and growth across Southeast Asia.",
  },
  zh: {
    navHome: "首页", navAbout: "关于我们", navPrograms: "项目", navEvents: "活动", navStories: "故事", navMedia: "媒体", navDonate: "捐赠",
    heroEyebrow: "Seads 新加坡 · 东南亚",
    heroPos: "名词 & 动词 · 东南亚（SEA）+ 种子（seeds）",
    heroDef1: "一个植根于可持续发展、心理健康意识和东南亚青年成长的青年主导非营利组织。",
    heroDef2: "给予年轻人成长所需的土壤、水分和阳光——我们播种社区，一次影响一个青年。",
    tagSea: "东南亚 + 种子", tagEst: "始于新加坡",
    ctaPrimary: "探索项目", ctaSecondary: "我们的故事",
    aboutEyebrow: "名字的由来",
    aboutBody1: "东南亚是我们播种的地方。种子是我们所播种的——每一个年轻人身上的潜力。",
    aboutBody2: "Seads 从一个简单的观察开始：整个地区的青年都有建设更美好未来的动力，却往往缺乏同等的支持渠道。我们围绕可持续发展、心理健康和领导力打造项目，走进青年的生活，给予他们成长的空间。",
    aboutCta: "认识团队",
    programsEyebrow: "我们培育的", programsTitle: "特色项目", programsLink: "与我们合作",
    eventsTitle: "近期活动", viewAll: "查看全部",
    storiesTitle: "最新故事",
    galleryTitle: "照片墙", galleryLink: "打开完整图库",
    teamTitle: "认识团队",
    testimonialsTitle: "社区之声",
    contactEyebrow: "参与我们", contactTitle: "帮助我们播下下一颗种子",
    contactBody: "志愿服务、合作伙伴关系，或者告诉我们你感兴趣的方向——我们会跟进联系。",
    namePh: "姓名", emailPh: "电子邮箱", interestPh: "您对什么感兴趣？", submit: "提交",
    footerTagline: "一个青年主导的运动，在东南亚播种可持续发展、心理健康意识与成长。",
  },
  ms: {
    navHome: "Laman Utama", navAbout: "Tentang Kami", navPrograms: "Program", navEvents: "Acara", navStories: "Kisah", navMedia: "Media", navDonate: "Derma",
    heroEyebrow: "Seads Singapura · Asia Tenggara",
    heroPos: "kata nama & kata kerja · Asia Tenggara (SEA) + benih (seeds)",
    heroDef1: "Sebuah pertubuhan bukan untung yang diterajui belia, memupuk kelestarian, kesedaran kesihatan mental, dan pertumbuhan belia di seluruh Asia Tenggara.",
    heroDef2: "Memberi seorang belia tanah, air, dan cahaya untuk membesar — kami menyemai komuniti, seorang belia pada satu masa.",
    tagSea: "SEA + benih", tagEst: "Ditubuhkan di Singapura",
    ctaPrimary: "Terokai Program", ctaSecondary: "Kisah Kami",
    aboutEyebrow: "Asal usul nama",
    aboutBody1: "Asia Tenggara adalah tempat kami menyemai. Benih adalah apa yang kami semai — potensi dalam setiap belia yang kami bekerjasama.",
    aboutBody2: "Seads bermula dengan satu pemerhatian mudah: belia di seluruh rantau ini mempunyai semangat yang sama untuk membina masa depan yang lebih baik, tetapi jarang mempunyai akses sokongan yang sama. Kami membina program dalam kelestarian, kesihatan mental, dan kepimpinan yang bertemu belia di mana mereka berada.",
    aboutCta: "Kenali pasukan kami",
    programsEyebrow: "Apa yang kami semai", programsTitle: "Program Utama", programsLink: "Bekerjasama dengan kami",
    eventsTitle: "Acara Akan Datang", viewAll: "Lihat semua",
    storiesTitle: "Kisah Terkini",
    galleryTitle: "Dinding Foto", galleryLink: "Buka galeri penuh",
    teamTitle: "Kenali Pasukan",
    testimonialsTitle: "Suara Komuniti",
    contactEyebrow: "Sertai kami", contactTitle: "Bantu kami menyemai benih seterusnya.",
    contactBody: "Jadi sukarelawan, bekerjasama, atau sekadar beritahu kami minat anda — kami akan hubungi anda semula.",
    namePh: "Nama penuh", emailPh: "E-mel", interestPh: "Apa yang anda minati?", submit: "Hantar minat",
    footerTagline: "Sebuah pergerakan diterajui belia yang menyemai kelestarian, kesedaran kesihatan mental, dan pertumbuhan di seluruh Asia Tenggara.",
  },
  hi: {
    navHome: "होम", navAbout: "हमारे बारे में", navPrograms: "कार्यक्रम", navEvents: "इवेंट्स", navStories: "कहानियाँ", navMedia: "मीडिया", navDonate: "दान करें",
    heroEyebrow: "सीड्स सिंगापुर · दक्षिण-पूर्व एशिया",
    heroPos: "संज्ञा और क्रिया · दक्षिण-पूर्व एशिया (SEA) + बीज (seeds)",
    heroDef1: "एक युवा-नेतृत्व वाला गैर-लाभकारी संगठन जो दक्षिण-पूर्व एशिया में स्थिरता, मानसिक स्वास्थ्य जागरूकता और युवाओं के विकास को बढ़ावा देता है।",
    heroDef2: "एक युवा को बढ़ने के लिए मिट्टी, पानी और रोशनी देना — हम समुदायों में बीज बोते हैं, एक समय में एक युवा।",
    tagSea: "SEA + बीज", tagEst: "सिंगापुर में स्थापित",
    ctaPrimary: "कार्यक्रम देखें", ctaSecondary: "हमारी कहानी",
    aboutEyebrow: "नाम कहाँ से आया",
    aboutBody1: "दक्षिण-पूर्व एशिया वह जगह है जहाँ हम बोते हैं। बीज वह है जो हम बोते हैं — हर युवा में छिपी संभावना।",
    aboutBody2: "सीड्स की शुरुआत एक साधारण अवलोकन से हुई: पूरे क्षेत्र के युवाओं में एक बेहतर भविष्य बनाने की समान इच्छा है, लेकिन समान सहयोग तक पहुंच शायद ही कभी होती है। हम स्थिरता, मानसिक स्वास्थ्य और नेतृत्व में ऐसे कार्यक्रम बनाते हैं जो युवाओं से वहीं मिलते हैं जहाँ वे हैं।",
    aboutCta: "टीम से मिलें",
    programsEyebrow: "हम क्या उगाते हैं", programsTitle: "प्रमुख कार्यक्रम", programsLink: "हमारे साथ साझेदारी करें",
    eventsTitle: "आगामी इवेंट्स", viewAll: "सभी देखें",
    storiesTitle: "नवीनतम कहानियाँ",
    galleryTitle: "फोटो दीवार", galleryLink: "पूरी गैलरी खोलें",
    teamTitle: "टीम से मिलें",
    testimonialsTitle: "समुदाय की आवाज़ें",
    contactEyebrow: "जुड़ें", contactTitle: "अगला बीज बोने में हमारी मदद करें।",
    contactBody: "स्वयंसेवा करें, साझेदार बनें, या बस बताएं कि आपकी रुचि किसमें है — हम संपर्क करेंगे।",
    namePh: "पूरा नाम", emailPh: "ईमेल", interestPh: "आपकी रुचि किसमें है?", submit: "रुचि सबमिट करें",
    footerTagline: "एक युवा-नेतृत्व वाला आंदोलन जो दक्षिण-पूर्व एशिया में स्थिरता, मानसिक स्वास्थ्य जागरूकता और विकास को बढ़ावा देता है।",
  },
};
