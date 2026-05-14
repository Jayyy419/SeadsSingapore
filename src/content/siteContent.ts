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
    value: "25K+",
    label: "Community members reached",
    note: "Across school, neighborhood, and youth networks",
  },
  {
    value: "120+",
    label: "Events delivered",
    note: "Leadership camps, service projects, and forums",
  },
  {
    value: "380+",
    label: "Active volunteers",
    note: "Students and young professionals across Singapore",
  },
  {
    value: "18",
    label: "Partner organizations",
    note: "Schools, NGOs, and private sector collaborators",
  },
];

export const programs: Program[] = [
  {
    tag: "Leadership",
    name: "Spark Future Leaders",
    description:
      "A pathway for students to develop civic leadership, project management, and communication skills through cohort-based learning.",
  },
  {
    tag: "Sustainability",
    name: "Green Neighborhood Labs",
    description:
      "Hands-on community initiatives focused on waste reduction, climate literacy, and local sustainability action.",
  },
  {
    tag: "Well-being",
    name: "Community Care Circles",
    description:
      "Peer-led support spaces and practical workshops that promote mental health, empathy, and stronger intergenerational ties.",
  },
  {
    tag: "Innovation",
    name: "Youth Solutions Studio",
    description:
      "Challenge-based program where youth teams prototype solutions to social issues with mentorship from partners and experts.",
  },
  {
    tag: "Media",
    name: "Spark Stories Collective",
    description:
      "A youth editorial initiative that documents grassroots impact stories through writing, photo essays, and short videos.",
  },
  {
    tag: "Service",
    name: "Volunteer Impact Sprint",
    description:
      "Monthly service days that match volunteers with trusted local organizations for direct, measurable community outcomes.",
  },
];

export const events: EventItem[] = [
  {
    type: "Forum",
    title: "Spark Youth Dialogue 2026",
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
      "Spark SG made volunteering feel meaningful and structured. I could see real outcomes from every hour I gave.",
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