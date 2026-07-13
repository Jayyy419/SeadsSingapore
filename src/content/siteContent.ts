import type { Locale } from "@/content/i18n";

export type LocalizedString = Record<Locale, string>;

export type ImpactMetric = {
  value: string;
  label: LocalizedString;
  note: LocalizedString;
};

export type Program = {
  slug: string;
  tag: LocalizedString;
  name: LocalizedString;
  description: LocalizedString;
  body: Record<Locale, string[]>;
  who: LocalizedString;
};

export type EventItem = {
  slug: string;
  type: LocalizedString;
  title: LocalizedString;
  date: string;
  location: LocalizedString;
  body: Record<Locale, string[]>;
};

export type Story = {
  slug: string;
  category: LocalizedString;
  title: LocalizedString;
  excerpt: LocalizedString;
  body: Record<Locale, string[]>;
};

export type Testimonial = {
  quote: LocalizedString;
  author: LocalizedString;
};

export type TeamMember = {
  name: string;
  role: LocalizedString;
  bio: LocalizedString;
};

export const impactMetrics: ImpactMetric[] = [
  {
    value: "40K+",
    label: { en: "Youths reached", zh: "触达青年", ms: "Belia dihubungi", hi: "पहुंचे गए युवा" },
    note: {
      en: "Across schools and community networks in SEA",
      zh: "覆盖东南亚各地学校与社区网络",
      ms: "Merentasi sekolah dan rangkaian komuniti di Asia Tenggara",
      hi: "दक्षिण-पूर्व एशिया के स्कूलों और सामुदायिक नेटवर्क में",
    },
  },
  {
    value: "150+",
    label: { en: "Programs delivered", zh: "已开展项目", ms: "Program dilaksanakan", hi: "आयोजित कार्यक्रम" },
    note: {
      en: "Leadership camps, service projects, and forums",
      zh: "领导力营、服务项目和论坛",
      ms: "Kem kepimpinan, projek perkhidmatan, dan forum",
      hi: "नेतृत्व शिविर, सेवा परियोजनाएं और फोरम",
    },
  },
  {
    value: "500+",
    label: { en: "Active volunteers", zh: "活跃志愿者", ms: "Sukarelawan aktif", hi: "सक्रिय स्वयंसेवक" },
    note: {
      en: "Students and young professionals region-wide",
      zh: "遍布全区域的学生与青年专业人士",
      ms: "Pelajar dan profesional muda di seluruh rantau",
      hi: "पूरे क्षेत्र में छात्र और युवा पेशेवर",
    },
  },
  {
    value: "24",
    label: { en: "Partner organizations", zh: "合作机构", ms: "Organisasi rakan kongsi", hi: "साझेदार संगठन" },
    note: {
      en: "Schools, NGOs, and grassroots collectives",
      zh: "学校、非政府组织及基层团体",
      ms: "Sekolah, NGO, dan kolektif akar umbi",
      hi: "स्कूल, एनजीओ और जमीनी स्तर के समूह",
    },
  },
];

export const programs: Program[] = [
  {
    slug: "green-roots-lab",
    tag: { en: "Sustainability", zh: "可持续发展", ms: "Kelestarian", hi: "स्थिरता" },
    name: { en: "Green Roots Lab", zh: "绿根实验室", ms: "Makmal Akar Hijau", hi: "ग्रीन रूट्स लैब" },
    description: {
      en: "Hands-on community initiatives on waste reduction, climate literacy, and local sustainability action.",
      zh: "以实践为导向的社区行动，聚焦减少废弃物、气候素养和本地可持续发展行动。",
      ms: "Inisiatif komuniti secara praktikal mengenai pengurangan sisa, literasi iklim, dan tindakan kelestarian tempatan.",
      hi: "अपशिष्ट में कमी, जलवायु साक्षरता, और स्थानीय स्थिरता कार्रवाई पर व्यावहारिक सामुदायिक पहलें।",
    },
    who: {
      en: "Youth aged 15-25 interested in environmental action, from first-timers to seasoned campaigners.",
      zh: "适合15至25岁、对环保行动感兴趣的青年，无论是初次参与者还是经验丰富的倡导者。",
      ms: "Belia berusia 15-25 tahun yang berminat dalam tindakan alam sekitar, daripada pemula hingga aktivis berpengalaman.",
      hi: "पर्यावरण कार्रवाई में रुचि रखने वाले 15-25 वर्ष के युवा, चाहे वे नए हों या अनुभवी अभियानकर्ता।",
    },
    body: {
      en: [
        "Green Roots Lab runs hands-on community initiatives on waste reduction, climate literacy, and local sustainability action — from neighborhood recycling audits to campus-to-community circular economy pilots.",
        "Participants join a cohort that meets regularly to plan and run real interventions, not just workshops — every cycle ends with a project that's actually deployed in a school or neighborhood.",
        "No prior experience required. Mentors from partner organizations support each cohort with technical guidance where needed.",
      ],
      zh: [
        "绿根实验室开展以实践为导向的社区行动，聚焦减少废弃物、气候素养和本地可持续发展行动——从社区回收审查到校园与社区联动的循环经济试点项目。",
        "参与者将加入定期聚会的小组，共同规划并执行真正的行动，而不仅仅是工作坊——每个周期都会以一个真正落地于学校或社区的项目告终。",
        "无需任何经验。合作机构的导师会在需要时为每个小组提供技术指导。",
      ],
      ms: [
        "Makmal Akar Hijau menjalankan inisiatif komuniti secara praktikal mengenai pengurangan sisa, literasi iklim, dan tindakan kelestarian tempatan — daripada audit kitar semula kejiranan hingga projek rintis ekonomi kitaran kampus-ke-komuniti.",
        "Peserta menyertai kohort yang bertemu secara berkala untuk merancang dan menjalankan intervensi sebenar, bukan sekadar bengkel — setiap kitaran berakhir dengan projek yang benar-benar dilaksanakan di sekolah atau kejiranan.",
        "Tiada pengalaman terdahulu diperlukan. Mentor daripada organisasi rakan kongsi menyokong setiap kohort dengan bimbingan teknikal apabila diperlukan.",
      ],
      hi: [
        "ग्रीन रूट्स लैब अपशिष्ट में कमी, जलवायु साक्षरता, और स्थानीय स्थिरता कार्रवाई पर व्यावहारिक सामुदायिक पहलें चलाता है — पड़ोस की रीसाइक्लिंग समीक्षा से लेकर कैंपस-से-समुदाय सर्कुलर इकॉनमी पायलट तक।",
        "प्रतिभागी एक समूह से जुड़ते हैं जो नियमित रूप से मिलकर केवल वर्कशॉप नहीं बल्कि वास्तविक हस्तक्षेप की योजना बनाता और चलाता है — हर चक्र एक ऐसी परियोजना के साथ समाप्त होता है जो वास्तव में किसी स्कूल या पड़ोस में लागू की जाती है।",
        "पूर्व अनुभव आवश्यक नहीं है। साझेदार संगठनों के मेंटर आवश्यकतानुसार हर समूह को तकनीकी मार्गदर्शन देते हैं।",
      ],
    },
  },
  {
    slug: "root-and-rise-circles",
    tag: { en: "Mental Health", zh: "心理健康", ms: "Kesihatan Mental", hi: "मानसिक स्वास्थ्य" },
    name: { en: "Root & Rise Circles", zh: "扎根与成长圈", ms: "Bulatan Root & Rise", hi: "रूट एंड राइज़ सर्कल्स" },
    description: {
      en: "Peer-led support spaces and workshops promoting mental wellbeing and stronger youth connections.",
      zh: "由同伴主导的支持空间与工作坊，促进心理健康并加强青年之间的联系。",
      ms: "Ruang sokongan dan bengkel diterajui rakan sebaya yang mempromosikan kesejahteraan mental dan hubungan belia yang lebih kukuh.",
      hi: "साथियों के नेतृत्व वाले सहयोग स्थान और वर्कशॉप जो मानसिक कल्याण और युवाओं के बीच मजबूत संबंधों को बढ़ावा देते हैं।",
    },
    who: {
      en: "Any young person looking for a peer support space, and youth interested in training as peer facilitators.",
      zh: "适合任何寻找同伴支持空间的青年，以及有兴趣接受培训成为同伴引导者的青年。",
      ms: "Sesiapa sahaja belia yang mencari ruang sokongan rakan sebaya, dan belia yang berminat dilatih sebagai fasilitator rakan sebaya.",
      hi: "कोई भी युवा जो साथी सहयोग स्थान की तलाश में है, और वे युवा जो पीयर फैसिलिटेटर के रूप में प्रशिक्षण लेने में रुचि रखते हैं।",
    },
    body: {
      en: [
        "Root & Rise Circles are peer-led support spaces and workshops promoting mental wellbeing and stronger youth connections — built on the idea that young people are often best placed to support each other, with the right structure and training.",
        "Circles are small, confidential, and facilitated by trained peer leaders. Separately, we run a facilitator track for youth who want to be trained to lead their own circle.",
      ],
      zh: [
        "扎根与成长圈是由同伴主导的支持空间与工作坊，旨在促进心理健康并加强青年之间的联系——其理念是，在正确的架构与培训下，年轻人往往最适合彼此支持。",
        "小组规模小、保密性强，由经过培训的同伴带领者主持。此外，我们还为希望接受培训以带领自己小组的青年开设专门的带领者培训方向。",
      ],
      ms: [
        "Bulatan Root & Rise ialah ruang sokongan dan bengkel diterajui rakan sebaya yang mempromosikan kesejahteraan mental dan hubungan belia yang lebih kukuh — dibina atas idea bahawa belia sering paling sesuai untuk menyokong satu sama lain, dengan struktur dan latihan yang betul.",
        "Bulatan adalah kecil, sulit, dan difasilitasi oleh pemimpin rakan sebaya terlatih. Secara berasingan, kami menjalankan trek fasilitator untuk belia yang ingin dilatih mengetuai bulatan mereka sendiri.",
      ],
      hi: [
        "रूट एंड राइज़ सर्कल्स साथियों के नेतृत्व वाले सहयोग स्थान और वर्कशॉप हैं जो मानसिक कल्याण और युवाओं के बीच मजबूत संबंधों को बढ़ावा देते हैं — इस विचार पर आधारित कि सही संरचना और प्रशिक्षण के साथ युवा अक्सर एक-दूसरे का सबसे अच्छा सहयोग कर सकते हैं।",
        "सर्कल छोटे, गोपनीय होते हैं, और प्रशिक्षित पीयर लीडर्स द्वारा संचालित होते हैं। इसके अलावा, हम उन युवाओं के लिए एक फैसिलिटेटर ट्रैक चलाते हैं जो अपना खुद का सर्कल लीड करने के लिए प्रशिक्षित होना चाहते हैं।",
      ],
    },
  },
  {
    slug: "sprout-leaders-studio",
    tag: { en: "Leadership", zh: "领导力", ms: "Kepimpinan", hi: "नेतृत्व" },
    name: { en: "Sprout Leaders Studio", zh: "萌芽领袖工作室", ms: "Studio Pemimpin Sprout", hi: "स्प्राउट लीडर्स स्टूडियो" },
    description: {
      en: "A cohort-based pathway building civic leadership, project management, and communication skills.",
      zh: "以小组形式培养公民领导力、项目管理与沟通技能的成长路径。",
      ms: "Laluan berasaskan kohort yang membina kepimpinan sivik, pengurusan projek, dan kemahiran komunikasi.",
      hi: "नागरिक नेतृत्व, परियोजना प्रबंधन, और संचार कौशल बनाने वाला एक समूह-आधारित मार्ग।",
    },
    who: {
      en: "Youth ready to lead a project of their own, or step into a leadership role within an existing Seads program.",
      zh: "适合准备主导自己项目，或希望在现有Seads项目中承担领导角色的青年。",
      ms: "Belia yang bersedia mengetuai projek mereka sendiri, atau melangkah ke peranan kepimpinan dalam program Seads sedia ada.",
      hi: "वे युवा जो अपनी परियोजना का नेतृत्व करने के लिए तैयार हैं, या किसी मौजूदा सीड्स कार्यक्रम में नेतृत्व भूमिका निभाना चाहते हैं।",
    },
    body: {
      en: [
        "Sprout Leaders Studio is a cohort-based pathway building civic leadership, project management, and communication skills through real projects, not just theory.",
        "Each cohort pairs structured skill-building sessions with a live leadership assignment — running a small team, coordinating a service day, or leading a workshop — with mentorship throughout.",
      ],
      zh: [
        "萌芽领袖工作室是一个以小组形式开展的成长路径，通过真实项目而非纯理论，培养公民领导力、项目管理与沟通技能。",
        "每个小组将结构化的技能培养课程与真实的领导任务相结合——带领一个小团队、协调一次服务日，或主持一场工作坊——并全程配有导师指导。",
      ],
      ms: [
        "Studio Pemimpin Sprout ialah laluan berasaskan kohort yang membina kepimpinan sivik, pengurusan projek, dan kemahiran komunikasi melalui projek sebenar, bukan sekadar teori.",
        "Setiap kohort memadankan sesi pembinaan kemahiran berstruktur dengan tugasan kepimpinan sebenar — mengetuai pasukan kecil, menyelaraskan hari perkhidmatan, atau mengetuai bengkel — dengan bimbingan sepanjang tempoh.",
      ],
      hi: [
        "स्प्राउट लीडर्स स्टूडियो एक समूह-आधारित मार्ग है जो केवल सिद्धांत नहीं बल्कि वास्तविक परियोजनाओं के माध्यम से नागरिक नेतृत्व, परियोजना प्रबंधन, और संचार कौशल का निर्माण करता है।",
        "हर समूह संरचित कौशल-निर्माण सत्रों को एक वास्तविक नेतृत्व कार्य के साथ जोड़ता है — एक छोटी टीम चलाना, सेवा दिवस का समन्वय करना, या वर्कशॉप का नेतृत्व करना — पूरे समय मेंटरशिप के साथ।",
      ],
    },
  },
  {
    slug: "youth-solutions-sprint",
    tag: { en: "Innovation", zh: "创新", ms: "Inovasi", hi: "नवाचार" },
    name: { en: "Youth Solutions Sprint", zh: "青年方案冲刺营", ms: "Sprint Penyelesaian Belia", hi: "यूथ सॉल्यूशंस स्प्रिंट" },
    description: {
      en: "Challenge-based teams prototyping solutions to social issues with mentorship from partners.",
      zh: "以挑战为导向的团队协作，为社会议题设计解决方案原型，并获得合作机构的指导。",
      ms: "Pasukan berasaskan cabaran mereka bentuk prototaip penyelesaian kepada isu sosial dengan bimbingan daripada rakan kongsi.",
      hi: "साझेदारों के मार्गदर्शन में सामाजिक मुद्दों के समाधान का प्रोटोटाइप बनाने वाली चुनौती-आधारित टीमें।",
    },
    who: {
      en: "Youth who like solving problems in teams — no technical background required.",
      zh: "适合喜欢以团队方式解决问题的青年——无需技术背景。",
      ms: "Belia yang gemar menyelesaikan masalah dalam pasukan — tiada latar belakang teknikal diperlukan.",
      hi: "वे युवा जो टीम में समस्याएं सुलझाना पसंद करते हैं — किसी तकनीकी पृष्ठभूमि की आवश्यकता नहीं।",
    },
    body: {
      en: [
        "Youth Solutions Sprint puts challenge-based teams to work prototyping solutions to social issues, with mentorship from Seads' partner organizations.",
        "Each sprint runs over a few weeks, ending with teams presenting their prototype to partners and community stakeholders for feedback — and sometimes, a path to actually pilot it.",
      ],
      zh: [
        "青年方案冲刺营组织以挑战为导向的团队，为社会议题设计解决方案原型，并获得Seads合作机构的指导。",
        "每期冲刺营为期数周，最终团队将向合作机构与社区利益相关方展示原型并获取反馈——有时还能获得实际试点的机会。",
      ],
      ms: [
        "Sprint Penyelesaian Belia menggerakkan pasukan berasaskan cabaran untuk mereka bentuk prototaip penyelesaian kepada isu sosial, dengan bimbingan daripada organisasi rakan kongsi Seads.",
        "Setiap sprint berlangsung selama beberapa minggu, berakhir dengan pasukan membentangkan prototaip mereka kepada rakan kongsi dan pihak berkepentingan komuniti untuk maklum balas — dan kadangkala, laluan untuk benar-benar merintisnya.",
      ],
      hi: [
        "यूथ सॉल्यूशंस स्प्रिंट चुनौती-आधारित टीमों को सीड्स के साझेदार संगठनों के मार्गदर्शन में सामाजिक मुद्दों के समाधान का प्रोटोटाइप बनाने के काम में लगाता है।",
        "हर स्प्रिंट कुछ सप्ताहों तक चलता है, और अंत में टीमें अपने प्रोटोटाइप को साझेदारों और सामुदायिक हितधारकों के सामने प्रतिक्रिया के लिए प्रस्तुत करती हैं — और कभी-कभी इसे वास्तव में पायलट करने का रास्ता भी मिलता है।",
      ],
    },
  },
  {
    slug: "seads-stories-collective",
    tag: { en: "Media", zh: "媒体", ms: "Media", hi: "मीडिया" },
    name: { en: "Seads Stories Collective", zh: "Seads故事集体", ms: "Kolektif Kisah Seads", hi: "सीड्स स्टोरीज़ कलेक्टिव" },
    description: {
      en: "A youth editorial initiative documenting grassroots impact through writing, photo, and film.",
      zh: "一个由青年主导的编辑行动，通过文字、摄影与影像记录基层影响力。",
      ms: "Inisiatif editorial belia yang mendokumentasikan impak akar umbi melalui penulisan, foto, dan filem.",
      hi: "लेखन, फोटो, और फिल्म के माध्यम से जमीनी स्तर के प्रभाव का दस्तावेजीकरण करने वाली एक युवा संपादकीय पहल।",
    },
    who: {
      en: "Youth interested in writing, photography, or video — any skill level.",
      zh: "适合对写作、摄影或视频制作感兴趣的青年——任何技能水平均可。",
      ms: "Belia yang berminat dalam penulisan, fotografi, atau video — sebarang tahap kemahiran.",
      hi: "लेखन, फोटोग्राफी, या वीडियो में रुचि रखने वाले युवा — किसी भी कौशल स्तर के।",
    },
    body: {
      en: [
        "Seads Stories Collective is a youth editorial initiative documenting grassroots impact across Seads' programs and partner communities through writing, photo, and film.",
        "Collective members get hands-on mentorship in storytelling craft while producing real, published work — the stories on this site's blog are Collective output.",
      ],
      zh: [
        "Seads故事集体是一个由青年主导的编辑行动，通过文字、摄影与影像记录Seads各项目及合作社区的基层影响力。",
        "集体成员将在制作真实发表作品的同时，获得叙事技巧方面的实践指导——本网站博客中的故事正是该集体的产出成果。",
      ],
      ms: [
        "Kolektif Kisah Seads ialah inisiatif editorial belia yang mendokumentasikan impak akar umbi merentasi program Seads dan komuniti rakan kongsi melalui penulisan, foto, dan filem.",
        "Ahli kolektif mendapat bimbingan praktikal dalam seni bercerita sambil menghasilkan karya sebenar yang diterbitkan — kisah-kisah di blog laman ini adalah hasil Kolektif.",
      ],
      hi: [
        "सीड्स स्टोरीज़ कलेक्टिव एक युवा संपादकीय पहल है जो लेखन, फोटो, और फिल्म के माध्यम से सीड्स के कार्यक्रमों और साझेदार समुदायों में जमीनी स्तर के प्रभाव का दस्तावेजीकरण करती है।",
        "कलेक्टिव के सदस्यों को वास्तविक, प्रकाशित कार्य तैयार करते हुए कहानी कहने की कला में व्यावहारिक मार्गदर्शन मिलता है — इस साइट के ब्लॉग की कहानियां इसी कलेक्टिव की उपज हैं।",
      ],
    },
  },
  {
    slug: "community-harvest-days",
    tag: { en: "Service", zh: "服务", ms: "Perkhidmatan", hi: "सेवा" },
    name: { en: "Community Harvest Days", zh: "社区丰收日", ms: "Hari Tuaian Komuniti", hi: "कम्युनिटी हार्वेस्ट डेज़" },
    description: {
      en: "Monthly service days connecting volunteers with trusted local organizations for direct impact.",
      zh: "每月举行的服务日，将志愿者与值得信赖的本地机构联结，产生直接影响。",
      ms: "Hari perkhidmatan bulanan yang menghubungkan sukarelawan dengan organisasi tempatan dipercayai untuk impak langsung.",
      hi: "स्वयंसेवकों को विश्वसनीय स्थानीय संगठनों से जोड़ने वाले मासिक सेवा दिवस, जो सीधा प्रभाव डालते हैं।",
    },
    who: {
      en: "Anyone who wants to volunteer directly, no ongoing commitment required.",
      zh: "适合任何希望直接参与志愿服务的人，无需长期承诺。",
      ms: "Sesiapa sahaja yang ingin menjadi sukarelawan secara langsung, tiada komitmen berterusan diperlukan.",
      hi: "कोई भी जो सीधे स्वयंसेवा करना चाहता है, किसी सतत प्रतिबद्धता की आवश्यकता नहीं।",
    },
    body: {
      en: [
        "Community Harvest Days are monthly service days connecting volunteers with trusted local organizations for direct, hands-on impact — a low-commitment way to get involved.",
        "Each Harvest Day partners with a different local organization, so the actual work varies month to month — check the Events page for what's coming up next.",
      ],
      zh: [
        "社区丰收日是每月举行的服务日，将志愿者与值得信赖的本地机构联结，带来直接、亲身参与的影响力——是一种低门槛的参与方式。",
        "每次丰收日都会与不同的本地机构合作，因此具体工作内容每月都会有所不同——请查看活动页面了解接下来的安排。",
      ],
      ms: [
        "Hari Tuaian Komuniti ialah hari perkhidmatan bulanan yang menghubungkan sukarelawan dengan organisasi tempatan dipercayai untuk impak langsung dan praktikal — cara berkomitmen rendah untuk terlibat.",
        "Setiap Hari Tuaian bekerjasama dengan organisasi tempatan yang berbeza, jadi kerja sebenar berbeza dari bulan ke bulan — semak halaman Acara untuk apa yang akan datang.",
      ],
      hi: [
        "कम्युनिटी हार्वेस्ट डेज़ मासिक सेवा दिवस हैं जो स्वयंसेवकों को विश्वसनीय स्थानीय संगठनों से जोड़कर सीधा, व्यावहारिक प्रभाव डालते हैं — जुड़ने का एक कम-प्रतिबद्धता वाला तरीका।",
        "हर हार्वेस्ट डे एक अलग स्थानीय संगठन के साथ साझेदारी करता है, इसलिए वास्तविक काम हर महीने बदलता रहता है — आगे क्या होने वाला है यह जानने के लिए इवेंट्स पेज देखें।",
      ],
    },
  },
];

export const events: EventItem[] = [
  {
    slug: "seads-youth-dialogue-2026",
    type: { en: "Forum", zh: "论坛", ms: "Forum", hi: "फोरम" },
    title: { en: "Seads Youth Dialogue 2026", zh: "2026年Seads青年对话", ms: "Dialog Belia Seads 2026", hi: "सीड्स यूथ डायलॉग 2026" },
    date: "18 Jul 2026",
    location: {
      en: "Singapore Management University",
      zh: "新加坡管理大学",
      ms: "Universiti Pengurusan Singapura",
      hi: "सिंगापुर मैनेजमेंट यूनिवर्सिटी",
    },
    body: {
      en: [
        "A day-long forum bringing together youth delegates, community organizations, and policymakers to discuss the issues young people across Southeast Asia care most about.",
        "Expect panel discussions, breakout workshops, and structured networking with peers and partner organizations from across the region.",
      ],
      zh: [
        "为期一天的论坛，汇聚青年代表、社区机构与政策制定者，共同探讨东南亚青年最关心的议题。",
        "活动内容包括小组讨论、分组工作坊，以及与区域内同伴及合作机构的结构化交流活动。",
      ],
      ms: [
        "Forum sehari yang menghimpunkan delegasi belia, organisasi komuniti, dan penggubal dasar untuk membincangkan isu yang paling dipedulikan oleh belia di seluruh Asia Tenggara.",
        "Jangkakan perbincangan panel, bengkel kumpulan kecil, dan rangkaian berstruktur dengan rakan sebaya dan organisasi rakan kongsi dari seluruh rantau.",
      ],
      hi: [
        "एक दिवसीय फोरम जो युवा प्रतिनिधियों, सामुदायिक संगठनों और नीति निर्माताओं को उन मुद्दों पर चर्चा के लिए एक साथ लाता है जिनकी दक्षिण-पूर्व एशिया के युवाओं को सबसे अधिक परवाह है।",
        "पैनल चर्चाओं, ब्रेकआउट वर्कशॉप, और क्षेत्र भर के साथियों तथा साझेदार संगठनों के साथ संरचित नेटवर्किंग की अपेक्षा करें।",
      ],
    },
  },
  {
    slug: "community-storytelling-bootcamp",
    type: { en: "Workshop", zh: "工作坊", ms: "Bengkel", hi: "वर्कशॉप" },
    title: {
      en: "Community Storytelling Bootcamp",
      zh: "社区叙事训练营",
      ms: "Bootcamp Bercerita Komuniti",
      hi: "कम्युनिटी स्टोरीटेलिंग बूटकैंप",
    },
    date: "09 Aug 2026",
    location: {
      en: "National Youth Council Hub",
      zh: "国家青年理事会中心",
      ms: "Hab Majlis Belia Kebangsaan",
      hi: "नेशनल यूथ काउंसिल हब",
    },
    body: {
      en: [
        "A hands-on workshop for youth interested in documenting grassroots impact through writing, photography, and film — run in partnership with the Seads Stories Collective.",
        "No experience required. Bring a phone or camera if you have one; equipment can also be borrowed on the day.",
      ],
      zh: [
        "面向对通过文字、摄影与影像记录基层影响力感兴趣的青年而设的实践工作坊——由Seads故事集体联合举办。",
        "无需任何经验。如有手机或相机可自行携带；现场也提供设备借用服务。",
      ],
      ms: [
        "Bengkel praktikal untuk belia yang berminat mendokumentasikan impak akar umbi melalui penulisan, fotografi, dan filem — dijalankan bersama Kolektif Kisah Seads.",
        "Tiada pengalaman diperlukan. Bawa telefon atau kamera jika ada; peralatan juga boleh dipinjam pada hari itu.",
      ],
      hi: [
        "लेखन, फोटोग्राफी, और फिल्म के माध्यम से जमीनी स्तर के प्रभाव का दस्तावेजीकरण करने में रुचि रखने वाले युवाओं के लिए एक व्यावहारिक वर्कशॉप — सीड्स स्टोरीज़ कलेक्टिव के साथ साझेदारी में आयोजित।",
        "किसी अनुभव की आवश्यकता नहीं। यदि आपके पास फ़ोन या कैमरा है तो लाएं; उस दिन उपकरण उधार भी लिए जा सकते हैं।",
      ],
    },
  },
  {
    slug: "neighborhood-action-weekend",
    type: { en: "Volunteer Day", zh: "志愿服务日", ms: "Hari Sukarelawan", hi: "वॉलंटियर डे" },
    title: {
      en: "Neighborhood Action Weekend",
      zh: "社区行动周末",
      ms: "Hujung Minggu Tindakan Kejiranan",
      hi: "नेबरहुड एक्शन वीकेंड",
    },
    date: "24 Aug 2026",
    location: {
      en: "Islandwide Community Centers",
      zh: "全岛各社区中心",
      ms: "Pusat Komuniti Seluruh Pulau",
      hi: "आइलैंडवाइड कम्युनिटी सेंटर्स",
    },
    body: {
      en: [
        "A weekend of direct-impact volunteer activities across multiple neighborhood community centers, run alongside Seads' Community Harvest Days program.",
        "Activities vary by location — sign up and we'll match you with a site near you and confirm the specifics beforehand.",
      ],
      zh: [
        "一个周末内在多个社区中心开展的直接影响力志愿活动，与Seads的社区丰收日项目同步进行。",
        "各地点活动内容有所不同——报名后我们会为您匹配附近的活动地点，并提前确认具体安排。",
      ],
      ms: [
        "Hujung minggu aktiviti sukarelawan berimpak langsung merentasi pelbagai pusat komuniti kejiranan, dijalankan bersama program Hari Tuaian Komuniti Seads.",
        "Aktiviti berbeza mengikut lokasi — daftar dan kami akan padankan anda dengan tapak berdekatan serta mengesahkan butiran terlebih dahulu.",
      ],
      hi: [
        "कई पड़ोस के सामुदायिक केंद्रों में सीधे प्रभाव वाली स्वयंसेवी गतिविधियों का एक सप्ताहांत, जो सीड्स के कम्युनिटी हार्वेस्ट डेज़ कार्यक्रम के साथ आयोजित होता है।",
        "गतिविधियां स्थान के अनुसार अलग-अलग होती हैं — साइन अप करें और हम आपको आपके पास के स्थान से मिलाएंगे और पहले से विवरण की पुष्टि करेंगे।",
      ],
    },
  },
];

export const stories: Story[] = [
  {
    slug: "student-led-mentorship-cell",
    category: { en: "Education", zh: "教育", ms: "Pendidikan", hi: "शिक्षा" },
    title: {
      en: "How a Student-Led Mentorship Cell Supported 200 New Learners",
      zh: "一个学生主导的导师小组如何帮助200名新学员",
      ms: "Bagaimana Sel Bimbingan Diterajui Pelajar Menyokong 200 Pelajar Baharu",
      hi: "कैसे एक छात्र-नेतृत्व वाले मेंटरशिप सेल ने 200 नए शिक्षार्थियों का समर्थन किया",
    },
    excerpt: {
      en: "A practical model that paired student mentors with families and schools to improve confidence and consistency in learning.",
      zh: "一个将学生导师与家庭及学校相结合的实用模式，旨在提升学习的信心与持续性。",
      ms: "Model praktikal yang memadankan mentor pelajar dengan keluarga dan sekolah untuk meningkatkan keyakinan dan konsistensi dalam pembelajaran.",
      hi: "एक व्यावहारिक मॉडल जिसने छात्र मेंटरों को परिवारों और स्कूलों के साथ जोड़कर सीखने में आत्मविश्वास और निरंतरता को बेहतर बनाया।",
    },
    body: {
      en: [
        "When a group of Seads volunteers noticed that many younger students were falling behind not from lack of ability, but from inconsistent support at home, they didn't wait for a program to be built for them — they built one themselves.",
        "The model was simple: pair trained student mentors with small groups of younger learners, meeting weekly in a consistent, low-pressure setting. Mentors focused as much on building confidence and study habits as on any specific subject.",
        "Within two terms, the mentorship cell had grown from a single pilot group to a network supporting over 200 learners across several partner schools — run almost entirely by youth volunteers, with light coordination support from the Seads team.",
        "The biggest lesson, mentors say, was that consistency mattered more than expertise: showing up every week, reliably, built the trust that made everything else possible.",
      ],
      zh: [
        "当一群Seads志愿者注意到许多低年级学生落后并非因为能力不足，而是因为家庭支持不稳定时，他们没有等待有人为他们搭建项目——而是自己动手创建了一个。",
        "这个模式很简单：将经过培训的学生导师与小组年幼学员配对，每周在稳定、低压力的环境中见面。导师们不仅关注具体学科，更注重培养学员的信心与学习习惯。",
        "在两个学期内，这个导师小组从最初的单一试点小组发展成为覆盖多所合作学校、支持超过200名学员的网络——几乎全部由青年志愿者运营，仅由Seads团队提供少量协调支持。",
        "导师们表示，最大的收获是：持续性比专业性更重要——每周可靠地出现，正是建立信任、让一切成为可能的关键。",
      ],
      ms: [
        "Apabila sekumpulan sukarelawan Seads perasan bahawa ramai pelajar muda ketinggalan bukan kerana kekurangan keupayaan, tetapi kerana sokongan yang tidak konsisten di rumah, mereka tidak menunggu program dibina untuk mereka — mereka membinanya sendiri.",
        "Modelnya mudah: padankan mentor pelajar terlatih dengan kumpulan kecil pelajar yang lebih muda, bertemu setiap minggu dalam suasana yang konsisten dan bertekanan rendah. Mentor memberi tumpuan sama banyak kepada membina keyakinan dan tabiat belajar seperti mana-mana subjek tertentu.",
        "Dalam tempoh dua penggal, sel bimbingan itu telah berkembang daripada satu kumpulan rintis kepada rangkaian yang menyokong lebih 200 pelajar merentasi beberapa sekolah rakan kongsi — dijalankan hampir sepenuhnya oleh sukarelawan belia, dengan sokongan penyelarasan ringan daripada pasukan Seads.",
        "Pengajaran terbesar, kata mentor, ialah konsistensi lebih penting daripada kepakaran: hadir setiap minggu secara konsisten membina kepercayaan yang menjadikan segala-galanya mungkin.",
      ],
      hi: [
        "जब सीड्स के स्वयंसेवकों के एक समूह ने देखा कि कई छोटे छात्र क्षमता की कमी से नहीं बल्कि घर पर असंगत सहयोग के कारण पिछड़ रहे हैं, तो उन्होंने उनके लिए किसी कार्यक्रम के बनने का इंतज़ार नहीं किया — उन्होंने खुद ही एक बना डाला।",
        "मॉडल सरल था: प्रशिक्षित छात्र मेंटरों को छोटे समूहों में छोटे शिक्षार्थियों के साथ जोड़ना, हर हफ्ते एक स्थिर, कम-दबाव वाले माहौल में मिलना। मेंटर किसी विशेष विषय जितना ही आत्मविश्वास और अध्ययन की आदतें बनाने पर ध्यान देते थे।",
        "दो सत्रों के भीतर, यह मेंटरशिप सेल एक अकेले पायलट समूह से बढ़कर कई साझेदार स्कूलों में 200 से अधिक शिक्षार्थियों का समर्थन करने वाला नेटवर्क बन गया — लगभग पूरी तरह से युवा स्वयंसेवकों द्वारा संचालित, सीड्स टीम के हल्के समन्वय सहयोग के साथ।",
        "मेंटरों का कहना है कि सबसे बड़ा सबक यह था कि विशेषज्ञता से ज़्यादा निरंतरता मायने रखती है: हर हफ्ते भरोसेमंद तरीके से मौजूद रहना ही वह विश्वास बनाता है जिसने बाकी सब कुछ संभव बनाया।",
      ],
    },
  },
  {
    slug: "campus-recycling-to-circular-systems",
    category: { en: "Sustainability", zh: "可持续发展", ms: "Kelestarian", hi: "स्थिरता" },
    title: {
      en: "From Campus Recycling Drives to Neighborhood Circular Systems",
      zh: "从校园回收活动到社区循环系统",
      ms: "Daripada Kempen Kitar Semula Kampus kepada Sistem Kitaran Kejiranan",
      hi: "कैंपस रीसाइक्लिंग ड्राइव से लेकर पड़ोस की सर्कुलर सिस्टम तक",
    },
    excerpt: {
      en: "A cross-sector collaboration that turned one-off drives into a measurable local circular economy pilot.",
      zh: "一次跨领域的合作，将一次性活动转化为可衡量的本地循环经济试点。",
      ms: "Kerjasama merentasi sektor yang mengubah kempen sekali sahaja menjadi projek rintis ekonomi kitaran tempatan yang boleh diukur.",
      hi: "एक क्रॉस-सेक्टर सहयोग जिसने एकल अभियानों को एक मापने योग्य स्थानीय सर्कुलर इकॉनमी पायलट में बदल दिया।",
    },
    body: {
      en: [
        "It started as a single campus recycling drive — a Green Roots Lab cohort's first project. A year later, it's a running pilot connecting several schools and a neighborhood community center in a shared circular-materials loop.",
        "The turning point came when volunteers realized a one-off drive collects materials but doesn't change habits. So the cohort redesigned the project around a recurring, visible collection point, paired with simple climate-literacy sessions explaining exactly where the materials went.",
        "The pilot now tracks real diversion numbers month over month, in partnership with a local waste-management organization — turning a student project into something with measurable, ongoing impact.",
      ],
      zh: [
        "这一切始于一次单一的校园回收活动——绿根实验室某小组的第一个项目。一年后，它已发展为连接多所学校及一个社区中心、共享循环材料流程的正式试点项目。",
        "转折点出现在志愿者意识到，一次性活动只能收集材料，却无法改变习惯之时。于是该小组重新设计了项目，围绕一个持续、可见的回收点展开，并配合简明的气候素养课程，向参与者说明材料的具体去向。",
        "该试点项目现已与本地废弃物管理机构合作，逐月追踪实际分流数据——将一个学生项目转变为具有可衡量、持续影响力的行动。",
      ],
      ms: [
        "Ia bermula sebagai satu kempen kitar semula kampus — projek pertama kohort Makmal Akar Hijau. Setahun kemudian, ia menjadi projek rintis yang menghubungkan beberapa sekolah dan pusat komuniti kejiranan dalam gelung bahan kitaran bersama.",
        "Titik perubahan berlaku apabila sukarelawan menyedari kempen sekali sahaja mengumpul bahan tetapi tidak mengubah tabiat. Jadi kohort itu mereka bentuk semula projek di sekitar titik pengumpulan yang berulang dan kelihatan, dipadankan dengan sesi literasi iklim mudah yang menerangkan ke mana bahan itu pergi.",
        "Projek rintis kini menjejaki angka pengalihan sebenar dari bulan ke bulan, bekerjasama dengan organisasi pengurusan sisa tempatan — mengubah projek pelajar menjadi sesuatu yang mempunyai impak berterusan yang boleh diukur.",
      ],
      hi: [
        "यह एक ही कैंपस रीसाइक्लिंग ड्राइव के रूप में शुरू हुआ था — ग्रीन रूट्स लैब के एक समूह की पहली परियोजना। एक साल बाद, यह कई स्कूलों और एक पड़ोस के सामुदायिक केंद्र को एक साझा सर्कुलर-मटेरियल लूप में जोड़ने वाला चालू पायलट बन गया है।",
        "मोड़ तब आया जब स्वयंसेवकों को एहसास हुआ कि एक बार का अभियान सामग्री तो इकट्ठा करता है लेकिन आदतें नहीं बदलता। इसलिए समूह ने परियोजना को एक आवर्ती, दृश्यमान संग्रह बिंदु के इर्द-गिर्द फिर से डिज़ाइन किया, साथ ही सरल जलवायु-साक्षरता सत्र जोड़े जो बताते थे कि सामग्री वास्तव में कहां जाती है।",
        "यह पायलट अब एक स्थानीय अपशिष्ट-प्रबंधन संगठन के साथ साझेदारी में महीने-दर-महीने वास्तविक डायवर्जन आंकड़ों को ट्रैक करता है — एक छात्र परियोजना को मापने योग्य, निरंतर प्रभाव वाली चीज़ में बदल रहा है।",
      ],
    },
  },
  {
    slug: "intergenerational-makerspaces",
    category: { en: "Community", zh: "社区", ms: "Komuniti", hi: "समुदाय" },
    title: {
      en: "Intergenerational Makerspaces Are Strengthening Community Bonds",
      zh: "跨世代创客空间正在加强社区纽带",
      ms: "Ruang Pembuat Antara Generasi Mengukuhkan Ikatan Komuniti",
      hi: "अंतर-पीढ़ीगत मेकरस्पेस समुदाय के बंधन मजबूत कर रहे हैं",
    },
    excerpt: {
      en: "Volunteers and seniors co-created skills sessions that grew social trust and digital confidence.",
      zh: "志愿者与长者共同打造技能交流课程，增进社会信任与数字自信。",
      ms: "Sukarelawan dan warga emas mencipta bersama sesi kemahiran yang memupuk kepercayaan sosial dan keyakinan digital.",
      hi: "स्वयंसेवकों और वरिष्ठ नागरिकों ने मिलकर कौशल सत्र बनाए जिन्होंने सामाजिक विश्वास और डिजिटल आत्मविश्वास को बढ़ाया।",
    },
    body: {
      en: [
        "A Community Harvest Days partnership with a neighborhood senior center started with a simple question: what if volunteers and seniors taught each other, instead of one group simply serving the other?",
        "The result was a series of intergenerational makerspace sessions — seniors sharing traditional craft skills, youth volunteers helping with digital literacy and technology in return. Both sides came away with something real.",
        "Beyond the skills exchanged, organizers point to something harder to measure but just as important: the sessions visibly grew trust and familiarity between generations who don't often get structured time together.",
      ],
      zh: [
        "社区丰收日与某社区长者中心的合作始于一个简单的问题：如果志愿者与长者互相教学，而不是单方面提供服务，会怎样？",
        "结果诞生了一系列跨世代创客空间活动——长者分享传统手工技艺，青年志愿者则提供数字素养与科技方面的协助。双方都获得了真实的收获。",
        "除了技能交流，组织者还指出一点更难衡量却同样重要的收获：这些活动明显增进了不同世代之间的信任与熟悉度，而这些世代平日很少有机会有结构地共处。",
      ],
      ms: [
        "Perkongsian Hari Tuaian Komuniti dengan pusat warga emas kejiranan bermula dengan satu soalan mudah: bagaimana jika sukarelawan dan warga emas saling mengajar, bukannya satu kumpulan sekadar berkhidmat kepada yang lain?",
        "Hasilnya ialah siri sesi ruang pembuat antara generasi — warga emas berkongsi kemahiran kraf tradisional, sukarelawan belia membantu dengan literasi digital dan teknologi sebagai balasan. Kedua-dua pihak mendapat sesuatu yang nyata.",
        "Selain kemahiran yang dikongsi, penganjur menunjukkan sesuatu yang lebih sukar diukur tetapi sama pentingnya: sesi itu jelas memupuk kepercayaan dan kemesraan antara generasi yang jarang mendapat masa berstruktur bersama.",
      ],
      hi: [
        "एक पड़ोस के वरिष्ठ नागरिक केंद्र के साथ कम्युनिटी हार्वेस्ट डेज़ की साझेदारी एक सरल सवाल से शुरू हुई: क्या हो अगर स्वयंसेवक और वरिष्ठ नागरिक एक-दूसरे को सिखाएं, बजाय इसके कि एक समूह केवल दूसरे की सेवा करे?",
        "परिणाम था अंतर-पीढ़ीगत मेकरस्पेस सत्रों की एक श्रृंखला — वरिष्ठ नागरिकों ने पारंपरिक शिल्प कौशल साझा किए, बदले में युवा स्वयंसेवकों ने डिजिटल साक्षरता और तकनीक में मदद की। दोनों पक्षों को कुछ वास्तविक हासिल हुआ।",
        "साझा किए गए कौशल से परे, आयोजक एक ऐसी चीज़ की ओर इशारा करते हैं जिसे मापना कठिन है लेकिन उतना ही महत्वपूर्ण है: इन सत्रों ने उन पीढ़ियों के बीच विश्वास और परिचय को स्पष्ट रूप से बढ़ाया जिन्हें अक्सर एक साथ संरचित समय नहीं मिलता।",
      ],
    },
  },
  {
    slug: "youth-health-ambassadors",
    category: { en: "Health", zh: "健康", ms: "Kesihatan", hi: "स्वास्थ्य" },
    title: {
      en: "Youth Health Ambassadors Improve Early Mental Wellness Access",
      zh: "青年健康大使助力早期心理健康支持的获取",
      ms: "Duta Kesihatan Belia Meningkatkan Akses Awal Kesejahteraan Mental",
      hi: "यूथ हेल्थ एंबेसडर शुरुआती मानसिक कल्याण पहुंच में सुधार कर रहे हैं",
    },
    excerpt: {
      en: "Peer referral pathways and trusted conversations helped more students seek support earlier.",
      zh: "同伴转介渠道与值得信赖的对话，帮助更多学生更早寻求支持。",
      ms: "Laluan rujukan rakan sebaya dan perbualan yang dipercayai membantu lebih ramai pelajar mendapatkan sokongan lebih awal.",
      hi: "साथी रेफरल मार्ग और भरोसेमंद बातचीत ने अधिक छात्रों को जल्दी सहायता लेने में मदद की।",
    },
    body: {
      en: [
        "Root & Rise Circles trained a cohort of student volunteers as Youth Health Ambassadors — peers equipped to recognize when a classmate might be struggling, and to have a first, low-pressure conversation about it.",
        "The ambassadors aren't counselors, and the program is explicit about that boundary — their role is a trusted first conversation and a clear referral pathway to real support, not a replacement for it.",
        "Early data from partner schools suggests students are more willing to have that first conversation with a peer than to approach a formal support service directly — meaning more students are reaching real help earlier than before.",
      ],
      zh: [
        "扎根与成长圈培训了一批学生志愿者成为青年健康大使——他们能够识别同学可能面临的困境，并主动展开第一次低压力的对话。",
        "这些大使并非心理咨询师，该项目对这一界限有明确说明——他们的角色是提供值得信赖的初次对话，并指引清晰的转介渠道通往真正的支持，而非取代专业支持。",
        "来自合作学校的早期数据显示，学生更愿意先与同伴展开这样的对话，而非直接寻求正式的支持服务——这意味着更多学生能比以往更早获得真正的帮助。",
      ],
      ms: [
        "Bulatan Root & Rise melatih sekumpulan sukarelawan pelajar sebagai Duta Kesihatan Belia — rakan sebaya yang dilengkapi untuk mengenal pasti apabila rakan sekelas mungkin bergelut, dan mengadakan perbualan pertama yang bertekanan rendah mengenainya.",
        "Duta bukanlah kaunselor, dan program itu jelas mengenai sempadan tersebut — peranan mereka ialah perbualan pertama yang dipercayai dan laluan rujukan yang jelas kepada sokongan sebenar, bukan penggantinya.",
        "Data awal daripada sekolah rakan kongsi menunjukkan pelajar lebih rela mengadakan perbualan pertama itu dengan rakan sebaya berbanding mendekati perkhidmatan sokongan formal secara terus — bermakna lebih ramai pelajar mendapat bantuan sebenar lebih awal berbanding sebelum ini.",
      ],
      hi: [
        "रूट एंड राइज़ सर्कल्स ने छात्र स्वयंसेवकों के एक समूह को यूथ हेल्थ एंबेसडर के रूप में प्रशिक्षित किया — ऐसे साथी जो यह पहचानने में सक्षम हैं कि कोई सहपाठी कब संघर्ष कर रहा हो सकता है, और इस बारे में पहली, कम-दबाव वाली बातचीत कर सकें।",
        "एंबेसडर काउंसलर नहीं हैं, और कार्यक्रम इस सीमा के बारे में स्पष्ट है — उनकी भूमिका एक भरोसेमंद पहली बातचीत और वास्तविक सहायता के लिए एक स्पष्ट रेफरल मार्ग है, न कि उसका विकल्प।",
        "साझेदार स्कूलों के शुरुआती आंकड़े बताते हैं कि छात्र सीधे किसी औपचारिक सहायता सेवा से संपर्क करने के बजाय किसी साथी के साथ वह पहली बातचीत करने के लिए अधिक इच्छुक होते हैं — यानी पहले से अधिक छात्र पहले से जल्दी वास्तविक मदद तक पहुंच रहे हैं।",
      ],
    },
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: {
      en: "Seads made volunteering feel meaningful and structured. I could see real outcomes from every hour I gave.",
      zh: "Seads让志愿服务变得有意义且有条理。我付出的每一个小时都能看到真实的成果。",
      ms: "Seads menjadikan kesukarelawanan terasa bermakna dan berstruktur. Saya dapat melihat hasil sebenar daripada setiap jam yang saya curahkan.",
      hi: "सीड्स ने स्वयंसेवा को सार्थक और संरचित बना दिया। मैंने जो भी समय दिया, उसका वास्तविक परिणाम मुझे दिखाई दिया।",
    },
    author: {
      en: "Nadira, Student Volunteer",
      zh: "娜迪拉，学生志愿者",
      ms: "Nadira, Sukarelawan Pelajar",
      hi: "नादिरा, छात्र स्वयंसेवक",
    },
  },
  {
    quote: {
      en: "Their youth teams communicate with maturity and creativity. Working with them improved our program reach instantly.",
      zh: "他们的青年团队沟通成熟且富有创意。与他们合作让我们的项目影响力立即得到提升。",
      ms: "Pasukan belia mereka berkomunikasi dengan kematangan dan kreativiti. Bekerjasama dengan mereka meningkatkan jangkauan program kami dengan serta-merta.",
      hi: "उनकी युवा टीमें परिपक्वता और रचनात्मकता के साथ संवाद करती हैं। उनके साथ काम करने से हमारे कार्यक्रम की पहुंच तुरंत बढ़ गई।",
    },
    author: {
      en: "Mr. Tan, Community Partner",
      zh: "陈先生，社区合作伙伴",
      ms: "En. Tan, Rakan Kongsi Komuniti",
      hi: "श्री टैन, सामुदायिक साझेदार",
    },
  },
  {
    quote: {
      en: "The events are energetic but thoughtful. My child came home more confident and motivated to contribute.",
      zh: "活动充满活力又不失周到。我的孩子回家后变得更有自信，也更有意愿去做出贡献。",
      ms: "Acara-acaranya bertenaga tetapi bertimbang rasa. Anak saya pulang lebih yakin dan bermotivasi untuk menyumbang.",
      hi: "इवेंट्स ऊर्जावान लेकिन सोच-समझकर आयोजित होते हैं। मेरा बच्चा घर आकर अधिक आत्मविश्वासी और योगदान देने के लिए प्रेरित महसूस करता है।",
    },
    author: {
      en: "Mrs. Lim, Parent",
      zh: "林太太，家长",
      ms: "Pn. Lim, Ibu Bapa",
      hi: "श्रीमती लिम, अभिभावक",
    },
  },
];

export const teamMembers: TeamMember[] = [
  {
    name: "Ariya Goh",
    role: { en: "Executive Director", zh: "执行董事", ms: "Pengarah Eksekutif", hi: "कार्यकारी निदेशक" },
    bio: {
      en: "Sets Seads' strategy and partnerships across Southeast Asia, with a background in youth policy and community organizing.",
      zh: "负责制定Seads在东南亚的战略与合作伙伴关系，拥有青年政策与社区组织方面的背景。",
      ms: "Menetapkan strategi dan perkongsian Seads di seluruh Asia Tenggara, dengan latar belakang dalam dasar belia dan penganjuran komuniti.",
      hi: "दक्षिण-पूर्व एशिया में सीड्स की रणनीति और साझेदारियां तय करती हैं, युवा नीति और सामुदायिक संगठन की पृष्ठभूमि के साथ।",
    },
  },
  {
    name: "Daniel Ho",
    role: { en: "Programs Lead", zh: "项目负责人", ms: "Ketua Program", hi: "प्रोग्राम्स लीड" },
    bio: {
      en: "Designs and runs Seads' signature programs, from Green Roots Lab to Sprout Leaders Studio.",
      zh: "设计并运营Seads的特色项目，从绿根实验室到萌芽领袖工作室。",
      ms: "Mereka bentuk dan menjalankan program utama Seads, daripada Makmal Akar Hijau hingga Studio Pemimpin Sprout.",
      hi: "ग्रीन रूट्स लैब से लेकर स्प्राउट लीडर्स स्टूडियो तक, सीड्स के प्रमुख कार्यक्रमों को डिज़ाइन और संचालित करते हैं।",
    },
  },
  {
    name: "Farah Nordin",
    role: { en: "Community Partnerships", zh: "社区合作伙伴关系", ms: "Perkongsian Komuniti", hi: "कम्युनिटी पार्टनरशिप्स" },
    bio: {
      en: "Builds and maintains Seads' relationships with schools, NGOs, and corporate partners region-wide.",
      zh: "负责建立并维护Seads在整个区域与学校、非政府组织及企业合作伙伴的关系。",
      ms: "Membina dan mengekalkan hubungan Seads dengan sekolah, NGO, dan rakan kongsi korporat di seluruh rantau.",
      hi: "पूरे क्षेत्र में स्कूलों, एनजीओ, और कॉर्पोरेट साझेदारों के साथ सीड्स के संबंध बनाती और बनाए रखती हैं।",
    },
  },
  {
    name: "Kavin Prakash",
    role: { en: "Media and Storytelling", zh: "媒体与叙事", ms: "Media dan Bercerita", hi: "मीडिया और स्टोरीटेलिंग" },
    bio: {
      en: "Leads the Seads Stories Collective, documenting grassroots impact through writing, photo, and film.",
      zh: "领导Seads故事集体，通过文字、摄影与影像记录基层影响力。",
      ms: "Mengetuai Kolektif Kisah Seads, mendokumentasikan impak akar umbi melalui penulisan, foto, dan filem.",
      hi: "सीड्स स्टोरीज़ कलेक्टिव का नेतृत्व करते हैं, लेखन, फोटो, और फिल्म के माध्यम से जमीनी स्तर के प्रभाव का दस्तावेजीकरण करते हैं।",
    },
  },
];
