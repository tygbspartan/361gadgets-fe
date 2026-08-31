// primaryColor is injected as --color-primary CSS variable in layout.tsx,
// so changing it here updates the entire project automatically.
export const BRAND = {
  name: "361 Gadgets",
  /* Near-black, not pure #000: the palette is monochrome, so this is the black
     CTA fill, the accent underline and the focus ring all at once. */
  primaryColor: "#111111",
  description:
    "​No fakes. No compromises. Just premium, original tech.",
  /*
   * Monochrome wordmark, picked per surface rather than per brand role:
   *   primary   -> black art, for the light surfaces (Navbar, AdminSidebar)
   *   secondary -> white art, for the dark Footer
   * The two-tone red/black originals stay in /public/logos but are unused.
   */
  logo: {
    primary: "/logos/logoSecondaryBlack.png",
    secondary: "/logos/logoSecondaryWhite.png",
    /*
     * The disc mark, used as a background watermark. Two tones because the
     * surfaces behind it differ: markOnLight is the black art for white pages,
     * markOnDark the white art for the hero while it is still dark.
     */
    markOnLight: "/logos/logoPrimaryBlack.png",
    markOnDark: "/logos/logoPrimaryWhite.png",
  },
} as const;
