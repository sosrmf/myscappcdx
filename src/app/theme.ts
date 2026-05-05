export const colors = {
  bg: "#080a0d",
  bgElev: "#0f1219",
  bgElev2: "#161b25",
  border: "#ffffff14",
  borderStrong: "#ffffff28",
  text: "#f0f4f8",
  textMuted: "#8892a4",
  textDim: "#4d5566",
  accent: "#00c2a8",
  accent2: "#5b8dee",
  success: "#00d483",
  warning: "#ffa84c",
  danger: "#ff4d6d",
  info: "#5b8dee",
  jjb: "#ff4d6d",
  strength: "#5b8dee",
  conditioning: "#00d483",
  mobility: "#c084fc",
  rest: "#4d5566",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
} as const;

export const font = {
  display: 32,
  title: 24,
  h1: 20,
  h2: 17,
  body: 15,
  small: 13,
  tiny: 11,
} as const;

export function sessionTypeColor(t: string): string {
  switch (t) {
    case "jjb":
      return colors.jjb;
    case "strength":
      return colors.strength;
    case "conditioning":
      return colors.conditioning;
    case "mobility":
    case "recovery":
      return colors.mobility;
    default:
      return colors.rest;
  }
}
