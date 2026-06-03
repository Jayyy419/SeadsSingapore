export type MediaItem = {
  src: string;
  caption: string;
  date: string;
  category: "Programs" | "Events" | "Partners" | "Wellbeing" | "Sustainability";
};

export const mediaItems: MediaItem[] = [
  {
    src: "/photos/photo-1.svg",
    caption: "Youth leadership workshop at community hub",
    date: "2026-05-18",
    category: "Programs",
  },
  {
    src: "/photos/photo-2.svg",
    caption: "Volunteer day with neighborhood partners",
    date: "2026-05-24",
    category: "Events",
  },
  {
    src: "/photos/photo-3.svg",
    caption: "Team and partner planning session",
    date: "2026-05-30",
    category: "Partners",
  },
  {
    src: "/photos/photo-4.svg",
    caption: "Mental wellbeing peer support circle",
    date: "2026-04-28",
    category: "Wellbeing",
  },
  {
    src: "/photos/photo-5.svg",
    caption: "Sustainability ideation sprint",
    date: "2026-04-14",
    category: "Sustainability",
  },
  {
    src: "/photos/photo-6.svg",
    caption: "Youth forum with cross-school delegates",
    date: "2026-03-22",
    category: "Events",
  },
];
