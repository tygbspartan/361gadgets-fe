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

/* Store contact details, shown in the Footer and on the order confirmation. */
export const CONTACT = {
  address: "Kalopul, Kathmandu",
  phone: { label: "+977 976-8988420", tel: "+9779768988420" },
  email: "361gadgets.np@gmail.com",
} as const;

/* Official social profiles: the Footer icons and the Organization schema
   (sameAs), so Google can tie them to the store. */
export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/361gadgets_np/", icon: "mdi:instagram" },
  { label: "TikTok", href: "https://www.tiktok.com/@361gadgets.np", icon: "ic:baseline-tiktok" },
  { label: "Facebook", href: "https://www.facebook.com/np.361gadgets", icon: "mdi:facebook" },
] as const;
