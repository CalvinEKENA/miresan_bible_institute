import { type SVGProps } from "react";

/**
 * Jeu d'icônes maison : trait fin 1.3, terminaisons rondes, grille 24.
 * Dessinées pour l'Institut (livre, plume, sceau…) plutôt qu'un pack générique.
 */
const PATHS = {
  today: "M3 17h18M6 17a6 6 0 0 1 12 0M12 5v2.5M5.2 9.2l1.6 1.6M18.8 9.2l-1.6 1.6M3 20.5h18",
  book: "M12 6.5C9.8 5 6.5 4.6 3.5 5.2v13c3-.6 6.3-.2 8.5 1.3 2.2-1.5 5.5-1.9 8.5-1.3v-13c-3-.6-6.3-.2-8.5 1.3Zm0 0v13",
  calendar: "M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4M8 14h2M12 14h2M16 14h.5M8 17h2M12 17h2",
  quill: "M19.5 4.5c-6 .5-10.5 4.8-12 12.5l1.8.2c1-2.2 2.3-3.6 4.4-4.3M19.5 4.5c-.3 3.8-2.3 6.8-6 8.2M19.5 4.5 7.5 17 5 19.5M4.5 20h7",
  seal: "M12 3.5a6 6 0 1 1 0 12 6 6 0 0 1 0-12ZM9 14.7 7.5 20.5l4.5-2 4.5 2-1.5-5.8M12 7l.9 1.9 2.1.3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L9 9.2l2.1-.3Z",
  library: "M4.5 19.5v-14h3v14M7.5 19.5v-12h3v12M11.5 19.8 14.4 6.3l2.9.6-2.9 13.5M3.5 19.5h17",
  envelope: "M3.5 6.5h17v11h-17zM3.8 7l8.2 6.5L20.2 7",
  person: "M12 12a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6ZM4.5 20c.9-3.6 3.9-5.5 7.5-5.5s6.6 1.9 7.5 5.5",
  people: "M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11ZM3 19.5c.7-3 3.1-4.7 6-4.7s5.3 1.7 6 4.7M15.5 5a3 3 0 0 1 0 5.8M17.2 14.6c2 .5 3.4 2 3.8 4.4",
  door: "M6 20.5V6a6 6 0 0 1 12 0v14.5M4 20.5h16M14 13.5h.01",
  chalk: "M3.5 5.5h17v11h-17zM8 20.5l2-4M16 20.5l-2-4M7 9.5h6M7 12.5h9",
  layers: "M12 4 3.5 8.5 12 13l8.5-4.5L12 4ZM3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5",
  checklist: "M9.5 7h10M9.5 12h10M9.5 17h10M4.5 7l1.2 1.2L7.8 6M4.5 12l1.2 1.2 2.1-2.2M4.5 17l1.2 1.2 2.1-2.2",
  chart: "M4 20.5h16M6.5 17v-5M11 17V7.5M15.5 17v-7M20 17V4.5",
  presence: "M4.5 5.5h15v14h-15zM8 3.5v4M16 3.5v4M8.5 13.5l2.3 2.3 4.7-4.8",
  scroll: "M7 4.5h11a2 2 0 0 1 0 4h-2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1h10v1a2 2 0 0 0 2 2M7 4.5a2 2 0 0 0-2 2v11M9 9h5M9 12.5h5",
  compass: "M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM15.5 8.5l-2 5-5 2 2-5 5-2Z",
  coins: "M9 10c3.3 0 6-1.1 6-2.5S12.3 5 9 5 3 6.1 3 7.5 5.7 10 9 10ZM3 7.5v4C3 12.9 5.7 14 9 14s6-1.1 6-2.5v-4M9 18c-3.3 0-6-1.1-6-2.5v-4M15 11.5c3.3 0 6 1.1 6 2.5s-2.7 2.5-6 2.5c-1.2 0-2.3-.1-3.2-.4M21 14v3.5c0 1.4-2.7 2.5-6 2.5s-6-1.1-6-2.5",
  document: "M6.5 3.5h7l4 4v13h-11zM13.5 3.5v4h4M9 12h6M9 15.5h6",
  megaphone: "M4 10v4h3l7 4.5v-13L7 10H4ZM17.5 9a4 4 0 0 1 0 6M8 14l1 5.5",
  cog: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 2.8v2.5M12 18.7v2.5M4.1 7.4l2.2 1.2M17.7 15.4l2.2 1.2M4.1 16.6l2.2-1.2M17.7 8.6l2.2-1.2",
  bell: "M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2h-14l1.5-2ZM10 20.5a2 2 0 0 0 4 0",
  search: "M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM15.5 15.5l5 5",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  menu: "M3.5 7h17M3.5 12h17M3.5 17h11",
  close: "M5.5 5.5l13 13M18.5 5.5l-13 13",
  logout: "M14.5 7.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v14A1.5 1.5 0 0 0 5 20.5h8a1.5 1.5 0 0 0 1.5-1.5v-2.5M10 12h10.5M17.5 8.5 21 12l-3.5 3.5",
  arrowRight: "M4 12h15M14 7l5 5-5 5",
  arrowLeft: "M20 12H5M10 7l-5 5 5 5",
  play: "M8 5.5v13l10.5-6.5L8 5.5Z",
  clock: "M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM12 7.5V12l3 2",
  pin: "M12 21s6.5-5.8 6.5-11a6.5 6.5 0 1 0-13 0c0 5.2 6.5 11 6.5 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  bookmark: "M6.5 3.5h11v17L12 16.5l-5.5 4v-17Z",
  highlight: "M14.5 4.5l5 5-8.5 8.5H6v-5l8.5-8.5ZM4 20.5h16",
  note: "M4.5 4.5h15v10l-5 5h-10zM14.5 19.5v-5h5",
  focus: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5",
  type: "M4 7V5h11v2M9.5 5v14M7 19h5M14 12v-1.5h7V12M17.5 10.5V19M16 19h3",
  check: "M4.5 12.5l4.5 4.5L19.5 7",
  alert: "M12 4 2.8 19.5h18.4L12 4ZM12 10v4.5M12 17h.01",
  headphones: "M4.5 17v-4a7.5 7.5 0 0 1 15 0v4M4.5 15.5h3v5h-3zM16.5 15.5h3v5h-3z",
  video: "M3.5 6.5h12v11h-12zM15.5 10.5l5-3v9l-5-3",
  pdf: "M6.5 3.5h7l4 4v13h-11zM13.5 3.5v4h4M8.5 16.5v-4h1.2a1.2 1.2 0 0 1 0 2.4H8.5M12.5 16.5v-4h.8a2 2 0 0 1 0 4h-.8Z",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4",
  moon: "M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10Z",
  chevronDown: "M6 9.5l6 6 6-6",
  chevronRight: "M9.5 6l6 6-6 6",
  lock: "M6.5 10.5h11v10h-11zM8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "size-5"}
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
