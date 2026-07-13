export type ImpactMetric = {
  value: string;
  label: string;
  note: string;
};

export type Program = {
  slug: string;
  tag: string;
  name: string;
  description: string;
  body: string[];
  who: string;
};

export type EventItem = {
  slug: string;
  type: string;
  title: string;
  date: string;
  location: string;
  body: string[];
};

export type Story = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string[];
};

export type Testimonial = {
  quote: string;
  author: string;
};

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
};

export const impactMetrics: ImpactMetric[] = [
  {
    value: "40K+",
    label: "Youths reached",
    note: "Across schools and community networks in SEA",
  },
  {
    value: "150+",
    label: "Programs delivered",
    note: "Leadership camps, service projects, and forums",
  },
  {
    value: "500+",
    label: "Active volunteers",
    note: "Students and young professionals region-wide",
  },
  {
    value: "24",
    label: "Partner organizations",
    note: "Schools, NGOs, and grassroots collectives",
  },
];

export const programs: Program[] = [
  {
    slug: "green-roots-lab",
    tag: "Sustainability",
    name: "Green Roots Lab",
    description:
      "Hands-on community initiatives on waste reduction, climate literacy, and local sustainability action.",
    who: "Youth aged 15-25 interested in environmental action, from first-timers to seasoned campaigners.",
    body: [
      "Green Roots Lab runs hands-on community initiatives on waste reduction, climate literacy, and local sustainability action — from neighborhood recycling audits to campus-to-community circular economy pilots.",
      "Participants join a cohort that meets regularly to plan and run real interventions, not just workshops — every cycle ends with a project that's actually deployed in a school or neighborhood.",
      "No prior experience required. Mentors from partner organizations support each cohort with technical guidance where needed.",
    ],
  },
  {
    slug: "root-and-rise-circles",
    tag: "Mental Health",
    name: "Root & Rise Circles",
    description:
      "Peer-led support spaces and workshops promoting mental wellbeing and stronger youth connections.",
    who: "Any young person looking for a peer support space, and youth interested in training as peer facilitators.",
    body: [
      "Root & Rise Circles are peer-led support spaces and workshops promoting mental wellbeing and stronger youth connections — built on the idea that young people are often best placed to support each other, with the right structure and training.",
      "Circles are small, confidential, and facilitated by trained peer leaders. Separately, we run a facilitator track for youth who want to be trained to lead their own circle.",
    ],
  },
  {
    slug: "sprout-leaders-studio",
    tag: "Leadership",
    name: "Sprout Leaders Studio",
    description:
      "A cohort-based pathway building civic leadership, project management, and communication skills.",
    who: "Youth ready to lead a project of their own, or step into a leadership role within an existing Seads program.",
    body: [
      "Sprout Leaders Studio is a cohort-based pathway building civic leadership, project management, and communication skills through real projects, not just theory.",
      "Each cohort pairs structured skill-building sessions with a live leadership assignment — running a small team, coordinating a service day, or leading a workshop — with mentorship throughout.",
    ],
  },
  {
    slug: "youth-solutions-sprint",
    tag: "Innovation",
    name: "Youth Solutions Sprint",
    description:
      "Challenge-based teams prototyping solutions to social issues with mentorship from partners.",
    who: "Youth who like solving problems in teams — no technical background required.",
    body: [
      "Youth Solutions Sprint puts challenge-based teams to work prototyping solutions to social issues, with mentorship from Seads' partner organizations.",
      "Each sprint runs over a few weeks, ending with teams presenting their prototype to partners and community stakeholders for feedback — and sometimes, a path to actually pilot it.",
    ],
  },
  {
    slug: "seads-stories-collective",
    tag: "Media",
    name: "Seads Stories Collective",
    description:
      "A youth editorial initiative documenting grassroots impact through writing, photo, and film.",
    who: "Youth interested in writing, photography, or video — any skill level.",
    body: [
      "Seads Stories Collective is a youth editorial initiative documenting grassroots impact across Seads' programs and partner communities through writing, photo, and film.",
      "Collective members get hands-on mentorship in storytelling craft while producing real, published work — the stories on this site's blog are Collective output.",
    ],
  },
  {
    slug: "community-harvest-days",
    tag: "Service",
    name: "Community Harvest Days",
    description:
      "Monthly service days connecting volunteers with trusted local organizations for direct impact.",
    who: "Anyone who wants to volunteer directly, no ongoing commitment required.",
    body: [
      "Community Harvest Days are monthly service days connecting volunteers with trusted local organizations for direct, hands-on impact — a low-commitment way to get involved.",
      "Each Harvest Day partners with a different local organization, so the actual work varies month to month — check the Events page for what's coming up next.",
    ],
  },
];

export const events: EventItem[] = [
  {
    slug: "seads-youth-dialogue-2026",
    type: "Forum",
    title: "Seads Youth Dialogue 2026",
    date: "18 Jul 2026",
    location: "Singapore Management University",
    body: [
      "A day-long forum bringing together youth delegates, community organizations, and policymakers to discuss the issues young people across Southeast Asia care most about.",
      "Expect panel discussions, breakout workshops, and structured networking with peers and partner organizations from across the region.",
    ],
  },
  {
    slug: "community-storytelling-bootcamp",
    type: "Workshop",
    title: "Community Storytelling Bootcamp",
    date: "09 Aug 2026",
    location: "National Youth Council Hub",
    body: [
      "A hands-on workshop for youth interested in documenting grassroots impact through writing, photography, and film — run in partnership with the Seads Stories Collective.",
      "No experience required. Bring a phone or camera if you have one; equipment can also be borrowed on the day.",
    ],
  },
  {
    slug: "neighborhood-action-weekend",
    type: "Volunteer Day",
    title: "Neighborhood Action Weekend",
    date: "24 Aug 2026",
    location: "Islandwide Community Centers",
    body: [
      "A weekend of direct-impact volunteer activities across multiple neighborhood community centers, run alongside Seads' Community Harvest Days program.",
      "Activities vary by location — sign up and we'll match you with a site near you and confirm the specifics beforehand.",
    ],
  },
];

export const stories: Story[] = [
  {
    slug: "student-led-mentorship-cell",
    category: "Education",
    title: "How a Student-Led Mentorship Cell Supported 200 New Learners",
    excerpt:
      "A practical model that paired student mentors with families and schools to improve confidence and consistency in learning.",
    body: [
      "When a group of Seads volunteers noticed that many younger students were falling behind not from lack of ability, but from inconsistent support at home, they didn't wait for a program to be built for them — they built one themselves.",
      "The model was simple: pair trained student mentors with small groups of younger learners, meeting weekly in a consistent, low-pressure setting. Mentors focused as much on building confidence and study habits as on any specific subject.",
      "Within two terms, the mentorship cell had grown from a single pilot group to a network supporting over 200 learners across several partner schools — run almost entirely by youth volunteers, with light coordination support from the Seads team.",
      "The biggest lesson, mentors say, was that consistency mattered more than expertise: showing up every week, reliably, built the trust that made everything else possible.",
    ],
  },
  {
    slug: "campus-recycling-to-circular-systems",
    category: "Sustainability",
    title: "From Campus Recycling Drives to Neighborhood Circular Systems",
    excerpt:
      "A cross-sector collaboration that turned one-off drives into a measurable local circular economy pilot.",
    body: [
      "It started as a single campus recycling drive — a Green Roots Lab cohort's first project. A year later, it's a running pilot connecting several schools and a neighborhood community center in a shared circular-materials loop.",
      "The turning point came when volunteers realized a one-off drive collects materials but doesn't change habits. So the cohort redesigned the project around a recurring, visible collection point, paired with simple climate-literacy sessions explaining exactly where the materials went.",
      "The pilot now tracks real diversion numbers month over month, in partnership with a local waste-management organization — turning a student project into something with measurable, ongoing impact.",
    ],
  },
  {
    slug: "intergenerational-makerspaces",
    category: "Community",
    title: "Intergenerational Makerspaces Are Strengthening Community Bonds",
    excerpt:
      "Volunteers and seniors co-created skills sessions that grew social trust and digital confidence.",
    body: [
      "A Community Harvest Days partnership with a neighborhood senior center started with a simple question: what if volunteers and seniors taught each other, instead of one group simply serving the other?",
      "The result was a series of intergenerational makerspace sessions — seniors sharing traditional craft skills, youth volunteers helping with digital literacy and technology in return. Both sides came away with something real.",
      "Beyond the skills exchanged, organizers point to something harder to measure but just as important: the sessions visibly grew trust and familiarity between generations who don't often get structured time together.",
    ],
  },
  {
    slug: "youth-health-ambassadors",
    category: "Health",
    title: "Youth Health Ambassadors Improve Early Mental Wellness Access",
    excerpt:
      "Peer referral pathways and trusted conversations helped more students seek support earlier.",
    body: [
      "Root & Rise Circles trained a cohort of student volunteers as Youth Health Ambassadors — peers equipped to recognize when a classmate might be struggling, and to have a first, low-pressure conversation about it.",
      "The ambassadors aren't counselors, and the program is explicit about that boundary — their role is a trusted first conversation and a clear referral pathway to real support, not a replacement for it.",
      "Early data from partner schools suggests students are more willing to have that first conversation with a peer than to approach a formal support service directly — meaning more students are reaching real help earlier than before.",
    ],
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "Seads made volunteering feel meaningful and structured. I could see real outcomes from every hour I gave.",
    author: "Nadira, Student Volunteer",
  },
  {
    quote:
      "Their youth teams communicate with maturity and creativity. Working with them improved our program reach instantly.",
    author: "Mr. Tan, Community Partner",
  },
  {
    quote:
      "The events are energetic but thoughtful. My child came home more confident and motivated to contribute.",
    author: "Mrs. Lim, Parent",
  },
];

export const teamMembers: TeamMember[] = [
  {
    name: "Ariya Goh",
    role: "Executive Director",
    bio: "Sets Seads' strategy and partnerships across Southeast Asia, with a background in youth policy and community organizing.",
  },
  {
    name: "Daniel Ho",
    role: "Programs Lead",
    bio: "Designs and runs Seads' signature programs, from Green Roots Lab to Sprout Leaders Studio.",
  },
  {
    name: "Farah Nordin",
    role: "Community Partnerships",
    bio: "Builds and maintains Seads' relationships with schools, NGOs, and corporate partners region-wide.",
  },
  {
    name: "Kavin Prakash",
    role: "Media and Storytelling",
    bio: "Leads the Seads Stories Collective, documenting grassroots impact through writing, photo, and film.",
  },
];
