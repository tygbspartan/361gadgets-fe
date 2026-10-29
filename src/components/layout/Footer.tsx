import Image from "next/image";
import { Icon } from "@iconify/react";
import { BRAND } from "@/config/brand";
import FooterSitemap from "@/components/layout/FooterSitemap";

const CONTACT = {
  address: "Kalopul, Kathmandu",
  phone: { label: "+977 976-8988420", tel: "+9779768988420" },
  email: "361gadgets.np@gmail.com",
};

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/361gadgets_np/", icon: "mdi:instagram" },
  { label: "TikTok", href: "https://www.tiktok.com/@361gadgets.np", icon: "ic:baseline-tiktok" },
  { label: "Facebook", href: "https://www.facebook.com/np.361gadgets", icon: "mdi:facebook" },
];

/* The studio that built the site, credited in the bottom bar. */
const FIBISPACE_URL = "https://fibispace.com";

const headingClass = "font-montserrat text-xl font-medium text-gray-200 lg:text-[22px]";

export default function Footer() {
  return (
    /*
     * The one dark surface on a light site. At least one screen tall with the
     * content centred, so the bottom of every page ends on a full-screen
     * footer. Navbar finds it by id and fades itself out once the footer
     * reaches it, so nothing sits on top of it.
     *
     * Below md everything is centred in one column; from md it's two columns,
     * left-aligned.
     */
    <footer id="site-footer" className="flex min-h-dvh flex-col bg-(--chrome-dark) text-gray-400">
      {/* Top padding keeps the wordmark clear of the navbar, which stays over
          the footer as just the (white) logo — see stepAside in Navbar. */}
      <div className="page-wrapper @container flex flex-1 flex-col justify-center pt-20 text-center md:text-left lg:pt-28 short:lg:pt-24">
        {/* The wordmark, spanning the content width at every size: the text
            is ~6.8em wide in Montserrat ExtraBold, so 14.5% of the container
            width would fill it; 11% keeps it to about three-quarters. On very short windows it's also capped by the
            height left after the rest of the footer (~33rem), so the footer
            still fits one screen. Decorative: the name is in the copyright. */}
        <p
          aria-hidden
          className="font-montserrat text-[min(11cqw,calc((100dvh-33rem)/0.85))] font-extrabold uppercase leading-[0.85] tracking-tight whitespace-nowrap text-white"
        >
          361 Gadgets
        </p>

        <p className="mt-6 font-inter text-sm text-gray-400 lg:text-base short:mt-4">
          {BRAND.description.trim()}
        </p>

        <hr className="mt-8 border-white/15 lg:mt-10 short:mt-6 short:lg:mt-6" />

        <div className="grid gap-12 py-10 md:grid-cols-2 short:gap-8 short:py-6">
          <section>
            <h2 className={headingClass}>Get in touch</h2>
            <address className="mt-6 space-y-1.5 font-inter text-base not-italic">
              <p>{CONTACT.address}</p>
              <p>
                <a
                  href={`tel:${CONTACT.phone.tel}`}
                  data-cursor="Call us"
                  className="whitespace-nowrap transition-colors hover:text-white"
                >
                  {CONTACT.phone.label}
                </a>
              </p>
              <a
                href={`mailto:${CONTACT.email}`}
                data-cursor="Email us"
                className="mx-auto block w-fit transition-colors hover:text-white md:mx-0"
              >
                {CONTACT.email}
              </a>
            </address>
          </section>

          <div className="space-y-10 short:space-y-6">
            <section>
              <h2 className={headingClass}>Sitemap</h2>
              <FooterSitemap />
            </section>

            <section>
              <h2 className={headingClass}>Follow us on</h2>
              <ul className="mt-6 flex flex-wrap justify-center gap-6 sm:gap-8 md:justify-start">
                {SOCIALS.map(({ label, href, icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={label}
                      title={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-white transition-opacity hover:opacity-70"
                    >
                      <Icon icon={icon} className="size-7" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>

      {/* Copyright and the site credit: side by side with a divider on wider
          screens, one above the other on phones. */}
      <div className="flex flex-col items-center justify-center gap-2 px-4 pt-6 pb-8 text-center font-inter short:pt-4 short:pb-5 text-sm text-gray-400 sm:flex-row sm:gap-4 sm:text-base">
        <p>
          All Rights Reserved @{new Date().getFullYear()} {BRAND.name}.
        </p>
        <span aria-hidden className="hidden h-4 w-px bg-white/25 sm:block" />
        <a
          href={FIBISPACE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-sm outline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white"
        >
          Powered by Fibispace
          <Image src="/fibispace-logo.png" alt="" width={868} height={866} sizes="16px" className="size-4" />
        </a>
      </div>
    </footer>
  );
}
