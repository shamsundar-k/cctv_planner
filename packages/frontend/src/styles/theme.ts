export const themeOptions = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "blue", label: "Blue" },
  { id: "green", label: "Green" },
  { id: "high-contrast", label: "High Contrast" },
] as const;

export type Theme = (typeof themeOptions)[number]["id"];

export const defaultTheme: Theme = "light";

const themeIds = new Set<Theme>(themeOptions.map((theme) => theme.id));

export function isTheme(value: string): value is Theme {
  return themeIds.has(value as Theme);
}
