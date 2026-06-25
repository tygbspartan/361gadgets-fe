// primaryColor is injected as --color-primary CSS variable in layout.tsx,
// so changing it here updates the entire project automatically.
export const BRAND = {
  name: "Daily Dose",
  primaryColor: "#bf1e2e",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Daily Dose brings you quality products delivered to your doorstep. Placeholder description text to be updated soon.",
  logo: {
    primary: "/logos/logoPrimary.png",
    secondary: "/logos/logoSecondary.png",
  },
} as const;
