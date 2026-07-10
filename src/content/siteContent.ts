export type ImpactMetric = {
  value: string;
  label: string;
  note: string;
};

export type Program = {
  tag: string;
  name: string;
  description: string;
};

export type EventItem = {
  type: string;
  title: string;
  date: string;
  location: string;
};

export type Story = {
  category: string;
  title: string;
  excerpt: string;
};

export type Testimonial = {
  quote: string;
  author: string;
};

export type TeamMember = {
  name: string;
  role: string;
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
    tag: "Sustainability",
    name: "Green Roots Lab",
    description:
      "Hands-on community initiatives on waste reduction, climate literacy, and local sustainability action.",
  },
  {
    tag: "Mental Health",
    name: "Root & Rise Circles",
    description:
      "Peer-led support spaces and workshops promoting mental wellbeing and stronger youth connections.",
  },
  {
    tag: "Leadership",
    name: "Sprout Leaders Studio",
    description:
      "A cohort-based pathway building civic leadership, project management, and communication skills.",
  },
  {
    tag: "Innovation",
    name: "Youth Solutions Sprint",
    description:
      "Challenge-based teams prototyping solutions to social issues with mentorship from partners.",
  },
  {
    tag: "Media",
    name: "Seads Stories Collective",
    description:
      "A youth editorial initiative documenting grassroots impact through writing, photo, and film.",
  },
  {
    tag: "Service",
    name: "Community Harvest Days",
    description:
      "Monthly service days connecting volunteers with trusted local organizations for direct impact.",
  },
];

export const events: EventItem[] = [
  {
    type: "Forum",
    title: "Seads Youth Dialogue 2026",
    date: "18 Jul 2026",
    location: "Singapore Management University",
  },
  {
    type: "Workshop",
    title: "Community Storytelling Bootcamp",
    date: "09 Aug 2026",
    location: "National Youth Council Hub",
  },
  {
    type: "Volunteer Day",
    title: "Neighborhood Action Weekend",
    date: "24 Aug 2026",
    location: "Islandwide Community Centers",
  },
];

export const stories: Story[] = [
  {
    category: "Education",
    title: "How a Student-Led Mentorship Cell Supported 200 New Learners",
    excerpt:
      "A practical model that paired student mentors with families and schools to improve confidence and consistency in learning.",
  },
  {
    category: "Sustainability",
    title: "From Campus Recycling Drives to Neighborhood Circular Systems",
    excerpt:
      "A cross-sector collaboration that turned one-off drives into a measurable local circular economy pilot.",
  },
  {
    category: "Community",
    title: "Intergenerational Makerspaces Are Strengthening Community Bonds",
    excerpt:
      "Volunteers and seniors co-created skills sessions that grew social trust and digital confidence.",
  },
  {
    category: "Health",
    title: "Youth Health Ambassadors Improve Early Mental Wellness Access",
    excerpt:
      "Peer referral pathways and trusted conversations helped more students seek support earlier.",
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
  },
  {
    name: "Daniel Ho",
    role: "Programs Lead",
  },
  {
    name: "Farah Nordin",
    role: "Community Partnerships",
  },
  {
    name: "Kavin Prakash",
    role: "Media and Storytelling",
  },
];