import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { BRAND } from "@/config/brand";

// Poppins is the body default font, so we only set weight/size/spacing here.
const headingClass =
  "font-medium text-[14px] lg:text-[16px] leading-none tracking-[0.01em] text-white";
const linkClass =
  "font-medium text-[14px] lg:text-[16px] leading-none tracking-[0.01em] text-[#747373] transition-colors hover:text-white";

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/dailydose_np/" },
  { label: "Tiktok", href: "https://www.tiktok.com/@dailydose.np" },
  { label: "Facebook", href: "https://www.facebook.com/np.dailydose" },
];

const legalLinks = [
  { label: "Policies", href: ROUTES.POLICIES },
  { label: "Terms and Condition", href: ROUTES.TERMS },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#191919" }} className="text-white">
      <div className="page-wrapper pt-12 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Daily Dose info */}
          <div className="max-w-md">
            <Image
              src={BRAND.logo.secondary}
              alt={BRAND.name}
              width={200}
              height={65}
              priority={false}
              className="w-29.5 h-auto lg:w-auto lg:h-16.25"
            />
            <p className="mt-2.5 font-normal text-[14px] lg:text-[16px] leading-7.5 text-[#747373]">
              {BRAND.description}
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Social Media */}
            <div>
              <h4 className={headingClass}>Social Media</h4>
              <ul className="flex flex-col gap-2.5 mt-3.75">
                {socialLinks.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Information */}
            <div>
              <h4 className={headingClass}>Legal Information</h4>
              <ul className="flex flex-col gap-2.5 mt-3.75">
                {legalLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacts */}
            <div>
              <h4 className={headingClass}>Contacts</h4>
              <ul className="flex flex-col gap-2.5 mt-3.75">
                <li className={linkClass}>Kalopul, Kathmandu</li>
                <li>
                  <a href="tel:+9779768988420" className={linkClass}>
                    +977 976-8988420
                  </a>
                </li>
                <li>
                  <a href="mailto:dailydose.np@gmail.com" className={linkClass}>
                    dailydose.np@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="page-wrapper pb-3.75 flex flex-col lg:flex-row lg:justify-center lg:gap-1">
        <p className="text-center font-normal text-[12px] leading-none text-white">
          © 2026 Daily Dose. All rights reserved.
        </p>
        <p className="text-center font-normal text-[12px] leading-none text-white mt-1 lg:mt-0">
          Developed by{" "}
          <span style={{ color: "var(--color-primary)" }}>Fibi Space</span>.
        </p>
      </div>
    </footer>
  );
}
