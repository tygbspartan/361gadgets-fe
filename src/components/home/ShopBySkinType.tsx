import Link from "next/link";
import SectionTitle from "@/components/home/SectionTitle";
import { ROUTES } from "@/constants/routes";

const SKIN_TYPES = [
  { id: "normal", label: "NORMAL", image: "/assets/normal.png" },
  { id: "dry", label: "DRY", image: "/assets/dry.png" },
  { id: "oily", label: "OILY", image: "/assets/oily.png" },
  { id: "combination", label: "COMBINATION", image: "/assets/combination.png" },
  { id: "sensitive", label: "SENSITIVE", image: "/assets/sensitive.png" },
] as const;

export default function ShopBySkinType() {
  return (
    <div>
      <SectionTitle>Shop by Skin Type</SectionTitle>

      <div className="mt-5 lg:mt-8.75 w-full group grid grid-cols-3 lg:grid-cols-5">
        {SKIN_TYPES.map((skin) => (
          <Link
            key={skin.id}
            href={`${ROUTES.PRODUCTS}?skinType=${skin.id}`}
            className="relative block w-full aspect-1/2 max-h-150 [container-type:size] overflow-hidden hover:[&>.skin-overlay]:opacity-0"
          >
            {/* Background photo (fallback color while/if image is missing) */}
            <div className="absolute inset-0 bg-[#caa] " />
            <img
              src={skin.image}
              alt={`${skin.label} skin type`}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Darkening overlay — shown on the other cards when any card is hovered */}
            <div className="skin-overlay absolute inset-0 bg-[#00000099] opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

            {/* Vertical label */}
            <span
              className="absolute top-4 right-0 lg:top-8 font-montserrat font-semibold uppercase select-none pointer-events-none text-[10cqh] leading-none tracking-wide"
              style={{ writingMode: "vertical-rl", color: "#f1e4de" }}
            >
              {skin.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
