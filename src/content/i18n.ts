export type Locale = "en" | "zh" | "ms" | "hi";

export type Translation = {
  navHome: string;
  navAbout: string;
  navPrograms: string;
  navEvents: string;
  navStories: string;
  navMedia: string;
  navDonate: string;
  navGetInvolved: string;
  navNewsroom: string;
  navWhoWeAre: string;
  navPartners: string;
  navContact: string;
  navTeam: string;
  navMenuToggleOpen: string;
  navMenuToggleClose: string;
  themeToggleToDark: string;
  themeToggleToLight: string;
  switchLanguageTo: string;
  footerPrivacy: string;
  footerLocation: string;
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
  interestTypeDefault: string;
  interestTypeVolunteer: string;
  interestTypePartner: string;
  interestTypeEvent: string;
  interestTypeOther: string;
  statusDone: string;
  statusError: string;
  statusUnconfigured: string;
  statusRateLimited: string;
  aboutPageTitle: string;
  aboutPageSubtitle: string;
  missionHeading: string;
  missionBody: string;
  visionHeading: string;
  visionBody: string;
  valuesHeading: string;
  valueYouthAgency: string;
  valueCommunityTrust: string;
  valueActionOverNoise: string;
  valueMeasurableOutcomes: string;
  programsPageTitle: string;
  programsPageSubtitle: string;
  learnMore: string;
  applyLabel: string;
  joinProgramPrefix: string;
  applyFormBody: string;
  anythingElseOptional: string;
  whoItsFor: string;
  backToPrograms: string;
  eventsPageTitle: string;
  eventsPageSubtitle: string;
  viewDetailsRsvp: string;
  rsvpLabel: string;
  joinUsAtPrefix: string;
  rsvpFormBody: string;
  backToEvents: string;
  addToCalendar: string;
  spotsFilledUnit: string;
  waitlistLabel: string;
  joinWaitlist: string;
  subscribeToCalendar: string;
  rsvpViaWhatsApp: string;
  askViaWhatsApp: string;
  chatOnWhatsApp: string;
  downloadQrCode: string;
  blogPageTitle: string;
  blogPageSubtitle: string;
  readStory: string;
  backToStories: string;
  communityStoryBadge: string;
  submitYourStory: string;
  submitStoryPageTitle: string;
  submitStoryPageSubtitle: string;
  yourNamePh: string;
  yourEmailPh: string;
  storyTitlePh: string;
  storyBodyPh: string;
  submitForReview: string;
  submitStoryStatusDone: string;
  joinPageTitle: string;
  joinPageSubtitle: string;
  howItWorks: string;
  joinStep1: string;
  joinStep2: string;
  joinStep3: string;
  startJourney: string;
  startJourneyBody: string;
  teamPageSubtitle: string;
  contactPageTitle: string;
  contactPageSubtitle: string;
  generalEnquiries: string;
  partnerships: string;
  mediaEnquiry: string;
  partnersPageTitle: string;
  partnersPageSubtitle: string;
  partnerTrack1Title: string;
  partnerTrack1Detail: string;
  partnerTrack2Title: string;
  partnerTrack2Detail: string;
  partnerTrack3Title: string;
  partnerTrack3Detail: string;
  ourPartnersHeading: string;
  readyToPartner: string;
  readyToPartnerBody: string;
  becomePartner: string;
  donatePageTitle: string;
  donatePageSubtitle: string;
  comingSoon: string;
  donationsOpeningTitle: string;
  donationsOpeningBody: string;
  joinOurEvents: string;
  partnerWithSeads: string;
  mediaPageTitle: string;
  mediaPageSubtitle: string;
  photoGallery: string;
  clickToOpenFullscreen: string;
  privacyPageTitle: string;
  privacyLastUpdated: string;
  privacyIntro: string;
  whatWeCollect: string;
  collectFormItemLabel: string;
  collectFormItemBody: string;
  collectBotItemLabel: string;
  collectBotItemBody: string;
  collectErrorItemLabel: string;
  collectErrorItemBody: string;
  noCookiesNote: string;
  whyWeCollect: string;
  whyWeCollectBody: string;
  whereStored: string;
  whereStoredBody: string;
  howLongKept: string;
  howLongKeptBody: string;
  yourRights: string;
  yourRightsBody: string;
  notFoundTitle: string;
  notFoundSubtitle: string;
  tryNavBody: string;
  backToHomepage: string;
  contactUsLink: string;
  portraitPhotoLabel: string;
  mediaFilterAll: string;
  adminLoginPasswordPlaceholder: string;
  adminLoginButton: string;
  adminLoginIncorrectPassword: string;
  adminLoginBackToSite: string;
};

export const translations: Record<Locale, Translation> = {
  en: {
    navHome: "Home", navAbout: "About", navPrograms: "Programs", navEvents: "Events", navStories: "Stories", navMedia: "Media", navDonate: "Donate",
    navGetInvolved: "Get Involved", navNewsroom: "Newsroom", navWhoWeAre: "Who We Are", navPartners: "Partners", navContact: "Contact", navTeam: "Team",
    navMenuToggleOpen: "Open menu", navMenuToggleClose: "Close menu",
    themeToggleToDark: "Switch to dark mode", themeToggleToLight: "Switch to light mode",
    switchLanguageTo: "Switch language to",
    footerPrivacy: "Privacy", footerLocation: "Singapore · est. across SEA",
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
    interestTypeDefault: "I'm interested in...", interestTypeVolunteer: "Volunteering", interestTypePartner: "Partnering with Seads", interestTypeEvent: "Attending an event", interestTypeOther: "Something else",
    statusDone: "Submission captured. Thanks for reaching out — we'll follow up soon.",
    statusError: "Could not submit right now. Please try again.",
    statusUnconfigured: "This form isn't connected yet — please email us directly at hello@seads.sg for now.",
    statusRateLimited: "Too many submissions — please try again in a few minutes.",
    aboutPageTitle: "About Seads",
    aboutPageSubtitle: "Seads is a youth-led non-profit cultivating sustainability, mental health awareness, and personal growth across Southeast Asia.",
    missionHeading: "Our Mission",
    missionBody: "We equip young people with the soil, water, and light to grow — pathways to lead projects, support communities, and co-create solutions with schools, families, and partners across the region.",
    visionHeading: "Our Vision",
    visionBody: "A Southeast Asia where every young person has the same access to support, and the same room to grow into resilient, inclusive, future-ready communities.",
    valuesHeading: "Core Values",
    valueYouthAgency: "Youth agency", valueCommunityTrust: "Community trust", valueActionOverNoise: "Action over noise", valueMeasurableOutcomes: "Measurable outcomes",
    programsPageTitle: "Signature Programs",
    programsPageSubtitle: "Seads initiatives across sustainability, mental health, leadership, innovation, media, and service.",
    learnMore: "Learn more",
    applyLabel: "Apply", joinProgramPrefix: "Join ",
    applyFormBody: "Tell us a bit about yourself and we'll follow up with next steps.",
    anythingElseOptional: "Anything else we should know? (optional)",
    whoItsFor: "Who it's for",
    backToPrograms: "Back to all programs",
    eventsPageTitle: "Events",
    eventsPageSubtitle: "Join upcoming Seads forums, workshops, and volunteer activations.",
    viewDetailsRsvp: "View details & RSVP",
    rsvpLabel: "RSVP", joinUsAtPrefix: "Join us at ",
    rsvpFormBody: "Tell us a bit about yourself and we'll follow up with the details.",
    backToEvents: "Back to all events",
    addToCalendar: "Add to calendar",
    spotsFilledUnit: "spots filled",
    waitlistLabel: "Waitlist — event full",
    joinWaitlist: "Join waitlist",
    subscribeToCalendar: "Subscribe to all events",
    rsvpViaWhatsApp: "RSVP via WhatsApp",
    askViaWhatsApp: "Ask about this on WhatsApp",
    chatOnWhatsApp: "Chat with us on WhatsApp",
    downloadQrCode: "Download QR code",
    blogPageTitle: "Latest Stories",
    blogPageSubtitle: "Fresh stories from Seads programs, events, and community outcomes across Southeast Asia.",
    readStory: "Read story",
    backToStories: "Back to all stories",
    communityStoryBadge: "Community story",
    submitYourStory: "Submit your story",
    submitStoryPageTitle: "Share your story",
    submitStoryPageSubtitle: "Tell us about your experience with Seads — approved stories get published here in English.",
    yourNamePh: "Your name",
    yourEmailPh: "Your email",
    storyTitlePh: "Story title",
    storyBodyPh: "Tell your story...",
    submitForReview: "Submit for review",
    submitStoryStatusDone: "Thanks — your story is in review and we'll be in touch if it's published.",
    joinPageTitle: "Join Seads",
    joinPageSubtitle: "Start your journey as a participant, volunteer, contributor, or community partner.",
    howItWorks: "How it works",
    joinStep1: "Tell us a bit about yourself below",
    joinStep2: "We match you to programs and volunteer tracks that fit",
    joinStep3: "Receive onboarding details from the team",
    startJourney: "Start Your Journey",
    startJourneyBody: "Tell us your interests and we'll suggest relevant tracks in sustainability, mental health, or leadership.",
    teamPageSubtitle: "The people powering Seads across strategy, programs, and community partnerships.",
    contactPageTitle: "Contact",
    contactPageSubtitle: "Reach out for events, collaborations, media, and partnership opportunities.",
    generalEnquiries: "General enquiries", partnerships: "Partnerships", mediaEnquiry: "Media",
    partnersPageTitle: "Partners",
    partnersPageSubtitle: "Seads collaborates with schools, NGOs, and private sector partners across Southeast Asia to multiply community outcomes.",
    partnerTrack1Title: "Schools and institutions",
    partnerTrack1Detail: "Co-develop youth learning pathways and civic leadership experiences.",
    partnerTrack2Title: "Community organizations",
    partnerTrack2Detail: "Scale volunteer delivery and co-create neighborhood impact programs.",
    partnerTrack3Title: "Corporate and sponsors",
    partnerTrack3Detail: "Support high-impact youth projects with resources, mentoring, and expertise.",
    ourPartnersHeading: "Our Partners",
    readyToPartner: "Ready to partner with us?",
    readyToPartnerBody: "Tell us about your organization and what you're looking to do together — we'll follow up to discuss the right fit.",
    becomePartner: "Become a partner",
    donatePageTitle: "Donate",
    donatePageSubtitle: "Help us plant the next seed — support Seads' youth programs and community initiatives.",
    comingSoon: "Coming soon",
    donationsOpeningTitle: "Donations are opening soon",
    donationsOpeningBody: "We are finalizing secure contribution channels and impact transparency workflows. You can still support us by joining events or partnering today.",
    joinOurEvents: "Join Our Events", partnerWithSeads: "Partner with Seads",
    mediaPageTitle: "Media",
    mediaPageSubtitle: "Moments from our programs, events, and youth-led community action across Singapore.",
    photoGallery: "Photo Gallery",
    clickToOpenFullscreen: "Click any image to open fullscreen.",
    privacyPageTitle: "Privacy Policy",
    privacyLastUpdated: "Last updated 13 July 2026.",
    privacyIntro: "This page explains what personal data this website collects, why, and what happens to it. If anything here is unclear, email us at hello@seads.sg.",
    whatWeCollect: "What we collect",
    collectFormItemLabel: "If you submit the “Get Involved” form:",
    collectFormItemBody: "your name, email address, and whatever you write in the optional message field.",
    collectBotItemLabel: "Bot protection:",
    collectBotItemBody: "when you submit the form, Cloudflare Turnstile processes some technical signals from your browser to confirm you're not an automated bot, governed by Cloudflare's own privacy policy.",
    collectErrorItemLabel: "Error diagnostics:",
    collectErrorItemBody: "if something breaks on the site, we may automatically capture technical details about the error (like the browser and page involved) to help us fix it — never intentionally including personal data.",
    noCookiesNote: "We don't use cookies. Your language and light/dark theme preference are saved only in your own browser's local storage — never sent to us or anyone else.",
    whyWeCollect: "Why we collect it",
    whyWeCollectBody: "Solely to respond to your enquiry, follow up about getting involved with Seads, and keep the site working correctly and securely. We don't use your data for advertising, and we don't sell it.",
    whereStored: "Where it's stored",
    whereStoredBody: "Form submissions are stored on Amazon Web Services infrastructure located in Singapore. A notification email is sent to Seads staff when you submit the form.",
    howLongKept: "How long we keep it",
    howLongKeptBody: "We keep your information for as long as reasonably needed to respond to and follow up on your enquiry, or until you ask us to delete it — see below.",
    yourRights: "Your rights",
    yourRightsBody: "You can ask us what personal data we hold about you, ask us to correct it, or ask us to delete it, at any time, by emailing hello@seads.sg.",
    notFoundTitle: "Page not found",
    notFoundSubtitle: "This one didn't take root — the page you're looking for doesn't exist or has moved.",
    tryNavBody: "Try the navigation above, or jump back to one of these:",
    backToHomepage: "Back to homepage", contactUsLink: "Contact us",
    portraitPhotoLabel: "portrait photo", mediaFilterAll: "All",
    adminLoginPasswordPlaceholder: "Password", adminLoginButton: "Log in",
    adminLoginIncorrectPassword: "Incorrect password.", adminLoginBackToSite: "Back to seads.sg",
  },
  zh: {
    navHome: "首页", navAbout: "关于我们", navPrograms: "项目", navEvents: "活动", navStories: "故事", navMedia: "媒体", navDonate: "捐赠",
    navGetInvolved: "参与我们", navNewsroom: "新闻室", navWhoWeAre: "关于我们", navPartners: "合作伙伴", navContact: "联系我们", navTeam: "团队",
    navMenuToggleOpen: "打开菜单", navMenuToggleClose: "关闭菜单",
    themeToggleToDark: "切换至深色模式", themeToggleToLight: "切换至浅色模式",
    switchLanguageTo: "切换语言为",
    footerPrivacy: "隐私政策", footerLocation: "新加坡 · 服务东南亚",
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
    interestTypeDefault: "我感兴趣的是...", interestTypeVolunteer: "志愿服务", interestTypePartner: "与 Seads 合作", interestTypeEvent: "参加活动", interestTypeOther: "其他",
    statusDone: "提交成功，感谢您的联系——我们会尽快跟进。",
    statusError: "暂时无法提交，请重试。",
    statusUnconfigured: "此表单尚未连接——请直接发送电子邮件至 hello@seads.sg。",
    statusRateLimited: "提交次数过多，请几分钟后再试。",
    aboutPageTitle: "关于 Seads",
    aboutPageSubtitle: "Seads 是一个植根于可持续发展、心理健康意识和东南亚青年个人成长的青年主导非营利组织。",
    missionHeading: "我们的使命",
    missionBody: "我们为年轻人提供成长所需的土壤、水分和阳光——带领项目、支持社区，并与学校、家庭和区域内的合作伙伴共同创造解决方案的途径。",
    visionHeading: "我们的愿景",
    visionBody: "一个东南亚：每一位年轻人都拥有同等的支持渠道，以及同等的空间成长为坚韧、包容、面向未来的社区一员。",
    valuesHeading: "核心价值观",
    valueYouthAgency: "青年自主性", valueCommunityTrust: "社区信任", valueActionOverNoise: "行动胜于空谈", valueMeasurableOutcomes: "可衡量的成果",
    programsPageTitle: "特色项目",
    programsPageSubtitle: "Seads 在可持续发展、心理健康、领导力、创新、媒体和服务等领域开展的项目。",
    learnMore: "了解更多",
    applyLabel: "申请", joinProgramPrefix: "加入",
    applyFormBody: "告诉我们一些关于您的信息，我们会跟进后续步骤。",
    anythingElseOptional: "还有什么我们应该知道的吗？（可选）",
    whoItsFor: "适合人群",
    backToPrograms: "返回所有项目",
    eventsPageTitle: "活动",
    eventsPageSubtitle: "参加即将举行的 Seads 论坛、工作坊和志愿活动。",
    viewDetailsRsvp: "查看详情并报名",
    rsvpLabel: "报名", joinUsAtPrefix: "参加",
    rsvpFormBody: "告诉我们一些关于您的信息，我们会跟进详细安排。",
    backToEvents: "返回所有活动",
    addToCalendar: "添加到日历",
    spotsFilledUnit: "个名额已满",
    waitlistLabel: "候补名单——名额已满",
    joinWaitlist: "加入候补名单",
    subscribeToCalendar: "订阅所有活动",
    rsvpViaWhatsApp: "通过 WhatsApp 报名",
    askViaWhatsApp: "通过 WhatsApp 咨询",
    chatOnWhatsApp: "通过 WhatsApp 与我们联系",
    downloadQrCode: "下载二维码",
    blogPageTitle: "最新故事",
    blogPageSubtitle: "来自 Seads 项目、活动和东南亚社区成果的最新故事。",
    readStory: "阅读故事",
    backToStories: "返回所有故事",
    communityStoryBadge: "社区故事",
    submitYourStory: "分享您的故事",
    submitStoryPageTitle: "分享您的故事",
    submitStoryPageSubtitle: "告诉我们您与 Seads 的经历——审核通过的故事将以英文发布于此。",
    yourNamePh: "您的姓名",
    yourEmailPh: "您的电子邮箱",
    storyTitlePh: "故事标题",
    storyBodyPh: "讲述您的故事……",
    submitForReview: "提交审核",
    submitStoryStatusDone: "谢谢——您的故事正在审核中，如获发布我们会通知您。",
    joinPageTitle: "加入 Seads",
    joinPageSubtitle: "以参与者、志愿者、贡献者或社区合作伙伴的身份开启您的旅程。",
    howItWorks: "运作方式",
    joinStep1: "在下方告诉我们一些关于您的信息",
    joinStep2: "我们为您匹配合适的项目和志愿服务方向",
    joinStep3: "接收团队发送的入门详情",
    startJourney: "开启您的旅程",
    startJourneyBody: "告诉我们您的兴趣，我们会为您推荐可持续发展、心理健康或领导力方面的相关方向。",
    teamPageSubtitle: "在战略、项目和社区合作方面推动 Seads 前进的团队成员。",
    contactPageTitle: "联系我们",
    contactPageSubtitle: "欢迎联系我们，探讨活动、合作、媒体及伙伴关系机会。",
    generalEnquiries: "一般咨询", partnerships: "合作伙伴关系", mediaEnquiry: "媒体",
    partnersPageTitle: "合作伙伴",
    partnersPageSubtitle: "Seads 与学校、非政府组织和企业合作伙伴携手，在东南亚扩大社区影响力。",
    partnerTrack1Title: "学校与教育机构",
    partnerTrack1Detail: "共同开发青年学习路径和公民领导力体验。",
    partnerTrack2Title: "社区组织",
    partnerTrack2Detail: "扩大志愿服务规模，共同打造社区影响力项目。",
    partnerTrack3Title: "企业与赞助商",
    partnerTrack3Detail: "以资源、指导和专业知识支持高影响力的青年项目。",
    ourPartnersHeading: "我们的合作伙伴",
    readyToPartner: "准备好与我们合作了吗？",
    readyToPartnerBody: "告诉我们您所在的组织以及您希望共同开展的合作内容——我们会跟进讨论合适的合作方式。",
    becomePartner: "成为合作伙伴",
    donatePageTitle: "捐赠",
    donatePageSubtitle: "帮助我们播下下一颗种子——支持 Seads 的青年项目和社区行动。",
    comingSoon: "敬请期待",
    donationsOpeningTitle: "捐赠通道即将开放",
    donationsOpeningBody: "我们正在完善安全的捐赠渠道和影响力透明流程。您现在仍可通过参加活动或成为合作伙伴来支持我们。",
    joinOurEvents: "参加我们的活动", partnerWithSeads: "与 Seads 合作",
    mediaPageTitle: "媒体",
    mediaPageSubtitle: "记录我们在新加坡的项目、活动和青年主导社区行动的精彩瞬间。",
    photoGallery: "照片图库",
    clickToOpenFullscreen: "点击任意图片以全屏查看。",
    privacyPageTitle: "隐私政策",
    privacyLastUpdated: "最近更新：2026 年 7 月 13 日。",
    privacyIntro: "本页说明本网站收集哪些个人数据、原因以及处理方式。如有任何不清楚之处，请发送电子邮件至 hello@seads.sg。",
    whatWeCollect: "我们收集的信息",
    collectFormItemLabel: "如果您提交“参与我们”表单：",
    collectFormItemBody: "我们会收集您的姓名、电子邮箱地址，以及您在可选留言栏中填写的任何内容。",
    collectBotItemLabel: "机器人防护：",
    collectBotItemBody: "当您提交表单时，Cloudflare Turnstile 会处理来自您浏览器的一些技术信号，以确认您不是自动化机器人，这一过程受 Cloudflare 自身隐私政策约束。",
    collectErrorItemLabel: "错误诊断：",
    collectErrorItemBody: "如果网站出现故障，我们可能会自动收集有关该错误的技术细节（例如涉及的浏览器和页面）以帮助我们修复问题——绝不会有意包含个人数据。",
    noCookiesNote: "我们不使用 Cookie。您的语言和浅色/深色主题偏好仅保存在您自己浏览器的本地存储中——绝不会发送给我们或任何其他人。",
    whyWeCollect: "我们收集信息的原因",
    whyWeCollectBody: "仅用于回复您的咨询、跟进您参与 Seads 的意向，以及确保网站正常安全运行。我们不会将您的数据用于广告，也不会出售您的数据。",
    whereStored: "存储位置",
    whereStoredBody: "表单提交的内容存储在位于新加坡的亚马逊云服务（AWS）基础设施上。当您提交表单时，系统会向 Seads 工作人员发送通知邮件。",
    howLongKept: "我们保留信息的时长",
    howLongKeptBody: "我们会在合理需要的时间内保留您的信息，以回复和跟进您的咨询，直至您要求我们删除为止——详见下文。",
    yourRights: "您的权利",
    yourRightsBody: "您可以随时通过发送电子邮件至 hello@seads.sg，询问我们持有您哪些个人数据、要求更正，或要求删除。",
    notFoundTitle: "页面未找到",
    notFoundSubtitle: "这颗种子还未生根——您要找的页面不存在或已被移动。",
    tryNavBody: "请尝试使用上方的导航菜单，或返回以下页面：",
    backToHomepage: "返回首页", contactUsLink: "联系我们",
    portraitPhotoLabel: "肖像照片", mediaFilterAll: "全部",
    adminLoginPasswordPlaceholder: "密码", adminLoginButton: "登录",
    adminLoginIncorrectPassword: "密码错误。", adminLoginBackToSite: "返回 seads.sg",
  },
  ms: {
    navHome: "Laman Utama", navAbout: "Tentang Kami", navPrograms: "Program", navEvents: "Acara", navStories: "Kisah", navMedia: "Media", navDonate: "Derma",
    navGetInvolved: "Sertai Kami", navNewsroom: "Bilik Berita", navWhoWeAre: "Siapa Kami", navPartners: "Rakan Kongsi", navContact: "Hubungi", navTeam: "Pasukan",
    navMenuToggleOpen: "Buka menu", navMenuToggleClose: "Tutup menu",
    themeToggleToDark: "Tukar ke mod gelap", themeToggleToLight: "Tukar ke mod cerah",
    switchLanguageTo: "Tukar bahasa kepada",
    footerPrivacy: "Privasi", footerLocation: "Singapura · berkhidmat di seluruh Asia Tenggara",
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
    interestTypeDefault: "Saya berminat dengan...", interestTypeVolunteer: "Menjadi sukarelawan", interestTypePartner: "Bekerjasama dengan Seads", interestTypeEvent: "Menghadiri acara", interestTypeOther: "Perkara lain",
    statusDone: "Penyerahan berjaya direkodkan. Terima kasih kerana menghubungi kami — kami akan hubungi anda semula.",
    statusError: "Tidak dapat menghantar sekarang. Sila cuba lagi.",
    statusUnconfigured: "Borang ini belum disambungkan — sila e-mel kami terus di hello@seads.sg buat masa ini.",
    statusRateLimited: "Terlalu banyak penyerahan — sila cuba lagi dalam beberapa minit.",
    aboutPageTitle: "Tentang Seads",
    aboutPageSubtitle: "Seads ialah pertubuhan bukan untung diterajui belia yang memupuk kelestarian, kesedaran kesihatan mental, dan pertumbuhan peribadi di seluruh Asia Tenggara.",
    missionHeading: "Misi Kami",
    missionBody: "Kami membekalkan belia dengan tanah, air, dan cahaya untuk membesar — laluan untuk mengetuai projek, menyokong komuniti, dan mencipta bersama penyelesaian dengan sekolah, keluarga, dan rakan kongsi di seluruh rantau ini.",
    visionHeading: "Visi Kami",
    visionBody: "Sebuah Asia Tenggara di mana setiap belia mempunyai akses sokongan yang sama, dan ruang yang sama untuk membesar menjadi komuniti yang berdaya tahan, inklusif, dan bersedia untuk masa depan.",
    valuesHeading: "Nilai Teras",
    valueYouthAgency: "Autonomi belia", valueCommunityTrust: "Kepercayaan komuniti", valueActionOverNoise: "Tindakan mengatasi bising", valueMeasurableOutcomes: "Hasil yang boleh diukur",
    programsPageTitle: "Program Utama",
    programsPageSubtitle: "Inisiatif Seads merangkumi kelestarian, kesihatan mental, kepimpinan, inovasi, media, dan perkhidmatan.",
    learnMore: "Ketahui lebih lanjut",
    applyLabel: "Mohon", joinProgramPrefix: "Sertai ",
    applyFormBody: "Beritahu kami sedikit tentang diri anda dan kami akan hubungi anda semula dengan langkah seterusnya.",
    anythingElseOptional: "Ada perkara lain yang perlu kami tahu? (pilihan)",
    whoItsFor: "Untuk siapa",
    backToPrograms: "Kembali ke semua program",
    eventsPageTitle: "Acara",
    eventsPageSubtitle: "Sertai forum, bengkel, dan aktiviti sukarelawan Seads yang akan datang.",
    viewDetailsRsvp: "Lihat butiran & RSVP",
    rsvpLabel: "RSVP", joinUsAtPrefix: "Sertai kami di ",
    rsvpFormBody: "Beritahu kami sedikit tentang diri anda dan kami akan hubungi anda semula dengan butiran lanjut.",
    backToEvents: "Kembali ke semua acara",
    addToCalendar: "Tambah ke kalendar",
    spotsFilledUnit: "tempat telah diisi",
    waitlistLabel: "Senarai menunggu — acara penuh",
    joinWaitlist: "Sertai senarai menunggu",
    subscribeToCalendar: "Langgan semua acara",
    rsvpViaWhatsApp: "RSVP melalui WhatsApp",
    askViaWhatsApp: "Bertanya melalui WhatsApp",
    chatOnWhatsApp: "Berbual dengan kami di WhatsApp",
    downloadQrCode: "Muat turun kod QR",
    blogPageTitle: "Kisah Terkini",
    blogPageSubtitle: "Kisah terbaharu daripada program, acara, dan hasil komuniti Seads di seluruh Asia Tenggara.",
    readStory: "Baca kisah",
    backToStories: "Kembali ke semua kisah",
    communityStoryBadge: "Kisah komuniti",
    submitYourStory: "Kongsi kisah anda",
    submitStoryPageTitle: "Kongsi kisah anda",
    submitStoryPageSubtitle: "Beritahu kami pengalaman anda bersama Seads — kisah yang diluluskan akan diterbitkan di sini dalam bahasa Inggeris.",
    yourNamePh: "Nama anda",
    yourEmailPh: "E-mel anda",
    storyTitlePh: "Tajuk kisah",
    storyBodyPh: "Ceritakan kisah anda...",
    submitForReview: "Hantar untuk semakan",
    submitStoryStatusDone: "Terima kasih — kisah anda sedang disemak dan kami akan hubungi anda jika ia diterbitkan.",
    joinPageTitle: "Sertai Seads",
    joinPageSubtitle: "Mulakan perjalanan anda sebagai peserta, sukarelawan, penyumbang, atau rakan kongsi komuniti.",
    howItWorks: "Cara ia berfungsi",
    joinStep1: "Beritahu kami sedikit tentang diri anda di bawah",
    joinStep2: "Kami padankan anda dengan program dan laluan sukarelawan yang sesuai",
    joinStep3: "Terima butiran onboarding daripada pasukan kami",
    startJourney: "Mulakan Perjalanan Anda",
    startJourneyBody: "Beritahu kami minat anda dan kami akan cadangkan laluan berkaitan dalam kelestarian, kesihatan mental, atau kepimpinan.",
    teamPageSubtitle: "Orang-orang yang menggerakkan Seads merentasi strategi, program, dan perkongsian komuniti.",
    contactPageTitle: "Hubungi Kami",
    contactPageSubtitle: "Hubungi kami untuk acara, kerjasama, media, dan peluang perkongsian.",
    generalEnquiries: "Pertanyaan am", partnerships: "Perkongsian", mediaEnquiry: "Media",
    partnersPageTitle: "Rakan Kongsi",
    partnersPageSubtitle: "Seads bekerjasama dengan sekolah, NGO, dan rakan kongsi sektor swasta di seluruh Asia Tenggara untuk menggandakan hasil komuniti.",
    partnerTrack1Title: "Sekolah dan institusi",
    partnerTrack1Detail: "Membangunkan bersama laluan pembelajaran belia dan pengalaman kepimpinan sivik.",
    partnerTrack2Title: "Organisasi komuniti",
    partnerTrack2Detail: "Memperluas penyampaian sukarelawan dan mencipta bersama program impak kejiranan.",
    partnerTrack3Title: "Korporat dan penaja",
    partnerTrack3Detail: "Menyokong projek belia berimpak tinggi dengan sumber, bimbingan, dan kepakaran.",
    ourPartnersHeading: "Rakan Kongsi Kami",
    readyToPartner: "Bersedia untuk bekerjasama dengan kami?",
    readyToPartnerBody: "Beritahu kami tentang organisasi anda dan apa yang anda ingin lakukan bersama — kami akan hubungi anda semula untuk membincangkan kesesuaian.",
    becomePartner: "Jadi rakan kongsi",
    donatePageTitle: "Derma",
    donatePageSubtitle: "Bantu kami menyemai benih seterusnya — sokong program belia dan inisiatif komuniti Seads.",
    comingSoon: "Akan datang",
    donationsOpeningTitle: "Saluran derma akan dibuka tidak lama lagi",
    donationsOpeningBody: "Kami sedang memuktamadkan saluran sumbangan yang selamat dan aliran kerja ketelusan impak. Anda masih boleh menyokong kami dengan menyertai acara atau menjadi rakan kongsi hari ini.",
    joinOurEvents: "Sertai Acara Kami", partnerWithSeads: "Bekerjasama dengan Seads",
    mediaPageTitle: "Media",
    mediaPageSubtitle: "Detik-detik daripada program, acara, dan tindakan komuniti diterajui belia kami di seluruh Singapura.",
    photoGallery: "Galeri Foto",
    clickToOpenFullscreen: "Klik mana-mana imej untuk buka skrin penuh.",
    privacyPageTitle: "Dasar Privasi",
    privacyLastUpdated: "Terakhir dikemas kini 13 Julai 2026.",
    privacyIntro: "Halaman ini menerangkan data peribadi yang dikumpul oleh laman web ini, sebabnya, dan apa yang berlaku kepadanya. Jika ada apa-apa yang tidak jelas, e-mel kami di hello@seads.sg.",
    whatWeCollect: "Apa yang kami kumpul",
    collectFormItemLabel: "Jika anda menghantar borang “Sertai Kami”:",
    collectFormItemBody: "nama, alamat e-mel anda, dan apa sahaja yang anda tulis dalam ruangan mesej pilihan.",
    collectBotItemLabel: "Perlindungan bot:",
    collectBotItemBody: "apabila anda menghantar borang, Cloudflare Turnstile memproses beberapa isyarat teknikal daripada pelayar anda untuk mengesahkan anda bukan bot automatik, tertakluk kepada dasar privasi Cloudflare sendiri.",
    collectErrorItemLabel: "Diagnostik ralat:",
    collectErrorItemBody: "jika sesuatu rosak pada laman, kami mungkin secara automatik merekod butiran teknikal tentang ralat itu (seperti pelayar dan halaman yang terlibat) untuk membantu kami membaikinya — tidak sesekali termasuk data peribadi dengan sengaja.",
    noCookiesNote: "Kami tidak menggunakan kuki. Keutamaan bahasa dan tema terang/gelap anda disimpan hanya dalam storan tempatan pelayar anda sendiri — tidak pernah dihantar kepada kami atau sesiapa sahaja.",
    whyWeCollect: "Sebab kami mengumpulnya",
    whyWeCollectBody: "Semata-mata untuk menjawab pertanyaan anda, menghubungi anda semula tentang penyertaan dengan Seads, dan memastikan laman berfungsi dengan betul dan selamat. Kami tidak menggunakan data anda untuk pengiklanan, dan kami tidak menjualnya.",
    whereStored: "Di mana ia disimpan",
    whereStoredBody: "Penyerahan borang disimpan pada infrastruktur Amazon Web Services yang terletak di Singapura. E-mel pemberitahuan dihantar kepada kakitangan Seads apabila anda menghantar borang.",
    howLongKept: "Berapa lama kami menyimpannya",
    howLongKeptBody: "Kami menyimpan maklumat anda selama yang munasabah diperlukan untuk menjawab dan menghubungi anda semula tentang pertanyaan anda, atau sehingga anda meminta kami memadamkannya — lihat di bawah.",
    yourRights: "Hak anda",
    yourRightsBody: "Anda boleh bertanya kepada kami data peribadi apa yang kami simpan tentang anda, meminta kami membetulkannya, atau meminta kami memadamkannya, pada bila-bila masa, dengan menghantar e-mel ke hello@seads.sg.",
    notFoundTitle: "Halaman tidak dijumpai",
    notFoundSubtitle: "Yang ini tidak berakar — halaman yang anda cari tidak wujud atau telah dipindahkan.",
    tryNavBody: "Cuba navigasi di atas, atau kembali ke salah satu daripada ini:",
    backToHomepage: "Kembali ke laman utama", contactUsLink: "Hubungi kami",
    portraitPhotoLabel: "foto potret", mediaFilterAll: "Semua",
    adminLoginPasswordPlaceholder: "Kata laluan", adminLoginButton: "Log masuk",
    adminLoginIncorrectPassword: "Kata laluan salah.", adminLoginBackToSite: "Kembali ke seads.sg",
  },
  hi: {
    navHome: "होम", navAbout: "हमारे बारे में", navPrograms: "कार्यक्रम", navEvents: "इवेंट्स", navStories: "कहानियाँ", navMedia: "मीडिया", navDonate: "दान करें",
    navGetInvolved: "जुड़ें", navNewsroom: "न्यूज़रूम", navWhoWeAre: "हम कौन हैं", navPartners: "साझेदार", navContact: "संपर्क करें", navTeam: "टीम",
    navMenuToggleOpen: "मेनू खोलें", navMenuToggleClose: "मेनू बंद करें",
    themeToggleToDark: "डार्क मोड में बदलें", themeToggleToLight: "लाइट मोड में बदलें",
    switchLanguageTo: "भाषा बदलकर करें",
    footerPrivacy: "गोपनीयता", footerLocation: "सिंगापुर · दक्षिण-पूर्व एशिया में सेवारत",
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
    interestTypeDefault: "मेरी रुचि है...", interestTypeVolunteer: "स्वयंसेवा में", interestTypePartner: "सीड्स के साथ साझेदारी में", interestTypeEvent: "किसी इवेंट में शामिल होने में", interestTypeOther: "कुछ और",
    statusDone: "सबमिशन दर्ज हो गया। संपर्क करने के लिए धन्यवाद — हम जल्द ही आपसे संपर्क करेंगे।",
    statusError: "अभी सबमिट नहीं हो सका। कृपया पुनः प्रयास करें।",
    statusUnconfigured: "यह फ़ॉर्म अभी कनेक्ट नहीं है — कृपया अभी के लिए सीधे hello@seads.sg पर ईमेल करें।",
    statusRateLimited: "बहुत अधिक सबमिशन — कृपया कुछ मिनटों में फिर से प्रयास करें।",
    aboutPageTitle: "सीड्स के बारे में",
    aboutPageSubtitle: "सीड्स एक युवा-नेतृत्व वाला गैर-लाभकारी संगठन है जो दक्षिण-पूर्व एशिया में स्थिरता, मानसिक स्वास्थ्य जागरूकता और व्यक्तिगत विकास को बढ़ावा देता है।",
    missionHeading: "हमारा मिशन",
    missionBody: "हम युवाओं को बढ़ने के लिए मिट्टी, पानी और रोशनी से लैस करते हैं — परियोजनाओं का नेतृत्व करने, समुदायों का समर्थन करने, और क्षेत्र भर के स्कूलों, परिवारों और साझेदारों के साथ मिलकर समाधान बनाने के रास्ते।",
    visionHeading: "हमारी दृष्टि",
    visionBody: "एक ऐसा दक्षिण-पूर्व एशिया जहाँ हर युवा को समान सहयोग तक पहुंच हो, और लचीले, समावेशी, भविष्य के लिए तैयार समुदायों में विकसित होने के लिए समान स्थान हो।",
    valuesHeading: "मूल मूल्य",
    valueYouthAgency: "युवा स्वायत्तता", valueCommunityTrust: "सामुदायिक विश्वास", valueActionOverNoise: "शोर से अधिक कार्रवाई", valueMeasurableOutcomes: "मापने योग्य परिणाम",
    programsPageTitle: "प्रमुख कार्यक्रम",
    programsPageSubtitle: "स्थिरता, मानसिक स्वास्थ्य, नेतृत्व, नवाचार, मीडिया और सेवा में सीड्स की पहलें।",
    learnMore: "और जानें",
    applyLabel: "आवेदन करें", joinProgramPrefix: "शामिल हों ",
    applyFormBody: "हमें अपने बारे में थोड़ा बताएं और हम अगले कदमों के साथ संपर्क करेंगे।",
    anythingElseOptional: "क्या हमें कुछ और जानना चाहिए? (वैकल्पिक)",
    whoItsFor: "यह किसके लिए है",
    backToPrograms: "सभी कार्यक्रमों पर वापस जाएं",
    eventsPageTitle: "इवेंट्स",
    eventsPageSubtitle: "आगामी सीड्स फोरम, कार्यशालाओं और स्वयंसेवी गतिविधियों में शामिल हों।",
    viewDetailsRsvp: "विवरण देखें और आरएसवीपी करें",
    rsvpLabel: "आरएसवीपी", joinUsAtPrefix: "हमारे साथ शामिल हों ",
    rsvpFormBody: "हमें अपने बारे में थोड़ा बताएं और हम विवरण के साथ संपर्क करेंगे।",
    backToEvents: "सभी कार्यक्रमों पर वापस जाएं",
    addToCalendar: "कैलेंडर में जोड़ें",
    spotsFilledUnit: "सीटें भर चुकी हैं",
    waitlistLabel: "प्रतीक्षा सूची — कार्यक्रम पूर्ण भरा हुआ",
    joinWaitlist: "प्रतीक्षा सूची में शामिल हों",
    subscribeToCalendar: "सभी कार्यक्रमों की सदस्यता लें",
    rsvpViaWhatsApp: "WhatsApp के ज़रिए RSVP करें",
    askViaWhatsApp: "WhatsApp पर पूछें",
    chatOnWhatsApp: "WhatsApp पर हमसे बात करें",
    downloadQrCode: "क्यूआर कोड डाउनलोड करें",
    blogPageTitle: "नवीनतम कहानियाँ",
    blogPageSubtitle: "सीड्स के कार्यक्रमों, इवेंट्स और दक्षिण-पूर्व एशिया भर के सामुदायिक परिणामों की ताज़ा कहानियाँ।",
    readStory: "कहानी पढ़ें",
    backToStories: "सभी कहानियों पर वापस जाएं",
    communityStoryBadge: "सामुदायिक कहानी",
    submitYourStory: "अपनी कहानी साझा करें",
    submitStoryPageTitle: "अपनी कहानी साझा करें",
    submitStoryPageSubtitle: "हमें Seads के साथ अपने अनुभव के बारे में बताएं — स्वीकृत कहानियां यहां अंग्रेज़ी में प्रकाशित की जाती हैं।",
    yourNamePh: "आपका नाम",
    yourEmailPh: "आपका ईमेल",
    storyTitlePh: "कहानी का शीर्षक",
    storyBodyPh: "अपनी कहानी बताएं...",
    submitForReview: "समीक्षा के लिए सबमिट करें",
    submitStoryStatusDone: "धन्यवाद — आपकी कहानी समीक्षा में है और प्रकाशित होने पर हम आपसे संपर्क करेंगे।",
    joinPageTitle: "सीड्स से जुड़ें",
    joinPageSubtitle: "एक प्रतिभागी, स्वयंसेवक, योगदानकर्ता, या सामुदायिक साझेदार के रूप में अपनी यात्रा शुरू करें।",
    howItWorks: "यह कैसे काम करता है",
    joinStep1: "नीचे हमें अपने बारे में थोड़ा बताएं",
    joinStep2: "हम आपको उपयुक्त कार्यक्रमों और स्वयंसेवी ट्रैक से मिलाते हैं",
    joinStep3: "टीम से ऑनबोर्डिंग विवरण प्राप्त करें",
    startJourney: "अपनी यात्रा शुरू करें",
    startJourneyBody: "हमें अपनी रुचियां बताएं और हम स्थिरता, मानसिक स्वास्थ्य, या नेतृत्व से जुड़े प्रासंगिक ट्रैक सुझाएंगे।",
    teamPageSubtitle: "रणनीति, कार्यक्रमों और सामुदायिक साझेदारी में सीड्स को आगे बढ़ाने वाले लोग।",
    contactPageTitle: "संपर्क करें",
    contactPageSubtitle: "इवेंट्स, सहयोग, मीडिया और साझेदारी के अवसरों के लिए संपर्क करें।",
    generalEnquiries: "सामान्य पूछताछ", partnerships: "साझेदारी", mediaEnquiry: "मीडिया",
    partnersPageTitle: "साझेदार",
    partnersPageSubtitle: "सीड्स सामुदायिक परिणामों को कई गुना बढ़ाने के लिए दक्षिण-पूर्व एशिया भर के स्कूलों, एनजीओ और निजी क्षेत्र के साझेदारों के साथ सहयोग करता है।",
    partnerTrack1Title: "स्कूल और संस्थान",
    partnerTrack1Detail: "युवा शिक्षण मार्गों और नागरिक नेतृत्व अनुभवों को साथ मिलकर विकसित करें।",
    partnerTrack2Title: "सामुदायिक संगठन",
    partnerTrack2Detail: "स्वयंसेवी वितरण को बढ़ाएं और पड़ोस प्रभाव कार्यक्रमों का सह-निर्माण करें।",
    partnerTrack3Title: "कॉर्पोरेट और प्रायोजक",
    partnerTrack3Detail: "संसाधनों, मेंटरशिप और विशेषज्ञता के साथ उच्च-प्रभाव वाली युवा परियोजनाओं का समर्थन करें।",
    ourPartnersHeading: "हमारे साझेदार",
    readyToPartner: "हमारे साथ साझेदारी के लिए तैयार हैं?",
    readyToPartnerBody: "हमें अपने संगठन के बारे में बताएं और आप साथ मिलकर क्या करना चाहते हैं — हम सही तालमेल पर चर्चा करने के लिए संपर्क करेंगे।",
    becomePartner: "साझेदार बनें",
    donatePageTitle: "दान करें",
    donatePageSubtitle: "अगला बीज बोने में हमारी मदद करें — सीड्स के युवा कार्यक्रमों और सामुदायिक पहलों का समर्थन करें।",
    comingSoon: "जल्द आ रहा है",
    donationsOpeningTitle: "दान जल्द ही शुरू हो रहा है",
    donationsOpeningBody: "हम सुरक्षित योगदान चैनल और प्रभाव पारदर्शिता वर्कफ़्लो को अंतिम रूप दे रहे हैं। आप आज इवेंट्स में शामिल होकर या साझेदार बनकर भी हमारा समर्थन कर सकते हैं।",
    joinOurEvents: "हमारे इवेंट्स में शामिल हों", partnerWithSeads: "सीड्स के साथ साझेदारी करें",
    mediaPageTitle: "मीडिया",
    mediaPageSubtitle: "सिंगापुर भर में हमारे कार्यक्रमों, इवेंट्स और युवा-नेतृत्व वाली सामुदायिक कार्रवाई के पल।",
    photoGallery: "फोटो गैलरी",
    clickToOpenFullscreen: "फ़ुलस्क्रीन में खोलने के लिए किसी भी छवि पर क्लिक करें।",
    privacyPageTitle: "गोपनीयता नीति",
    privacyLastUpdated: "अंतिम बार अपडेट किया गया 13 जुलाई 2026।",
    privacyIntro: "यह पृष्ठ बताता है कि यह वेबसाइट कौन-सा व्यक्तिगत डेटा एकत्र करती है, क्यों, और उसका क्या होता है। यदि यहाँ कुछ भी अस्पष्ट है, तो हमें hello@seads.sg पर ईमेल करें।",
    whatWeCollect: "हम क्या एकत्र करते हैं",
    collectFormItemLabel: "यदि आप “जुड़ें” फ़ॉर्म सबमिट करते हैं:",
    collectFormItemBody: "आपका नाम, ईमेल पता, और वैकल्पिक संदेश फ़ील्ड में आपके द्वारा लिखी गई कोई भी बात।",
    collectBotItemLabel: "बॉट सुरक्षा:",
    collectBotItemBody: "जब आप फ़ॉर्म सबमिट करते हैं, तो Cloudflare Turnstile यह पुष्टि करने के लिए आपके ब्राउज़र से कुछ तकनीकी संकेत प्रोसेस करता है कि आप एक स्वचालित बॉट नहीं हैं, जो Cloudflare की अपनी गोपनीयता नीति द्वारा शासित है।",
    collectErrorItemLabel: "त्रुटि निदान:",
    collectErrorItemBody: "यदि साइट पर कुछ टूट जाता है, तो हम उस त्रुटि के बारे में तकनीकी विवरण (जैसे शामिल ब्राउज़र और पृष्ठ) स्वचालित रूप से एकत्र कर सकते हैं ताकि हमें इसे ठीक करने में मदद मिल सके — इसमें जानबूझकर कभी भी व्यक्तिगत डेटा शामिल नहीं किया जाता।",
    noCookiesNote: "हम कुकीज़ का उपयोग नहीं करते। आपकी भाषा और लाइट/डार्क थीम प्राथमिकता केवल आपके अपने ब्राउज़र के लोकल स्टोरेज में सहेजी जाती है — यह कभी भी हमें या किसी और को नहीं भेजी जाती।",
    whyWeCollect: "हम इसे क्यों एकत्र करते हैं",
    whyWeCollectBody: "केवल आपकी पूछताछ का जवाब देने, सीड्स से जुड़ने के बारे में संपर्क करने, और साइट को सही और सुरक्षित रूप से चलाने के लिए। हम आपके डेटा का उपयोग विज्ञापन के लिए नहीं करते, और न ही इसे बेचते हैं।",
    whereStored: "यह कहाँ संग्रहीत है",
    whereStoredBody: "फ़ॉर्म सबमिशन सिंगापुर में स्थित अमेज़न वेब सर्विसेज़ के इंफ्रास्ट्रक्चर पर संग्रहीत किए जाते हैं। जब आप फ़ॉर्म सबमिट करते हैं तो सीड्स स्टाफ़ को एक सूचना ईमेल भेजा जाता है।",
    howLongKept: "हम इसे कितने समय तक रखते हैं",
    howLongKeptBody: "हम आपकी जानकारी को आपकी पूछताछ का जवाब देने और उसका फॉलो-अप करने के लिए उचित रूप से आवश्यक समय तक रखते हैं, या जब तक आप हमसे इसे हटाने के लिए नहीं कहते — नीचे देखें।",
    yourRights: "आपके अधिकार",
    yourRightsBody: "आप किसी भी समय hello@seads.sg पर ईमेल करके हमसे पूछ सकते हैं कि हमारे पास आपका कौन-सा व्यक्तिगत डेटा है, हमसे इसे सही करने के लिए कह सकते हैं, या इसे हटाने के लिए कह सकते हैं।",
    notFoundTitle: "पृष्ठ नहीं मिला",
    notFoundSubtitle: "यह जड़ नहीं पकड़ सका — जिस पृष्ठ को आप खोज रहे हैं वह मौजूद नहीं है या स्थानांतरित हो गया है।",
    tryNavBody: "ऊपर दिए गए नेविगेशन का प्रयास करें, या इनमें से किसी एक पर वापस जाएं:",
    backToHomepage: "होमपेज पर वापस जाएं", contactUsLink: "हमसे संपर्क करें",
    portraitPhotoLabel: "पोर्ट्रेट फोटो", mediaFilterAll: "सभी",
    adminLoginPasswordPlaceholder: "पासवर्ड", adminLoginButton: "लॉग इन करें",
    adminLoginIncorrectPassword: "गलत पासवर्ड।", adminLoginBackToSite: "seads.sg पर वापस जाएं",
  },
};
