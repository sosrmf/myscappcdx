// Athletic, dark-first theme. Single source of truth for colors / spacing.

export const colors = {
  bg: "#0a0a0c",
  bgElev: "#13141a",
  bgElev2: "#1a1c24",
  border: "#26283180",
  text: "#f5f5f7",
  textMuted: "#9aa0aa",
  textDim: "#6b7280",
  accent: "#e11d2e", // combat red
  accent2: "#f59e0b",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  jjb: "#e11d2e",
  strength: "#3b82f6",
  conditioning: "#22c55e",
  mobility: "#8b5cf6",
  rest: "#6b7280",
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
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
} as const;

export const font = {
  display: 28,
  title: 22,
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
