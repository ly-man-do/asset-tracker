export type ColorTheme =
  | "default"
  | "slate"
  | "red"
  | "rose"
  | "orange"
  | "amber"
  | "green"
  | "teal"
  | "blue"
  | "violet"
  | "purple"
  | "pink";

export const COLOR_THEMES: {
  id: ColorTheme;
  label: string;
  light: string;
  dark: string;
}[] = [
  { id: "default", label: "Default",  light: "oklch(0.205 0 0)",          dark: "oklch(0.922 0 0)" },
  { id: "slate",   label: "Slate",    light: "oklch(0.279 0.041 264.695)", dark: "oklch(0.869 0.022 252.894)" },
  { id: "red",     label: "Red",      light: "oklch(0.577 0.245 27.325)",  dark: "oklch(0.704 0.191 22.216)" },
  { id: "rose",    label: "Rose",     light: "oklch(0.586 0.253 17.585)",  dark: "oklch(0.712 0.194 13.428)" },
  { id: "orange",  label: "Orange",   light: "oklch(0.646 0.222 41.116)",  dark: "oklch(0.75 0.183 55.934)" },
  { id: "amber",   label: "Amber",    light: "oklch(0.555 0.163 48.998)",  dark: "oklch(0.828 0.189 84.429)" },
  { id: "green",   label: "Green",    light: "oklch(0.527 0.154 150.069)", dark: "oklch(0.696 0.17 162.48)" },
  { id: "teal",    label: "Teal",     light: "oklch(0.511 0.096 186.391)", dark: "oklch(0.704 0.14 182.503)" },
  { id: "blue",    label: "Blue",     light: "oklch(0.546 0.245 262.881)", dark: "oklch(0.707 0.165 254.624)" },
  { id: "violet",  label: "Violet",   light: "oklch(0.541 0.281 293.009)", dark: "oklch(0.702 0.183 293.541)" },
  { id: "purple",  label: "Purple",   light: "oklch(0.558 0.288 302.321)", dark: "oklch(0.714 0.203 305.504)" },
  { id: "pink",    label: "Pink",     light: "oklch(0.592 0.249 0.584)",   dark: "oklch(0.718 0.202 349.761)" },
];

export const COLOR_THEME_STORAGE_KEY = "asset-tracker-color-theme";
